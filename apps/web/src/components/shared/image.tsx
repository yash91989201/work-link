import type React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { cn } from "@/lib/utils";

type ImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  wrapperClassName?: string;
  effect?: "blur" | "opacity" | "black-and-white";
  visibleByDefault?: boolean;
  aspectRatio?: number; // e.g., 16/9, 4/3, 1 for square
  placeholder?: boolean; // enable/disable low quality placeholder
  unoptimized?: boolean; // bypass transformation service
  format?: "webp" | "avif" | undefined;
  priority?: boolean; // load image immediately
};

// Build image URL using Coolify's transformation service
const buildImageUrl = (options: {
  src: string;
  width?: number;
  quality?: number;
  unoptimized?: boolean;
  format?: "webp" | "avif" | undefined;
}): string => {
  const {
    src,
    width,
    quality = 75,
    unoptimized = false,
    format = "webp",
  } = options;

  if (unoptimized) return src;

  // Skip transformation for external URLs, data URLs, or in development
  if (
    !src.startsWith("/") ||
    process.env.NODE_ENV === "development" ||
    src.startsWith("data:")
  ) {
    return src;
  }

  const params = new URLSearchParams();
  if (width) params.set("width", width.toString());
  params.set("quality", quality.toString());
  params.set("format", format);

  // Assuming your transformation service URL is in env
  const baseUrl = process.env.VITE_IMAGE_TRANSFORMATION_URL || "";
  const encodedSrc = encodeURIComponent(`${window.location.origin}${src}`);

  return `${baseUrl}/image/${encodedSrc}?${params}`;
};

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 75,
  className = "",
  wrapperClassName = "",
  effect = "blur",
  visibleByDefault = false,
  aspectRatio,
  placeholder = true,
  unoptimized = false,
  format = "webp",
  priority = false,
}) => {
  // Calculate dimensions for CLS prevention
  const computedHeight =
    height ??
    (width && aspectRatio ? Math.round(width / aspectRatio) : undefined);

  // Ensure we have either width/height or aspectRatio to prevent CLS
  const shouldUseAspectRatio = aspectRatio && !(width && height);

  // Generate main image URL
  const mainSrc = buildImageUrl({ src, width, quality, unoptimized, format });

  // Generate low-quality placeholder URL (same image, quality 15)
  const placeholderSrc =
    placeholder && !unoptimized
      ? buildImageUrl({
          src,
          width: width ? Math.round(width * 0.1) : 50,
          quality: 15,
          unoptimized,
          format,
        })
      : undefined;

  // Container styles for aspect ratio and CLS prevention
  const containerStyle: React.CSSProperties = {
    display: "block",
    ...(shouldUseAspectRatio && { aspectRatio: aspectRatio.toString() }),
    ...(!shouldUseAspectRatio && width && { width }),
    ...(!shouldUseAspectRatio && computedHeight && { height: computedHeight }),
    ...(!(shouldUseAspectRatio || width || computedHeight) && {
      width: "100%",
      height: "auto",
    }),
  };

  // Wrapper props for the span container
  const wrapperProps = {
    style: containerStyle,
  };

  return (
    <LazyLoadImage
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      effect={effect}
      height={computedHeight}
      placeholderSrc={placeholderSrc}
      src={mainSrc}
      visibleByDefault={visibleByDefault || priority}
      width={width}
      wrapperClassName={cn("block overflow-hidden", wrapperClassName)}
      wrapperProps={wrapperProps}
    />
  );
};
