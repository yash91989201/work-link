import fs from "node:fs";
import path from "node:path";
import chokidar from "chokidar";

// Regex patterns
const TS_EXTENSION_REGEX = /\.ts$/;
const SCHEMA_EXPORT_REGEX =
  /export\s+(?:const|var|let)\s+(\w+(?:Schema|Input|Output))\s*=/g;
const SIMPLE_SCHEMA_REGEX = /Schema$/;

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
    if (entry.isDirectory()) return getAllSchemaFiles(fullPath);
    return entry.isFile() && TS_EXTENSION_REGEX.test(entry.name)
      ? [fullPath]
      : [];
  });
}

function extractSchemaNames(content: string): string[] {
  // Match exported variables ending with Schema, Input, or Output
  return Array.from(content.matchAll(SCHEMA_EXPORT_REGEX))
    .map((match) => match[1])
    .filter((name): name is string => name !== undefined);
}

function getTypeName(schemaName: string): string {
  // For schemas ending with "Schema", remove "Schema" and add "Type"
  // This handles both simple DB schemas (UserSchema -> UserType)
  // and operation schemas (AttendanceUpdateSchema -> AttendanceUpdateType)
  if (SIMPLE_SCHEMA_REGEX.test(schemaName)) {
    return `${schemaName.slice(0, -6)}Type`;
  }

  // For all other schemas (Input, Output, etc.), keep the full name and add "Type"
  // e.g., CreateChannelFormInput -> CreateChannelFormInputType
  return `${schemaName}Type`;
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

      // Get relative path from schemas directory
      const relPath = path
        .relative(schemasDir, file)
        .replace(/\\/g, "/")
        .replace(TS_EXTENSION_REGEX, "");

      const importPath = `@/lib/schemas/${relPath}`;

      for (const schemaName of schemaNames) {
        const typeName = getTypeName(schemaName);
        imports.add(`import type { ${schemaName} } from "${importPath}";`);
        types.add(`export type ${typeName} = z.infer<typeof ${schemaName}>;`);
      }
    } catch (error) {
      console.warn(`Could not process file ${file}:`, error);
    }
  }

  const output = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Run \`bun run generate:types\` to refresh
import type { z } from "zod";

${Array.from(imports).sort().join("\n")}

${Array.from(types).sort().join("\n")}
`;

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

// Watch mode
if (process.argv.includes("--watch") || process.argv.includes("-w")) {
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

  const shutdown = () => {
    watcher.close().then(() => {
      console.log("✅ Watcher closed successfully");
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log("👀 Watching for changes...");
}
