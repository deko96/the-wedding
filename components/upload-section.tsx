"use client";

import type React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  Upload,
  ImageIcon,
  Video,
  Check,
  AlertCircle,
  Pencil,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { UploadedMedia } from "@/types/wedding";
import { useToast } from "@/hooks/use-toast";
import { weddingConfig } from "@/config/wedding";
import { GuestNameDialog } from "./guest-name-dialog";
import { getUploadUrl } from "@/services/gallery";

interface UploadSectionProps {
  onMediaUploaded: (media: UploadedMedia) => void;
}

export default function UploadSection({ onMediaUploaded }: UploadSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [showGuestDialog, setShowGuestDialog] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });

  // Load guest name from localStorage on mount
  useEffect(() => {
    const savedGuestName = localStorage.getItem("wedding-guest-name");
    if (savedGuestName) {
      setGuestName(savedGuestName);
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const uploadMedia = useCallback(
    async (file: File, guestName: string) => {
      // Show uploading toast
      const uploadingToast = toast({
        title: (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            <span>Uploading {file.name}</span>
          </div>
        ),
        duration: 0, // Don't auto-dismiss
      });

      try {
        // Get upload URL
        const uploadData = await getUploadUrl(
          file.name,
          file.type,
          file.size,
          guestName
        );

        // Upload to S3
        const uploadResponse = await fetch(uploadData.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file");
        }

        // Call complete-upload endpoint
        const completeResponse = await fetch(
          "/.netlify/functions/complete-upload",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              mediaId: uploadData.mediaId,
            }),
          }
        );

        if (!completeResponse.ok) {
          throw new Error("Failed to complete upload");
        }

        // Dismiss uploading toast
        uploadingToast.dismiss();

        // Show success toast
        toast({
          title: (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Uploaded {file.name}</span>
            </div>
          ),
          duration: 2000, // Disappear in 2 seconds
        });

        // Create media object
        const media: UploadedMedia = {
          id: uploadData.mediaId,
          type: file.type.startsWith("video/") ? "video" : "image",
          url: URL.createObjectURL(file), // Temporary URL for preview
          name: file.name,
          uploadedAt: new Date(),
          guestName: guestName,
          size: file.size,
        };

        // Notify parent component
        onMediaUploaded(media);
      } catch (error) {
        console.error("Upload failed:", error);

        // Dismiss uploading toast
        uploadingToast.dismiss();
        let errorToast: ReturnType<typeof toast>;

        // Show error toast with retry
        const retryUpload = () => {
          uploadMedia(file, guestName);
          errorToast?.dismiss();
        };

        errorToast = toast({
          title: (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>Upload failed {file.name}</span>
              </div>
            </div>
          ),
          action: (
            <Button
              size="sm"
              variant="ghost"
              onClick={retryUpload}
              className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          ),
          duration: 0, // Don't auto-dismiss error toasts
          variant: "destructive",
        });
      }
    },
    [onMediaUploaded, toast]
  );

  const processFiles = useCallback(
    (files: File[]) => {
      const validFiles = files.filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("video/")
      );

      if (validFiles.length === 0) return;

      if (!guestName) {
        setPendingFiles(validFiles);
        setShowGuestDialog(true);
      } else {
        validFiles.forEach((file) => uploadMedia(file, guestName));
      }
    },
    [guestName, uploadMedia]
  );

  const handleGuestNameSubmit = useCallback(
    (name: string) => {
      if (!name) return setShowGuestDialog(false);

      setGuestName(name);
      localStorage.setItem("wedding-guest-name", name);
      setShowGuestDialog(false);

      // Process pending files
      if (pendingFiles.length > 0) {
        pendingFiles.forEach((file) => uploadMedia(file, name));
        setPendingFiles([]);
      }
    },
    [pendingFiles, uploadMedia]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [processFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      processFiles(files);
    },
    [processFiles]
  );

  const openGuestDialog = () => {
    setShowGuestDialog(true);
  };

  return (
    <>
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
            {guestName && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <p className="text-sage-500 dark:text-sage-400 text-sm">
                  Uploading as:{" "}
                  <span className="font-medium text-sage-700 dark:text-sage-300">
                    {guestName}
                  </span>
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openGuestDialog}
                  className="h-6 w-6 p-0 hover:bg-sage-100 dark:hover:bg-sage-800"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            )}
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

                  <motion.div
                    animate={{ scale: isDragOver ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
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
        </motion.div>
      </section>

      {/* Guest Name Dialog */}
      <GuestNameDialog
        isOpen={showGuestDialog}
        onClose={handleGuestNameSubmit}
        initialName={guestName}
      />
    </>
  );
}
