"use client"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import HeroSection from "@/components/hero-section"
import UploadSection from "@/components/upload-section"
import GallerySection from "@/components/gallery-section"
import ThemeToggle from "@/components/theme-toggle"
import type { UploadedMedia } from "@/types/wedding"
import { Toaster } from "@/components/ui/toaster"
import { getCoupleNames, getWeddingDate, weddingConfig } from "@/config/wedding"

export default function WeddingGallery() {
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([])
  const footerRef = useRef(null)
  const isFooterInView = useInView(footerRef, { once: false, amount: 0.3 })

  const footerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const footerItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

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

      {/* Footer */}
      <footer ref={footerRef} className="bg-sage-800 dark:bg-slate-900 text-white py-12 transition-colors duration-300">
        <motion.div
          className="max-w-4xl mx-auto px-4 text-center"
          variants={footerVariants}
          initial="hidden"
          animate={isFooterInView ? "visible" : "hidden"}
        >
          <motion.h3 className="text-2xl font-serif mb-4" variants={footerItemVariants}>
            Thank You
          </motion.h3>
          <motion.p
            className="text-sage-200 dark:text-sage-300 mb-6 transition-colors duration-300"
            variants={footerItemVariants}
          >
            {weddingConfig.content.footerMessage}
          </motion.p>
          <motion.div
            className="flex items-center justify-center space-x-4 text-sage-300 dark:text-sage-400 transition-colors duration-300"
            variants={footerItemVariants}
          >
            <motion.div
              className="h-px bg-sage-600 dark:bg-sage-500 w-0 transition-colors duration-300"
              animate={isFooterInView ? { width: 48 } : { width: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
            <span className="font-serif text-lg">{getCoupleNames("footer")}</span>
            <motion.div
              className="h-px bg-sage-600 dark:bg-sage-500 w-0 transition-colors duration-300"
              animate={isFooterInView ? { width: 48 } : { width: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </motion.div>
          <motion.p
            className="text-sage-400 dark:text-sage-500 text-sm mt-4 transition-colors duration-300"
            variants={footerItemVariants}
          >
            {getWeddingDate()}
          </motion.p>
        </motion.div>
      </footer>
      {/* Toast notifications */}
      <Toaster />
    </motion.div>
  )
}
