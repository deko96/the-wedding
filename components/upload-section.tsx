"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { Upload, ImageIcon, Video, X, Check, AlertCircle, Heart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { UploadedMedia, UploadProgress } from "@/types/wedding"
import { useToast } from "@/hooks/use-toast"
import { S3Service } from "@/services/s3-service"
import { weddingConfig } from "@/config/wedding"

interface UploadSectionProps {
  onMediaUploaded: (media: UploadedMedia) => void
}

export default function UploadSection({ onMediaUploaded }: UploadSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 })

  const s3Service = S3Service.getInstance()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5, ease: "easeIn" } },
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const showSuccessToast = (fileName: string) => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </div>
          <span>Upload Successful! 🎉</span>
        </div>
      ),
      description: (
        <div className="flex items-center gap-2">
          <span>✨ {fileName} has been added to your wedding memories! 💕</span>
        </div>
      ),
      duration: 4000,
      className:
        "border-sage-200 bg-gradient-to-r from-sage-50 to-white dark:border-sage-700 dark:from-sage-900 dark:to-slate-800",
    })
  }

  const uploadToS3 = useCallback(
    async (file: File) => {
      const uploadId = Math.random().toString(36).substr(2, 9)

      setUploads((prev) => [
        ...prev,
        {
          id: uploadId,
          progress: 0,
          status: "uploading",
        },
      ])

      try {
        // Get pre-signed URL
        const uploadData = await s3Service.getUploadUrl(file.name, file.type)

        // Simulate upload progress
        const interval = setInterval(() => {
          setUploads((prev) =>
            prev.map((upload) => {
              if (upload.id === uploadId) {
                const newProgress = Math.min(upload.progress + Math.random() * 20 + 10, 95)
                return { ...upload, progress: newProgress }
              }
              return upload
            }),
          )
        }, 200)

        // Upload to S3
        const media = await s3Service.uploadFile(file, uploadData)

        // Complete upload
        clearInterval(interval)
        setUploads((prev) =>
          prev.map((upload) => {
            if (upload.id === uploadId) {
              return { ...upload, progress: 100, status: "completed" as const }
            }
            return upload
          }),
        )

        // Notify parent component
        setTimeout(() => {
          onMediaUploaded(media)
          showSuccessToast(file.name)

          // Remove upload progress after delay
          setTimeout(() => {
            setUploads((prev) => prev.filter((u) => u.id !== uploadId))
          }, 1000)
        }, 500)
      } catch (error) {
        console.error("Upload failed:", error)
        setUploads((prev) =>
          prev.map((upload) => {
            if (upload.id === uploadId) {
              return { ...upload, status: "error" as const }
            }
            return upload
          }),
        )

        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive",
          duration: 4000,
        })
      }
    },
    [onMediaUploaded, s3Service],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      files.forEach((file) => {
        if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
          uploadToS3(file)
        }
      })
    },
    [uploadToS3],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      files.forEach(uploadToS3)
    },
    [uploadToS3],
  )

  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== id))
  }, [])

  return (
    <section
      id="upload-section"
      ref={sectionRef}
      className="py-20 px-4 bg-white dark:bg-slate-900 transition-colors duration-300"
    >
      <motion.div
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h2 className="text-3xl md:text-4xl font-serif text-sage-800 dark:text-sage-200 mb-4 transition-colors duration-300">
            {weddingConfig.content.uploadTitle}
          </h2>
          <p className="text-sage-600 dark:text-sage-400 text-lg max-w-2xl mx-auto transition-colors duration-300">
            {weddingConfig.content.uploadSubtitle}
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="mb-8 dark:bg-slate-800 border-sage-200 dark:border-sage-700 transition-colors duration-300">
            <CardContent className="p-0">
              <div
                className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 cursor-pointer ${
                  isDragOver
                    ? "border-sage-500 bg-sage-50 dark:border-sage-400 dark:bg-sage-900/20"
                    : "border-sage-300 dark:border-sage-600 hover:border-sage-400 dark:hover:border-sage-500 hover:bg-sage-25 dark:hover:bg-sage-900/10"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <motion.div animate={{ scale: isDragOver ? 1.1 : 1 }} transition={{ duration: 0.2 }}>
                  <Upload className="mx-auto h-12 w-12 text-sage-400 dark:text-sage-500 mb-4 transition-colors duration-300" />
                  <h3 className="text-xl font-medium text-sage-700 dark:text-sage-300 mb-2 transition-colors duration-300">
                    Drop your files here
                  </h3>
                  <p className="text-sage-500 dark:text-sage-400 mb-4 transition-colors duration-300">
                    or click to browse your device
                  </p>
                  <div className="flex justify-center space-x-4 text-sm text-sage-400 dark:text-sage-500 transition-colors duration-300">
                    <div className="flex items-center">
                      <ImageIcon className="h-4 w-4 mr-1" />
                      Images
                    </div>
                    <div className="flex items-center">
                      <Video className="h-4 w-4 mr-1" />
                      Videos
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload Progress */}
        <AnimatePresence>
          {uploads.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {uploads.map((upload) => (
                <motion.div
                  key={upload.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-sage-50 dark:bg-sage-900/30 rounded-lg p-4 flex items-center space-x-4 transition-colors duration-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-sage-700 dark:text-sage-300 transition-colors duration-300">
                        {upload.status === "uploading"
                          ? "Uploading to S3..."
                          : upload.status === "completed"
                            ? "Upload complete!"
                            : "Upload failed"}
                      </span>
                      <div className="flex items-center space-x-2">
                        {upload.status === "completed" && <Check className="h-4 w-4 text-green-500" />}
                        {upload.status === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUpload(upload.id)}
                          className="h-6 w-6 p-0 hover:bg-sage-200 dark:hover:bg-sage-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Progress value={upload.progress} className="h-2" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
