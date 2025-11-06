import { supabase } from "@/lib/supabase";

export interface UploadResult {
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  bucket: string;
}

export async function uploadToSupabase(
  file: File,
  bucket: "message-attachment" | "message-audio",
  userId: string
): Promise<UploadResult> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return {
    fileName,
    originalName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    url: publicUrl,
    bucket,
  };
}
