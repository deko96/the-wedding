"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Heart, User } from "lucide-react"
import { motion } from "framer-motion"

interface GuestNameDialogProps {
  isOpen: boolean
  initialName: string
  onClose: (name: string) => void
}

export function GuestNameDialog({ isOpen, initialName, onClose }: GuestNameDialogProps) {
  const [guestName, setGuestName] = useState(initialName || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    // Simulate a delay to show the loading state
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    onClose(guestName.trim() || initialName)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit(event as any)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose(guestName.trim() || initialName)
      }}
    >
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 border-sage-200 dark:border-sage-700">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mx-auto mb-4 w-16 h-16 bg-sage-100 dark:bg-sage-800 rounded-full flex items-center justify-center"
          >
            <Heart className="h-8 w-8 text-sage-600 dark:text-sage-400" />
          </motion.div>
          <DialogTitle className="text-2xl font-serif text-sage-800 dark:text-sage-200">
            {initialName ? "Change Your Name" : "Welcome to Our Wedding!"}
          </DialogTitle>
          <DialogDescription className="text-sage-600 dark:text-sage-400 mt-2">
            {initialName
              ? "Please enter your name for this upload."
              : "Please tell us your name so we can remember who shared these beautiful moments with us."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="guest-name" className="text-sage-700 dark:text-sage-300 font-medium">
              Your Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sage-400" />
              <Input
                id="guest-name"
                type="text"
                placeholder="Enter your name..."
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 border-sage-300 dark:border-sage-600 focus:border-sage-500 dark:focus:border-sage-400"
                autoFocus
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!guestName.trim() || isSubmitting}
              className="flex-1 bg-sage-500 hover:bg-sage-600 dark:bg-sage-600 dark:hover:bg-sage-700 text-white"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </form>

        <p className="text-xs text-sage-500 dark:text-sage-400 text-center mt-4">
          Your name will be saved on this device for future uploads
        </p>
      </DialogContent>
    </Dialog>
  )
}
