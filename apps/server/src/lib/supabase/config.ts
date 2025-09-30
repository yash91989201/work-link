// Storage bucket configurations
export const STORAGE_BUCKETS = {
  ATTACHMENTS: "message-attachments",
  AVATARS: "user-avatars",
  THUMBNAILS: "thumbnails",
} as const;

// Real-time channel configurations
export const REALTIME_CHANNELS = {
  MESSAGES: "messages",
  PRESENCE: "presence",
  NOTIFICATIONS: "notifications",
} as const;

// File upload configuration
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_MIME_TYPES: [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    // Archives
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    // Audio
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    // Video
    "video/mp4",
    "video/webm",
    "video/ogg",
  ],
  THUMBNAIL_SIZES: {
    SMALL: { width: 150, height: 150 },
    MEDIUM: { width: 300, height: 300 },
    LARGE: { width: 600, height: 600 },
  },
} as const;
