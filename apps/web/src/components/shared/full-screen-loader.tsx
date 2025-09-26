import { cn } from "@/lib/utils";

interface FullScreenLoaderProps {
  className?: string;
}

export function FullScreenLoader({ className }: FullScreenLoaderProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <picture className="relative">
          <img
            alt="Loading"
            className="animate-pulse"
            height={160}
            src="/logo.webp"
            width={160}
          />
        </picture>

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
