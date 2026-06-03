'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { PostCard, type FeedPost } from './PostCard'
import { PostComposer } from './PostComposer'
import { useTranslation } from 'react-i18next'

interface Props {
  initialPosts: FeedPost[]
  currentUserId: string
}

export function Feed({ initialPosts, currentUserId }: Props) {
  const { t } = useTranslation('common')
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length === 10)
  const cursorRef = useRef<string | null>(
    initialPosts[initialPosts.length - 1]?.id ?? null
  )
  const loaderRef = useRef<HTMLDivElement>(null)

  function onNewPost(post: FeedPost) {
    setPosts((prev) => [post, ...prev])
  }

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

  /* Infinite scroll */
  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div className="space-y-4">
      <h1 className="font-poppins text-xl font-bold text-white mb-1">
        {t('feed.title', "Fil d'actualité")}
      </h1>
      <PostComposer onPost={onNewPost} />

      {posts.length === 0 && !loading && (
        <div className="bg-[#111827] rounded-xl p-10 text-center">
          <p className="font-inter text-[#9CA3AF] text-sm">
            {t('feed.empty', "Aucune publication pour l'instant. Sois le premier à partager quelque chose !")}
          </p>
        </div>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} />
      ))}

      {/* Trigger infinite scroll */}
      <div ref={loaderRef} className="h-4" />

      {loading && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-[#0B8F3C] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center font-inter text-xs text-[#4B5563] py-4">
          {t('feed.end', 'Tu as tout vu ! #Perform #Progress #Konnect')}
        </p>
      )}
    </div>
  )
}
