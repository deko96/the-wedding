"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Camera, Upload, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UploadedMedia, MediaResponse } from "@/types/wedding";
import MediaModal from "./media-modal";
import MasonryGrid from "./masonry-grid";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { getMedia } from "@/services/gallery";
import { weddingConfig } from "@/config/wedding";

interface GallerySectionProps {
  media: UploadedMedia[];
}

interface GalleryState {
  media: UploadedMedia[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

export default function GallerySection({
  media: uploadedMedia,
}: GallerySectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [gallery, setGallery] = useState<GalleryState>({
    media: [],
    nextCursor: undefined,
    hasMore: false,
    total: 0,
  });

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });

  useEffect(() => {
    if (!isInitialized) {
      loadMoreMedia();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    setGallery((prev) => {
      const existingIds = new Set(prev.media.map((item) => item.id));
      const newMedia = uploadedMedia.filter(
        (item) => !existingIds.has(item.id)
      );
      return {
        ...prev,
        media: [...newMedia, ...prev.media],
        total: prev.total + newMedia.length,
      };
    });
  }, [uploadedMedia]);

  const loadMoreMedia = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response: MediaResponse = await getMedia(gallery.nextCursor, 20);

      setGallery((prev) => {
        const existingIds = new Set(prev.media.map((item) => item.id));
        const newMedia = response.media.filter(
          (item) => !existingIds.has(item.id)
        );
        return {
          media: [...prev.media, ...newMedia],
          nextCursor: response.nextCursor,
          hasMore: response.hasMore,
          total: response.total,
        };
      });
    } catch (error) {
      console.error("Failed to load media:", error);
    } finally {
      setIsLoading(false);
    }
  }, [gallery.hasMore, gallery.nextCursor, gallery.media.length, isLoading]);

  useInfiniteScroll({
    hasMore: gallery.hasMore,
    isLoading,
    onLoadMore: loadMoreMedia,
    threshold: 200,
  });

  const openModal = (index: number) => {
    setCurrentMediaIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const navigateToMedia = (index: number) => setCurrentMediaIndex(index);

  const scrollToUpload = () => {
    document
      .getElementById("upload-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  if (gallery.total === 0 && !isLoading) {
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
            <h2 className="text-3xl md:text-4xl font-serif text-sage-800 dark:text-sage-200 mb-8">
              {weddingConfig.content.galleryTitle}
            </h2>
          </motion.div>

          <motion.div className="max-w-md mx-auto" variants={headerVariants}>
            <Camera className="h-16 w-16 text-sage-400 dark:text-sage-500 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-sage-700 dark:text-sage-300 mb-3">
              {weddingConfig.content.emptyGalleryTitle}
            </h3>
            <p className="text-sage-600 dark:text-sage-400 mb-6">
              {weddingConfig.content.emptyGalleryMessage}
            </p>
            <Button
              onClick={scrollToUpload}
              className="bg-sage-500 hover:bg-sage-600 text-white px-6 py-3 rounded-full font-medium"
            >
              <Upload className="h-4 w-4" /> Upload Photos
            </Button>
          </motion.div>
        </motion.div>
      </section>
    );
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
          <h2 className="text-3xl md:text-4xl font-serif text-sage-800 dark:text-sage-200 mb-4">
            {weddingConfig.content.galleryTitle}
          </h2>
          <p className="text-sage-600 dark:text-sage-400 text-lg">
            {gallery.total} beautiful{" "}
            {gallery.total === 1 ? "memory" : "memories"} shared
          </p>
        </motion.div>

        <div className="w-full overflow-hidden">
          <MasonryGrid
            media={gallery.media}
            onMediaClick={openModal}
            isLoading={isLoading}
          />
        </div>

        {isLoading && gallery.hasMore && (
          <motion.div
            className="flex justify-center items-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-3 text-sage-600 dark:text-sage-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">
                Loading more memories...
              </span>
            </div>
          </motion.div>
        )}

        {!gallery.hasMore && gallery.media.length > 0 && (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-center gap-3">
              <Heart className="h-8 w-8 text-sage-400 dark:text-sage-500" />
              <p className="text-sage-600 dark:text-sage-400 text-lg font-medium">
                You've seen all the beautiful memories! 💕
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      <MediaModal
        media={gallery.media}
        currentIndex={currentMediaIndex}
        isOpen={isModalOpen}
        onClose={closeModal}
        onNavigate={navigateToMedia}
      />
    </section>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.1 },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};
