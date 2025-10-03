import { cn } from "@/lib/utils";
import { Image } from "./image";

interface FullScreenLoaderProps {
  className?: string;
}

export function FullScreenLoader({ className }: FullScreenLoaderProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <picture className="relative">
          <Image
            alt="Work Link logo"
            height={240}
            src="/logo.webp"
            width={240}
          />
        </picture>
        <h1 className="font-bold text-2xl text-foreground lg:text-3xl">
          Work Link
        </h1>

        <div className="flex space-x-1">
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
