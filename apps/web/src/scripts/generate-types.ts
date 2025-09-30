import fs from "node:fs";
import path from "node:path";
import chokidar from "chokidar";

const TS_EXTENSION_REGEX = /\.ts$/;
const REMOVE_LEADING_DOT = /^\.\//;

const schemasDir = path.resolve("src/lib/schemas");
const outputFile = path.resolve("src/lib/types.ts");

// Ensure directories exist
if (!fs.existsSync(schemasDir)) {
  fs.mkdirSync(schemasDir, { recursive: true });
}
if (!fs.existsSync(path.dirname(outputFile))) {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
}

function getAllSchemaFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return getAllSchemaFiles(fullPath);
    }
    return entry.isFile() && TS_EXTENSION_REGEX.test(entry.name)
      ? [fullPath]
      : [];
  });
}

function extractSchemaNames(content: string): string[] {
  // Match exported const/var/let declarations that are Zod schemas
  // Matches: z., createSelectSchema, createInsertSchema, etc.
  const matches = content.matchAll(
    /export\s+(?:const|var|let)\s+(\w+)\s*=\s*(?:z\.|createSelectSchema|createInsertSchema)/g
  );
  return Array.from(matches).map((match) => match[1]);
}

function getTypeName(schemaName: string): string {
  // If it ends with "Schema", remove it
  if (schemaName.endsWith("Schema")) {
    return schemaName.slice(0, -6); // Remove "Schema" (6 characters)
  }
  // Otherwise, keep the name as is
  return schemaName;
}

function generateTypes() {
  console.log("🔄 Generating types...");

  if (!fs.existsSync(schemasDir)) {
    console.warn(`Schemas directory ${schemasDir} does not exist`);
    return;
  }

  const files = getAllSchemaFiles(schemasDir);
  const imports = new Set<string>();
  const types = new Set<string>();

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf-8");
      const schemaNames = extractSchemaNames(content);

      if (schemaNames.length === 0) continue;

      // Calculate the import path using @ alias
      // Get the relative path from the schemas directory
      const relPath = path
        .relative(schemasDir, file)
        .replace(/\\/g, "/")
        .replace(TS_EXTENSION_REGEX, "");

      // Remove any leading "./" and get the directory name
      const dirName = path.dirname(relPath.replace(REMOVE_LEADING_DOT, ""));

      // If the file is directly in the schemas directory, use just the basename
      // Otherwise, use the directory structure
      const importPath =
        dirName === "."
          ? `@/lib/schemas/${path.basename(relPath)}`
          : `@/lib/schemas/${relPath}`;

      for (const schemaName of schemaNames) {
        const typeName = getTypeName(schemaName);
        imports.add(`import type { ${schemaName} } from "${importPath}";`);
        types.add(
          `export type ${typeName}Type = z.infer<typeof ${schemaName}>;`
        );
      }
    } catch (error) {
      console.warn(`Could not process file ${file}:`, error);
    }
  }

  const output = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Run \`bun run generate:types\` to refresh
import type { z } from "zod";

${Array.from(imports).sort().join("\n")}

${Array.from(types).sort().join("\n\n")}
`;

  // Only write if content changed
  const currentContent = fs.existsSync(outputFile)
    ? fs.readFileSync(outputFile, "utf-8")
    : "";
  if (currentContent !== output) {
    fs.writeFileSync(outputFile, output);
    console.log(`✅ Types written to ${outputFile}`);
  } else {
    console.log("✅ No changes detected");
  }
}

// Initial generation
generateTypes();

const shouldWatch =
  process.argv.includes("--watch") || process.argv.includes("-w");

if (shouldWatch) {
  const watcher = chokidar.watch(schemasDir, {
    ignored: /(^|[/\\])node_modules[/\\]/,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100,
    },
  });

  const handleChange = (filePath: string) => {
    console.log(
      `Detected change in: ${path.relative(process.cwd(), filePath)}`
    );
    generateTypes();
  };

  watcher
    .on("add", handleChange)
    .on("change", handleChange)
    .on("unlink", handleChange)
    .on("error", (error) => console.error("Watcher error:", error));

  // Graceful shutdown
  const shutdown = () => {
    watcher.close().then(() => {
      console.log("✅ Watcher closed successfully");
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
