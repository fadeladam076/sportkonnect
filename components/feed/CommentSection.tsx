'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

interface CommentAuthor {
  id: string
  email: string | null
  player: { id: string; firstName: string; lastName: string; photoUrl: string | null } | null
}

interface Comment {
  id: string
  content: string
  authorId: string
  createdAt: string
  author: CommentAuthor
  replies: Comment[]
}

function timeAgo(iso: string, t: any): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return t('feed.time.just_now', "À l'instant")
  if (mins < 60) return t('feed.time.mins_ago', { count: mins, defaultValue: `il y a ${mins}min` })
  const h = Math.floor(mins / 60)
  if (h < 24) return t('feed.time.hours_ago', { count: h, defaultValue: `il y a ${h}h` })
  return t('feed.time.days_ago', { count: Math.floor(h / 24), defaultValue: `il y a ${Math.floor(h / 24)}j` })
}

function AuthorAvatar({ author, size = 8 }: { author: CommentAuthor; size?: number }) {
  const initial = author.player?.firstName?.[0] ?? author.email?.[0]?.toUpperCase() ?? '?'
  const cls = `w-${size} h-${size} rounded-full shrink-0`
  if (author.player?.photoUrl) {
    return <Image src={author.player.photoUrl} alt={initial} width={32} height={32} className={`${cls} object-cover border border-[#0B8F3C]/30`} />
  }
  return (
    <div className={`${cls} bg-[#0B8F3C] flex items-center justify-center font-poppins font-bold text-white text-xs`}>
      {initial}
    </div>
  )
}

function AuthorName({ author, t }: { author: CommentAuthor; t: any }) {
  const name = author.player
    ? `${author.player.firstName} ${author.player.lastName}`
    : (author.email ?? t('feed.anonymous', 'Anonyme'))
  const href = author.player ? `/profil/${author.player.id}` : '#'
  return (
    <Link href={href} className="font-inter text-sm font-semibold text-white hover:text-[#22C55E] transition-colors">
      {name}
    </Link>
  )
}

interface Props {
  postId: string
  currentUserId: string
  initialCount: number
  onCountChange: (count: number) => void
}

export function CommentSection({ postId, currentUserId, initialCount, onCountChange }: Props) {
  const { t } = useTranslation('common')
  const [comments, setComments]     = useState<Comment[]>([])
  const [loading, setLoading]       = useState(true)
  const [newText, setNewText]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo]       = useState<{ id: string; name: string } | null>(null)
  const [replyText, setReplyText]   = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((data) => { setComments(data); setLoading(false) })
  }, [postId])

  async function submitComment(content: string, parentId?: string) {
    if (!content.trim()) return
    setSubmitting(true)
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim(), parentId }),
    })
    if (res.ok) {
      const newComment: Comment = await res.json()
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId ? { ...c, replies: [...c.replies, newComment] } : c
          )
        )
        setReplyTo(null)
        setReplyText('')
        onCountChange(initialCount + 1)
      } else {
        setComments((prev) => [...prev, newComment])
        setNewText('')
        onCountChange(initialCount + 1)
      }
    }
    setSubmitting(false)
  }

  function startReply(comment: Comment) {
    const name = comment.author.player
      ? `${comment.author.player.firstName} ${comment.author.player.lastName}`
      : (comment.author.email ?? t('feed.anonymous', 'Anonyme'))
    setReplyTo({ id: comment.id, name })
    setReplyText('')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  return (
    <div className="mt-3 pt-3 border-t border-white/5 space-y-4">
      {loading && (
        <div className="flex justify-center py-3">
          <div className="w-4 h-4 border-2 border-[#0B8F3C] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Liste commentaires */}
      {!loading && comments.map((comment) => (
        <div key={comment.id} className="space-y-3">
          {/* Commentaire principal */}
          <div className="flex gap-3">
            <AuthorAvatar author={comment.author} size={8} />
            <div className="flex-1 min-w-0">
              <div className="bg-[#0F172A] rounded-xl px-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <AuthorName author={comment.author} t={t} />
                  <span className="font-inter text-xs text-[#4B5563]">{timeAgo(comment.createdAt, t)}</span>
                </div>
                <p className="font-inter text-sm text-[#E5E7EB] leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
              <button
                onClick={() => startReply(comment)}
                className="mt-1 ml-2 font-inter text-xs text-[#9CA3AF] hover:text-[#22C55E] transition-colors"
              >
                {t('feed.reply', 'Répondre')}
              </button>
            </div>
          </div>

          {/* Réponses */}
          {comment.replies.length > 0 && (
            <div className="ml-11 space-y-2">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex gap-2">
                  <AuthorAvatar author={reply.author} size={6} />
                  <div className="flex-1 min-w-0">
                    <div className="bg-[#0F172A] rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <AuthorName author={reply.author} t={t} />
                        <span className="font-inter text-xs text-[#4B5563]">{timeAgo(reply.createdAt, t)}</span>
                      </div>
                      <p className="font-inter text-sm text-[#E5E7EB] leading-relaxed">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Input réponse inline */}
          {replyTo?.id === comment.id && (
            <div className="ml-11 flex gap-2">
              <div className="flex-1">
                <div className="bg-[#0F172A] rounded-xl px-3 py-2 border border-[#0B8F3C]/40">
                  <p className="font-inter text-xs text-[#22C55E] mb-1">↩ {replyTo.name}</p>
                  <textarea
                    ref={inputRef}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t('feed.reply_placeholder', 'Ta réponse…')}
                    rows={2}
                    className="w-full bg-transparent text-white font-inter text-sm placeholder-[#4B5563] focus:outline-none resize-none"
                  />
                </div>
                <div className="flex gap-2 mt-1.5 justify-end">
                  <button onClick={() => setReplyTo(null)} className="font-inter text-xs text-[#9CA3AF] hover:text-white px-3 py-1 transition-colors">
                    {t('feed.cancel', 'Annuler')}
                  </button>
                  <button
                    disabled={!replyText.trim() || submitting}
                    onClick={() => submitComment(replyText, comment.id)}
                    className="bg-[#0B8F3C] hover:bg-[#22C55E] disabled:opacity-40 text-white rounded-full px-4 py-1 font-inter text-xs font-semibold transition-colors"
                  >
                    {t('feed.reply', 'Répondre')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Nouveau commentaire */}
      <div className="flex gap-3 pt-1">
        <div className="w-8 h-8 rounded-full bg-[#0B8F3C] flex items-center justify-center font-poppins text-xs font-bold text-white shrink-0">
          ✍
        </div>
        <div className="flex-1">
          <div className="bg-[#0F172A] rounded-xl px-3 py-2 border border-white/5 focus-within:border-[#0B8F3C] transition-colors">
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder={t('feed.comment_placeholder', 'Ajoute un commentaire…')}
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submitComment(newText)
                }
              }}
              className="w-full bg-transparent text-white font-inter text-sm placeholder-[#4B5563] focus:outline-none resize-none"
            />
          </div>
          {newText.trim() && (
            <div className="flex justify-end mt-1.5">
              <button
                disabled={submitting}
                onClick={() => submitComment(newText)}
                className="bg-[#0B8F3C] hover:bg-[#22C55E] disabled:opacity-40 text-white rounded-full px-4 py-1.5 font-inter text-xs font-semibold transition-colors"
              >
                {submitting ? '...' : t('feed.publish', 'Publier')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
