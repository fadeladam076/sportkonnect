'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { CommentSection } from './CommentSection'

export interface FeedPost {
  id: string
  content: string | null
  mediaUrls: string[]
  hashtags: string[]
  type: string
  createdAt: string
  author: {
    id: string
    email: string | null
    player: {
      id: string
      firstName: string
      lastName: string
      photoUrl: string | null
      positionMain: string
    } | null
  }
  _count: { likes: number; comments: number }
  likes: { id: string }[]
}

function timeAgo(dateStr: string, t: any): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return t('feed.time.just_now', "À l'instant")
  if (mins < 60) return t('feed.time.mins_ago', { count: mins, defaultValue: `il y a ${mins}min` })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t('feed.time.hours_ago', { count: hours, defaultValue: `il y a ${hours}h` })
  const days = Math.floor(hours / 24)
  return t('feed.time.days_ago', { count: days, defaultValue: `il y a ${days}j` })
}

function isVideo(url: string) {
  return /\.(mp4|mov|webm)$/i.test(url)
}

interface Props {
  post: FeedPost
  currentUserId: string
}

export function PostCard({ post, currentUserId }: Props) {
  const { t } = useTranslation('common')
  const [liked,        setLiked]        = useState(post.likes.length > 0)
  const [likeCount,    setLikeCount]    = useState(post._count.likes)
  const [commentCount, setCommentCount] = useState(post._count.comments)
  const [showComments, setShowComments] = useState(false)
  const [likeLoading,  setLikeLoading]  = useState(false)

  const player     = post.author.player
  const authorName = player
    ? `${player.firstName} ${player.lastName}`
    : (post.author.email ?? t('feed.anonymous', 'Anonyme'))
  const initial    = authorName[0]?.toUpperCase() ?? '?'

  async function toggleLike() {
    if (likeLoading) return
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1))
    setLikeLoading(true)
    try {
      await fetch(`/api/posts/${post.id}/like`, { method: wasLiked ? 'DELETE' : 'POST' })
    } catch {
      setLiked(wasLiked)
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1))
    } finally {
      setLikeLoading(false)
    }
  }

  return (
    <article className="bg-[#111827] rounded-xl shadow-lg shadow-black/20 p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {player?.photoUrl ? (
          <Image
            src={player.photoUrl} alt={authorName} width={40} height={40}
            className="w-10 h-10 rounded-full object-cover border border-[#0B8F3C]/40 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#0B8F3C] flex items-center justify-center font-poppins font-bold text-white text-sm shrink-0">
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {player ? (
            <Link href={`/profil/${player.id}`}
              className="font-poppins font-semibold text-white text-sm hover:text-[#22C55E] transition-colors">
              {authorName}
            </Link>
          ) : (
            <span className="font-poppins font-semibold text-white text-sm">{authorName}</span>
          )}
          <div className="font-inter text-xs text-[#9CA3AF]">
            {player?.positionMain && <span className="capitalize">{player.positionMain} · </span>}
            {timeAgo(post.createdAt, t)}
          </div>
        </div>
      </div>

      {/* Contenu texte */}
      {post.content && (
        <p className="font-inter text-[#E5E7EB] text-sm leading-relaxed mb-3 whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Hashtags */}
      {post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.hashtags.map((tag) => (
            <span key={tag} className="font-inter text-xs text-[#22C55E]">#{tag}</span>
          ))}
        </div>
      )}

      {/* Médias */}
      {post.mediaUrls.length > 0 && (
        <div className={`grid gap-2 mb-4 rounded-xl overflow-hidden ${post.mediaUrls.length > 1 ? 'grid-cols-2' : ''}`}>
          {post.mediaUrls.map((url, i) =>
            isVideo(url) ? (
              <video
                key={i}
                src={url}
                controls
                className="w-full rounded-xl bg-black max-h-80 object-contain"
              />
            ) : (
              <div key={i} className="relative aspect-video bg-[#0F172A] rounded-xl overflow-hidden">
                <Image src={url} alt="" fill className="object-cover" />
              </div>
            )
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 pt-3 border-t border-white/5">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 font-inter text-sm transition-colors ${
            liked ? 'text-[#22C55E]' : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          <span>{liked ? '❤️' : '🤍'}</span>
          <span>{likeCount}</span>
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className={`flex items-center gap-1.5 font-inter text-sm transition-colors ${
            showComments ? 'text-[#22C55E]' : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          <span>💬</span>
          <span>{commentCount}</span>
        </button>
        <button className="ml-auto font-inter text-sm text-[#9CA3AF] hover:text-white transition-colors">
          ↗
        </button>
      </div>

      {/* Section commentaires */}
      {showComments && (
        <CommentSection
          postId={post.id}
          currentUserId={currentUserId}
          initialCount={commentCount}
          onCountChange={setCommentCount}
        />
      )}
    </article>
  )
}
