import type { UploadedMedia, MediaResponse, S3UploadResponse } from "@/types/wedding"

// Mock S3 service - replace with actual S3 implementation
export class S3Service {
  private static instance: S3Service
  private mockMedia: UploadedMedia[] = []

  static getInstance(): S3Service {
    if (!S3Service.instance) {
      S3Service.instance = new S3Service()
    }
    return S3Service.instance
  }

  // Get pre-signed URL for upload
  async getUploadUrl(fileName: string, fileType: string): Promise<S3UploadResponse> {
    // Mock implementation - replace with actual S3 pre-signed URL generation
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      uploadUrl: `https://mock-bucket.s3.amazonaws.com/uploads/${Date.now()}-${fileName}`,
      key: `uploads/${Date.now()}-${fileName}`,
      fields: {
        "Content-Type": fileType,
        "x-amz-meta-uploaded-by": "wedding-gallery",
      },
    }
  }

  // Upload file to S3 using pre-signed URL
  async uploadFile(file: File, uploadData: S3UploadResponse): Promise<UploadedMedia> {
    // Mock upload - replace with actual S3 upload
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const media: UploadedMedia = {
      id: Math.random().toString(36).substr(2, 9),
      type: file.type.startsWith("video/") ? "video" : "image",
      url: URL.createObjectURL(file), // In real implementation, this would be the S3 URL
      name: file.name,
      uploadedAt: new Date(),
      s3Key: uploadData.key,
      size: file.size,
    }

    this.mockMedia.push(media)
    return media
  }

  // Get paginated media list
  async getMedia(cursor?: string, limit = 20): Promise<MediaResponse> {
    // Mock implementation - replace with actual S3 listing
    await new Promise((resolve) => setTimeout(resolve, 800))

    const startIndex = cursor ? Number.parseInt(cursor) : 0
    const endIndex = startIndex + limit
    const paginatedMedia = this.mockMedia.slice(startIndex, endIndex)

    return {
      media: paginatedMedia,
      nextCursor: endIndex < this.mockMedia.length ? endIndex.toString() : undefined,
      hasMore: endIndex < this.mockMedia.length,
      total: this.mockMedia.length,
    }
  }

  // Generate additional mock data for testing infinite scroll
  generateMockData(count = 50) {
    const mockImages = [
      "/placeholder.svg?height=400&width=300",
      "/placeholder.svg?height=500&width=300",
      "/placeholder.svg?height=350&width=300",
      "/placeholder.svg?height=450&width=300",
      "/placeholder.svg?height=380&width=300",
    ]

    for (let i = 0; i < count; i++) {
      this.mockMedia.push({
        id: `mock-${i}`,
        type: Math.random() > 0.8 ? "video" : "image",
        url: mockImages[i % mockImages.length],
        name: `Mock Photo ${i + 1}.jpg`,
        uploadedAt: new Date(Date.now() - Math.random() * 86400000 * 30), // Random date within last 30 days
        s3Key: `mock/photo-${i}.jpg`,
        size: Math.floor(Math.random() * 5000000) + 1000000, // 1-6MB
      })
    }
  }
}
