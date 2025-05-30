"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import HeroSection from "@/components/hero-section"
import UploadSection from "@/components/upload-section"
import GallerySection from "@/components/gallery-section"
import ThemeToggle from "@/components/theme-toggle"
import FooterSection from "@/components/footer-section"
import type { UploadedMedia } from "@/types/wedding"
import { Toaster } from "@/components/ui/toaster"

export default function WeddingGallery() {
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([])

  const handleMediaUploaded = (media: UploadedMedia) => {
    setUploadedMedia((prev) => [...prev, media])
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <ThemeToggle />
      <HeroSection />
      <UploadSection onMediaUploaded={handleMediaUploaded} />
      <GallerySection media={uploadedMedia} />
      <FooterSection />
      {/* Toast notifications */}
      <Toaster />
    </motion.div>
  )
}
