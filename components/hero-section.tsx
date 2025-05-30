"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Leaf, Camera } from "lucide-react"
import { getCoupleNames, getWeddingDate, weddingConfig } from "@/config/wedding"

export default function HeroSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5, ease: "easeIn" } },
  }

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
    })
  }

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-sage-50 to-white dark:from-slate-900 dark:to-slate-800 transition-colors duration-300"
    >
      {/* Floating botanical elements */}
      <motion.div
        className="absolute top-20 left-10 text-sage-300 dark:text-sage-600"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{ opacity: isInView ? 1 : 0, transition: "opacity 0.5s" }}
      >
        <Leaf size={24} />
      </motion.div>

      <motion.div
        className="absolute top-32 right-16 text-sage-200 dark:text-sage-700"
        animate={{
          y: [0, -15, 0],
          rotate: [0, -3, 0],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
        style={{ opacity: isInView ? 1 : 0, transition: "opacity 0.5s" }}
      >
        <Leaf size={18} />
      </motion.div>

      <motion.div
        className="absolute bottom-32 left-20 text-sage-300 dark:text-sage-600"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 8, 0],
        }}
        transition={{
          duration: 7,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{ opacity: isInView ? 1 : 0, transition: "opacity 0.5s" }}
      >
        <Leaf size={20} />
      </motion.div>

      <motion.div
        className="text-center px-4 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div variants={itemVariants}>
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-serif text-sage-800 dark:text-sage-200 mb-6 leading-tight transition-colors duration-300"
            variants={itemVariants}
          >
            Share Your
            <motion.span
              className="block text-sage-600 dark:text-sage-300 italic transition-colors duration-300"
              variants={itemVariants}
            >
              Shots
            </motion.span>
          </motion.h1>
        </motion.div>

        <motion.div className="space-y-4 mb-12" variants={itemVariants}>
          <div className="flex items-center justify-center space-x-4 text-sage-700 dark:text-sage-300 transition-colors duration-300">
            <motion.div
              className="h-px bg-sage-300 dark:bg-sage-600 w-12 transition-colors duration-300"
              initial={{ width: 0 }}
              animate={isInView ? { width: 48 } : { width: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            />
            <span className="font-serif text-2xl md:text-3xl">{getCoupleNames("hero")}</span>
            <motion.div
              className="h-px bg-sage-300 dark:bg-sage-600 w-12 transition-colors duration-300"
              initial={{ width: 0 }}
              animate={isInView ? { width: 48 } : { width: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            />
          </div>

          <motion.p
            className="text-sage-600 dark:text-sage-400 text-lg md:text-xl font-light tracking-wide transition-colors duration-300"
            variants={itemVariants}
          >
            {getWeddingDate()}
          </motion.p>
        </motion.div>

        <motion.p
          className="text-sage-600 dark:text-sage-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light transition-colors duration-300"
          variants={itemVariants}
        >
          {weddingConfig.content.heroSubtitle}
        </motion.p>

        <motion.div
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={itemVariants}
        >
          <motion.button
            className="bg-sage-500 hover:bg-sage-600 dark:bg-sage-600 dark:hover:bg-sage-700 text-white px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection("upload-section")}
          >
            Start Sharing
          </motion.button>

          <motion.button
            className="border-2 border-sage-500 dark:border-sage-400 text-sage-600 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-sage-900/20 px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection("gallery-section")}
          >
            <Camera className="h-5 w-5" />
            View Gallery
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  )
}
