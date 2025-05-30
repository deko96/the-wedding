"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UploadedMedia } from "@/types/wedding"
import Image from "next/image"

interface MediaModalProps {
  media: UploadedMedia[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function MediaModal({ media, currentIndex, isOpen, onClose, onNavigate }: MediaModalProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const currentMedia = media[currentIndex]

  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : media.length - 1
    onNavigate(newIndex)
    setIsVideoPlaying(false)
  }, [currentIndex, media.length, onNavigate])

  const handleNext = useCallback(() => {
    const newIndex = currentIndex < media.length - 1 ? currentIndex + 1 : 0
    onNavigate(newIndex)
    setIsVideoPlaying(false)
  }, [currentIndex, media.length, onNavigate])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          handlePrevious()
          break
        case "ArrowRight":
          handleNext()
          break
      }
    },
    [isOpen, onClose, handlePrevious, handleNext],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen || !currentMedia) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Navigation buttons */}
        {media.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handlePrevious()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Media content */}
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {currentMedia.type === "image" ? (
            <Image
              src={currentMedia.url || "/placeholder.svg"}
              alt={currentMedia.name}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
              priority
            />
          ) : (
            <div className="relative">
              <video
                src={currentMedia.url}
                className="max-w-full max-h-full object-contain"
                controls={isVideoPlaying}
                autoPlay={isVideoPlaying}
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              />
              {!isVideoPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setIsVideoPlaying(true)}
                    className="text-white hover:bg-white/20"
                  >
                    <Play className="h-16 w-16" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Media counter */}
        {media.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {currentIndex + 1} of {media.length}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
