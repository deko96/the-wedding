"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, useInView } from "framer-motion"
import { Camera, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UploadedMedia, MediaResponse } from "@/types/wedding"
import MediaModal from "./media-modal"
import MasonryGrid from "./masonry-grid"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { S3Service } from "@/services/s3-service"
import { weddingConfig } from "@/config/wedding"

interface GallerySectionProps {
  media: UploadedMedia[]
  onMediaAdded?: (media: UploadedMedia) => void
}

export default function GallerySection({ media: uploadedMedia, onMediaAdded }: GallerySectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [allMedia, setAllMedia] = useState<UploadedMedia[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [isInitialized, setIsInitialized] = useState(false)

  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 })

  const s3Service = S3Service.getInstance()

  // Initialize with mock data for demo
  useEffect(() => {
    if (!isInitialized) {
      s3Service.generateMockData(50) // Generate 50 mock images for demo
      loadMoreMedia()
      setIsInitialized(true)
    }
  }, [isInitialized])

  // Combine uploaded media with loaded media
  useEffect(() => {
    setAllMedia((prev) => {
      const existingIds = new Set(prev.map((item) => item.id))
      const newMedia = uploadedMedia.filter((item) => !existingIds.has(item.id))
      return [...newMedia, ...prev]
    })
  }, [uploadedMedia])

  const loadMoreMedia = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const response: MediaResponse = await s3Service.getMedia(nextCursor, 20)

      setAllMedia((prev) => {
        const existingIds = new Set(prev.map((item) => item.id))
        const newMedia = response.media.filter((item) => !existingIds.has(item.id))
        return [...prev, ...newMedia]
      })

      setNextCursor(response.nextCursor)
      setHasMore(response.hasMore)
    } catch (error) {
      console.error("Failed to load media:", error)
    } finally {
      setIsLoading(false)
    }
  }, [nextCursor, isLoading, s3Service])

  useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMoreMedia,
    threshold: 200,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1,
      },
    },
  }

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  const openModal = (index: number) => {
    setCurrentMediaIndex(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const navigateToMedia = (index: number) => {
    setCurrentMediaIndex(index)
  }

  const scrollToUpload = () => {
    document.getElementById("upload-section")?.scrollIntoView({
      behavior: "smooth",
    })
  }

  if (allMedia.length === 0 && !isLoading) {
    return (
      <section
        id="gallery-section"
        ref={sectionRef}
        className="py-20 px-4 bg-gradient-to-br from-slate-50 via-sage-25 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300 overflow-hidden"
      >
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div variants={headerVariants}>
            <h2 className="text-3xl md:text-4xl font-serif text-sage-800 dark:text-sage-200 mb-8 transition-colors duration-300">
              {weddingConfig.content.galleryTitle}
            </h2>
          </motion.div>

          <motion.div className="max-w-md mx-auto" variants={headerVariants}>
            <Camera className="h-16 w-16 text-sage-400 dark:text-sage-500 mx-auto mb-4 transition-colors duration-300" />
            <h3 className="text-xl font-serif text-sage-700 dark:text-sage-300 mb-3 transition-colors duration-300">
              {weddingConfig.content.emptyGalleryTitle}
            </h3>
            <p className="text-sage-600 dark:text-sage-400 mb-6 transition-colors duration-300">
              {weddingConfig.content.emptyGalleryMessage}
            </p>
            <Button
              onClick={scrollToUpload}
              className="bg-sage-500 hover:bg-sage-600 dark:bg-sage-600 dark:hover:bg-sage-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <Upload className="h-4 w-4" />
              Upload Photos
            </Button>
          </motion.div>
        </motion.div>
      </section>
    )
  }

  return (
    <section
      id="gallery-section"
      ref={sectionRef}
      className="py-20 px-4 bg-gradient-to-br from-slate-50 via-sage-25 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300 overflow-hidden"
    >
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div className="text-center mb-16" variants={headerVariants}>
          <h2 className="text-3xl md:text-4xl font-serif text-sage-800 dark:text-sage-200 mb-4 transition-colors duration-300">
            {weddingConfig.content.galleryTitle}
          </h2>
          <p className="text-sage-600 dark:text-sage-400 text-lg transition-colors duration-300">
            {allMedia.length} beautiful {allMedia.length === 1 ? "memory" : "memories"} shared
          </p>
        </motion.div>

        {/* Masonry Grid Container */}
        <div className="w-full overflow-hidden">
          <MasonryGrid media={allMedia} onMediaClick={openModal} isLoading={isLoading} />
        </div>

        {/* Load more indicator */}
        {isLoading && (
          <motion.div
            className="flex justify-center items-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-3 text-sage-600 dark:text-sage-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Loading more memories...</span>
            </div>
          </motion.div>
        )}

        {/* End of content indicator */}
        {!hasMore && allMedia.length > 0 && (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sage-500 dark:text-sage-400 text-sm">You've seen all the beautiful memories! 💕</p>
          </motion.div>
        )}
      </motion.div>

      {/* Media Modal */}
      <MediaModal
        media={allMedia}
        currentIndex={currentMediaIndex}
        isOpen={isModalOpen}
        onClose={closeModal}
        onNavigate={navigateToMedia}
      />
    </section>
  )
}
