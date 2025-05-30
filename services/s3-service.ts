import type { UploadedMedia, MediaResponse, S3UploadResponse } from "@/types/wedding"

export class S3Service {
  private static instance: S3Service

  static getInstance(): S3Service {
    if (!S3Service.instance) {
      S3Service.instance = new S3Service()
    }
    return S3Service.instance
  }

  // Get pre-signed URL for upload via Netlify function
  async getUploadUrl(
    fileName: string,
    fileType: string,
    fileSize: number,
    guestName: string,
  ): Promise<S3UploadResponse & { mediaId: string }> {
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

  // Upload file to S3 using pre-signed URL
  async uploadFile(file: File, uploadData: S3UploadResponse & { mediaId: string }): Promise<UploadedMedia> {
    // Upload to S3
    const uploadResponse = await fetch(uploadData.uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    })

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to S3")
    }

    // Mark upload as completed
    await fetch("/.netlify/functions/complete-upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mediaId: uploadData.mediaId,
      }),
    })

    const media: UploadedMedia = {
      id: uploadData.mediaId,
      type: file.type.startsWith("video/") ? "video" : "image",
      url: URL.createObjectURL(file), // Temporary URL for immediate preview
      name: file.name,
      uploadedAt: new Date(),
      s3Key: uploadData.key,
      size: file.size,
    }

    return media
  }

  // Get paginated media list from Netlify function
  async getMedia(cursor?: string, limit = 20): Promise<MediaResponse> {
    const params = new URLSearchParams()
    if (cursor) params.append("cursor", cursor)
    params.append("limit", limit.toString())

    const response = await fetch(`/.netlify/functions/get-media?${params}`)

    if (!response.ok) {
      throw new Error("Failed to fetch media")
    }

    return response.json()
  }
}
