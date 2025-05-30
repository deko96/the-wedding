"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { UploadedMedia } from "@/types/wedding"
import Image from "next/image"

interface MasonryGridProps {
  media: UploadedMedia[]
  onMediaClick: (index: number) => void
  isLoading?: boolean
}

interface MasonryItem extends UploadedMedia {
  height: number
  column: number
  top: number
}

export default function MasonryGrid({ media, onMediaClick, isLoading = false }: MasonryGridProps) {
  const [masonryItems, setMasonryItems] = useState<MasonryItem[]>([])
  const [columns, setColumns] = useState(4)
  const [columnHeights, setColumnHeights] = useState<number[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Calculate number of columns based on screen width
  const calculateColumns = useCallback(() => {
    if (!containerRef.current) return 4

    const width = containerRef.current.offsetWidth
    if (width < 640) return 2
    if (width < 768) return 3
    if (width < 1024) return 4
    if (width < 1280) return 5
    return 6
  }, [])

  // Update container width and columns on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
        setColumns(calculateColumns())
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [calculateColumns])

  // Initialize column heights
  useEffect(() => {
    setColumnHeights(new Array(columns).fill(0))
  }, [columns])

  // Calculate masonry layout
  useEffect(() => {
    if (!media.length || !containerWidth || !columnHeights.length) return

    const gap = 16
    const columnWidth = Math.max(0, (containerWidth - gap * (columns - 1)) / columns)
    const newColumnHeights = new Array(columns).fill(0)

    const items: MasonryItem[] = media.map((item, index) => {
      // Calculate aspect ratio and height
      const aspectRatio = item.type === "video" ? 16 / 9 : Math.random() * 0.5 + 0.7 // Random height for demo
      const height = Math.max(200, columnWidth / aspectRatio) // Minimum height of 200px

      // Find shortest column
      const shortestColumnIndex = newColumnHeights.indexOf(Math.min(...newColumnHeights))
      const top = newColumnHeights[shortestColumnIndex]

      // Update column height
      newColumnHeights[shortestColumnIndex] += height + gap

      return {
        ...item,
        height,
        column: shortestColumnIndex,
        top,
      }
    })

    setMasonryItems(items)
    setColumnHeights(newColumnHeights)
  }, [media, containerWidth, columns])

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3 },
    },
  }

  const gap = 16
  const columnWidth = containerWidth ? Math.max(0, (containerWidth - gap * (columns - 1)) / columns) : 0

  // Calculate container height safely, avoiding Infinity
  const maxColumnHeight = columnHeights.length > 0 ? Math.max(...columnHeights.filter((h) => isFinite(h))) : 0
  const containerHeight = Math.max(0, maxColumnHeight || 0)

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <div
        className="relative w-full"
        style={{
          height: containerHeight > 0 ? `${containerHeight}px` : "auto",
          minHeight: media.length > 0 ? "200px" : "0px",
        }}
      >
        <AnimatePresence>
          {masonryItems.map((item, index) => {
            const leftPosition = item.column * (columnWidth + gap)

            // Ensure positions are valid numbers
            if (!isFinite(leftPosition) || !isFinite(item.top) || !isFinite(columnWidth) || !isFinite(item.height)) {
              return null
            }

            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
                className="absolute cursor-pointer group"
                style={{
                  left: Math.max(0, leftPosition),
                  top: Math.max(0, item.top),
                  width: Math.max(0, columnWidth),
                  height: Math.max(200, item.height),
                }}
                onClick={() => onMediaClick(index)}
              >
                <Card className="h-full overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-sage-200 dark:border-sage-700">
                  <CardContent className="p-0 relative h-full">
                    <div className="relative h-full overflow-hidden">
                      {item.type === "image" ? (
                        <Image
                          src={item.url || "/placeholder.svg"}
                          alt="Wedding memory"
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes={`(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw`}
                        />
                      ) : (
                        <div className="relative w-full h-full bg-sage-100 dark:bg-sage-800">
                          <video src={item.url} className="w-full h-full object-cover" muted />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="bg-white/90 dark:bg-slate-800/90 rounded-full p-4 shadow-lg">
                              <Play className="h-8 w-8 text-sage-700 dark:text-sage-300" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                        <div className="bg-white/90 dark:bg-slate-800/90 rounded-full p-2 shadow-lg">
                          <svg
                            className="h-6 w-6 text-sage-700 dark:text-sage-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-sage-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
