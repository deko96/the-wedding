import type { MediaResponse } from "@/types/wedding"

interface S3UploadResponse {
  uploadUrl: string
  mediaId: string
  s3Key: string
}

// Get pre-signed URL for upload via unified media endpoint
export async function getUploadUrl(
  fileName: string,
  fileType: string,
  fileSize: number,
  guestName: string,
): Promise<S3UploadResponse> {
  const response = await fetch("/.netlify/functions/media", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileName, fileType, fileSize, guestName }),
  })

  if (!response.ok) {
    throw new Error("Failed to get upload URL")
  }

  return response.json()
}

// Get paginated media list from unified media endpoint
export async function getMedia(cursor?: string, limit = 20): Promise<MediaResponse> {
  const params = new URLSearchParams()
  if (cursor) params.append("cursor", cursor)
  params.append("limit", limit.toString())

  const response = await fetch(`/.netlify/functions/media?${params.toString()}`)

  if (!response.ok) {
    throw new Error("Failed to fetch media")
  }

  return response.json()
}

// Complete upload via unified media endpoint
export async function completeUpload(mediaId: string): Promise<{ success: boolean }> {
  const response = await fetch("/.netlify/functions/media", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mediaId }),
  })

  if (!response.ok) {
    throw new Error("Failed to complete upload")
  }

  return response.json()
}
