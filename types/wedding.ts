export interface UploadedMedia {
  id: string
  type: "image" | "video"
  url: string
  name: string
  uploadedAt: Date
  thumbnail?: string
  s3Key?: string
  size?: number
}

export interface UploadProgress {
  id: string
  progress: number
  status: "uploading" | "completed" | "error"
}

export interface MediaResponse {
  media: UploadedMedia[]
  nextCursor?: string
  hasMore: boolean
  total: number
}

export interface S3UploadResponse {
  uploadUrl: string
  key: string
  fields: Record<string, string>
}
