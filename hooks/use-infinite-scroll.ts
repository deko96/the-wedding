"use client"

import { useState, useEffect } from "react"

interface UseInfiniteScrollProps {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  threshold?: number
}

export function useInfiniteScroll({ hasMore, isLoading, onLoadMore, threshold = 100 }: UseInfiniteScrollProps) {
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - threshold &&
        hasMore &&
        !isLoading &&
        !isFetching
      ) {
        setIsFetching(true)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [hasMore, isLoading, isFetching, threshold])

  useEffect(() => {
    if (!isFetching) return

    const loadMore = async () => {
      await onLoadMore()
      setIsFetching(false)
    }

    loadMore()
  }, [isFetching, onLoadMore])

  return { isFetching }
}
