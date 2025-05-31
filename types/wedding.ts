export interface UploadedMedia {
  id: string;
  type: "image" | "video";
  url: string;
  name: string;
  uploadedAt: string | Date;
  thumbnail?: string;
  s3Key?: string;
  size?: number;
  guestName?: string;
  guestId?: string;
}

export interface UploadProgress {
  id: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  fileName?: string;
}

export interface MediaResponse {
  media: UploadedMedia[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

export interface S3UploadResponse {
  uploadUrl: string;
  key: string;
  fields: Record<string, string>;
}

export interface Guest {
  id: string;
  name: string;
  createdAt: Date;
  deviceId?: string;
}

export interface MediaMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  s3Key: string;
  guestId: string;
  guestName: string;
  uploadedAt: Date;
  thumbnailKey?: string;
}
