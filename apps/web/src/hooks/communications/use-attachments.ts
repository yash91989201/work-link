import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryUtils } from "@/utils/orpc";

// Query hooks
export const useAttachment = (attachmentId: string) => {
  return queryUtils.communication.attachments.getAttachment.useQuery(
    {
      attachmentId,
    },
    {
      enabled: !!attachmentId,
    }
  );
};

export const useMessageAttachments = (messageId: string) => {
  return queryUtils.communication.attachments.getMessageAttachments.useQuery(
    {
      messageId,
    },
    {
      enabled: !!messageId,
    }
  );
};

export const useChannelAttachments = (
  channelId: string,
  filters?: {
    type?: "image" | "video" | "audio" | "document" | "other";
    limit?: number;
  }
) => {
  return queryUtils.communication.attachments.getChannelAttachments.useQuery(
    {
      channelId,
      limit: filters?.limit || 50,
      offset: 0,
      type: filters?.type,
    },
    {
      enabled: !!channelId,
    }
  );
};

export const useUserAttachments = (
  userId: string,
  filters?: {
    type?: "image" | "video" | "audio" | "document" | "other";
    limit?: number;
  }
) => {
  return queryUtils.communication.attachments.getUserAttachments.useQuery(
    {
      userId,
      limit: filters?.limit || 50,
      offset: 0,
      type: filters?.type,
    },
    {
      enabled: !!userId,
    }
  );
};

// Mutation hooks with progress tracking
export const useUploadAttachment = () => {
  const queryClient = useQueryClient();

  return queryUtils.communication.attachments.uploadAttachment.useMutation({
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "communications" &&
          query.queryKey[1] === "attachments",
      });

      // If associated with a message, invalidate message attachments
      if (variables.messageId) {
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "communications" &&
            query.queryKey[1] === "attachments" &&
            query.queryKey[2] === "getMessageAttachments",
        });
      }

      // If associated with a channel, invalidate channel attachments
      if (variables.channelId) {
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "communications" &&
            query.queryKey[1] === "attachments" &&
            query.queryKey[2] === "getChannelAttachments",
        });
      }

      toast.success("File uploaded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to upload file: ${error.message}`);
    },
  });
};

// Custom hook for file upload with progress tracking
export const useFileUpload = () => {
  const uploadMutation = useUploadAttachment();

  const uploadFile = async (
    file: File,
    options: {
      messageId?: string;
      channelId?: string;
      onProgress?: (progress: number) => void;
    }
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (options.messageId) formData.append("messageId", options.messageId);
    if (options.channelId) formData.append("channelId", options.channelId);

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && options.onProgress) {
          const progress = (event.loaded / event.total) * 100;
          options.onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (error) {
            reject(new Error("Invalid response format"));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.onabort = () => reject(new Error("Upload cancelled"));

      // This would need to match your actual upload endpoint
      xhr.open("POST", "/api/communications/attachments/upload");
      xhr.send(formData);
    });
  };

  return {
    uploadFile,
    isUploading: uploadMutation.isPending,
    error: uploadMutation.error,
  };
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();

  return queryUtils.communication.attachments.deleteAttachment.useMutation({
    onMutate: async (variables) => {
      // Optimistically remove attachment from caches
      queryClient.setQueryData(
        queryUtils.communication.attachments.getAttachment.getQueryKey({
          attachmentId: variables.attachmentId,
        }),
        null
      );

      // Remove from message attachments if applicable
      if (variables.messageId) {
        queryClient.setQueryData(
          queryUtils.communication.attachments.getMessageAttachments.getQueryKey(
            {
              messageId: variables.messageId,
            }
          ),
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              attachments: old.attachments.filter(
                (a: any) => a.id !== variables.attachmentId
              ),
            };
          }
        );
      }
    },
    onSuccess: () => {
      // Invalidate all attachment queries
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "communications" &&
          query.queryKey[1] === "attachments",
      });

      toast.success("Attachment deleted successfully");
    },
    onError: (error, variables) => {
      // Revert optimistic updates
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "communications" &&
          query.queryKey[1] === "attachments",
      });
      toast.error(`Failed to delete attachment: ${error.message}`);
    },
  });
};

export const useUpdateAttachment = () => {
  const queryClient = useQueryClient();

  return queryUtils.communication.attachments.updateAttachment.useMutation({
    onMutate: async (variables) => {
      // Optimistically update the attachment
      queryClient.setQueryData(
        queryUtils.communication.attachments.getAttachment.getQueryKey({
          attachmentId: variables.attachmentId,
        }),
        (old: any) => {
          if (!old) return old;
          return { ...old, ...variables };
        }
      );
    },
    onSuccess: (data) => {
      // Update the specific attachment cache
      queryClient.setQueryData(
        queryUtils.communication.attachments.getAttachment.getQueryKey({
          attachmentId: data.id,
        }),
        data
      );

      // Invalidate related queries
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "communications" &&
          query.queryKey[1] === "attachments",
      });

      toast.success("Attachment updated successfully");
    },
    onError: (error, variables) => {
      // Revert optimistic update
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "communications" &&
          query.queryKey[1] === "attachments",
      });
      toast.error(`Failed to update attachment: ${error.message}`);
    },
  });
};

// Utility hook for handling drag and drop file uploads
export const useDragAndDrop = (
  onFilesSelected: (files: File[]) => void,
  options?: {
    accept?: string[];
    maxSize?: number; // in bytes
    maxFiles?: number;
  }
) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const validFiles: File[] = [];

    for (const file of files) {
      // Check file type
      if (options?.accept && options.accept.length > 0) {
        const fileType = file.type || "";
        const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
        const isValidType = options.accept.some(
          (accept) => fileType.match(accept) || fileExtension === accept
        );

        if (!isValidType) {
          toast.error(`File type not supported: ${file.name}`);
          continue;
        }
      }

      // Check file size
      if (options?.maxSize && file.size > options.maxSize) {
        toast.error(
          `File too large: ${file.name} (max ${Math.round(options.maxSize / 1024 / 1024)}MB)`
        );
        continue;
      }

      validFiles.push(file);
    }

    // Check max files limit
    if (options?.maxFiles && validFiles.length > options.maxFiles) {
      toast.error(`Too many files selected (max ${options.maxFiles})`);
      return;
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  return {
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  };
};
