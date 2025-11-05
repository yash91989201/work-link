import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LinkPreviewData {
  title: string;
  description: string;
  image: string;
  favicon: string;
  url: string;
}

interface LinkPreviewAttrs {
  url: string;
}

export function LinkPreviewComponent(props: NodeViewProps) {
  const [linkPreview, setLinkPreview] = useState<LinkPreviewData | null>(null);

  const url = (props.node.attrs as LinkPreviewAttrs).url;

  console.log('[LinkPreviewComponent] Rendered with URL:', url);

  const fetchLinkPreview = useCallback((url: string) => {
    console.log('[LinkPreviewComponent] Fetching preview for:', url);
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace("www.", "");

      setLinkPreview({
        title: domain,
        description: url,
        image: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        url: domain,
      });
      console.log('[LinkPreviewComponent] Preview set successfully');
    } catch (error) {
      console.error("[LinkPreviewComponent] Failed to fetch link preview:", error);
      setLinkPreview(null);
    }
  }, []);

  useEffect(() => {
    console.log('[LinkPreviewComponent] useEffect triggered, URL:', url);
    if (url) {
      fetchLinkPreview(url);
    }
  }, [url, fetchLinkPreview]);

  const handleClose = useCallback(() => {
    console.log('[LinkPreviewComponent] Close button clicked');
    if (props.deleteNode) {
      props.deleteNode();
      console.log('[LinkPreviewComponent] deleteNode called');
    } else {
      console.error('[LinkPreviewComponent] deleteNode is not available');
    }
  }, [props]);

  console.log('[LinkPreviewComponent] linkPreview state:', linkPreview);

  if (!linkPreview) {
    console.log('[LinkPreviewComponent] Not rendering - no linkPreview yet');
    return null;
  }

  console.log('[LinkPreviewComponent] Rendering preview card');

  return (
    <NodeViewWrapper className="link-preview-wrapper">
      <Card className="my-2 w-80 shadow-lg">
        <CardContent className="p-3">
          <div className="relative">
            <Button
              className="absolute top-0 right-0 h-5 w-5"
              onClick={handleClose}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X className="h-3 w-3" />
            </Button>

            <div className="flex gap-3">
              {linkPreview.image && (
                <img
                  alt={linkPreview.title}
                  className="h-16 w-16 shrink-0 rounded object-cover"
                  height={64}
                  src={linkPreview.image}
                  width={64}
                />
              )}

              <div className="flex min-w-0 flex-1 flex-col gap-1.5 pr-6">
                <div className="flex items-center gap-1.5">
                  {linkPreview.favicon && (
                    <img
                      alt=""
                      className="h-4 w-4 shrink-0"
                      height={16}
                      src={linkPreview.favicon}
                      width={16}
                    />
                  )}
                  <p className="truncate font-semibold text-sm">
                    {linkPreview.title}
                  </p>
                </div>
                <p className="line-clamp-1 text-muted-foreground text-xs">
                  {linkPreview.description}
                </p>
                <p className="truncate text-muted-foreground text-xs">
                  {linkPreview.url}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </NodeViewWrapper>
  );
}
