export const weddingConfig = {
  // Couple details
  bride: "Irina",
  groom: "Martin",

  // Wedding date
  date: "13.09.2025",

  // Display settings
  displayNames: {
    // How names appear in the hero section
    heroFormat: "Irina & Martin",
    // How names appear in footer and other places
    footerFormat: "Irina & Martin",
  },

  // Page metadata
  metadata: {
    title: "Irina & Martin - Wedding Gallery",
    description: "Share your beautiful memories from our special day",
  },

  // Content text
  content: {
    heroSubtitle:
      "Help us capture every magical moment of our special day. Upload your photos and videos to create lasting memories together.",
    footerMessage: "for helping us capture the magic of our special day",
    galleryTitle: "Our Gallery",
    uploadTitle: "Upload Your Memories",
    uploadSubtitle: "Drag and drop your photos and videos, or click to browse your files",
    emptyGalleryTitle: "No memories yet",
    emptyGalleryMessage: "Be the first to share a beautiful moment from our special day!",
  },
} as const

// Helper function to get formatted couple name
export const getCoupleNames = (format: "hero" | "footer" = "hero") => {
  return format === "hero" ? weddingConfig.displayNames.heroFormat : weddingConfig.displayNames.footerFormat
}

// Helper function to get formatted date
export const getWeddingDate = () => {
  return weddingConfig.date
}

// Helper function to get page title
export const getPageTitle = () => {
  return weddingConfig.metadata.title
}

// Helper function to get page description
export const getPageDescription = () => {
  return weddingConfig.metadata.description
}
