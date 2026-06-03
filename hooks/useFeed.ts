'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface FeedPost {
  id: string
  content: string | null
  mediaUrls: string[]
  hashtags: string[]
  type: string
  createdAt: string
  author: {
    id: string
    player?: { firstName: string; lastName: string; photoUrl: string | null }
  }
  _count: { likes: number; comments: number }
}

export function useFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const cursorRef = useRef<string | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '10' })
      if (cursorRef.current) params.set('cursor', cursorRef.current)
      const res = await fetch(`/api/posts?${params}`)
      const data: { posts: FeedPost[]; nextCursor: string | null } = await res.json()
      setPosts((prev) => [...prev, ...data.posts])
      cursorRef.current = data.nextCursor
      setHasMore(!!data.nextCursor)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore])

  useEffect(() => {
    loadMore()
  }, [])

  return { posts, loading, hasMore, loadMore }
}
