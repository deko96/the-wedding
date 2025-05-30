import type { UploadedMedia, MediaResponse } from "@/types/wedding"

interface S3UploadResponse {
  uploadUrl: string
  mediaId: string
  s3Key: string
}

export class GalleryService {
  private static instance: GalleryService

  static getInstance(): GalleryService {
    if (!GalleryService.instance) {
      GalleryService.instance = new GalleryService()
    }
    return GalleryService.instance
  }

  // Get pre-signed URL for upload via Netlify function
  async getUploadUrl(
    fileName: string,
    fileType: string,
    fileSize: number,
    guestName: string,
  ): Promise<S3UploadResponse> {
    const response = await fetch("/.netlify/functions/get-upload-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName,
        fileType,
        fileSize,
        guestName,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get upload URL")
    }

    return response.json()
  }

  // Get paginated media list from Netlify function
  async getMedia(cursor?: string, limit = 20): Promise<MediaResponse> {
    const params = new URLSearchParams()
    if (cursor) params.append("cursor", cursor)
    params.append("limit", limit.toString())

    const response = await fetch(`/.netlify/functions/get-media?${params.toString()}`)

    if (!response.ok) {
      throw new Error("Failed to fetch media")
    }

    return response.json()
  }
}
