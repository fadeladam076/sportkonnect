'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import type { FeedPost } from './PostCard'

interface Props {
  onPost: (post: FeedPost) => void
}

function isVideoType(type: string) { return type.startsWith('video/') }

export function PostComposer({ onPost }: Props) {
  const { t } = useTranslation('common')
  const { data: session } = useSession()
  const [content,      setContent]      = useState('')
  const [mediaFile,    setMediaFile]    = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [isVideo,      setIsVideo]      = useState(false)
  const [uploading,    setUploading]    = useState(false)
  const [loading,      setLoading]      = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const initial = session?.user?.email?.[0]?.toUpperCase() ?? '?'
  const canPost = (content.trim().length > 0 || mediaFile !== null) && !loading

  function handleMediaSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMediaFile(file)
    setIsVideo(isVideoType(file.type))
    setMediaPreview(URL.createObjectURL(file))
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeMedia() {
    setMediaFile(null)
    setMediaPreview(null)
    setIsVideo(false)
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!canPost) return
    setLoading(true)

    let mediaUrl: string | null = null

    if (mediaFile) {
      setUploading(true)
      const fd = new FormData()
      fd.append('file', mediaFile)
      const uploadRes = await fetch('/api/upload/post-media', { method: 'POST', body: fd })
      setUploading(false)
      if (uploadRes.ok) {
        const { url } = await uploadRes.json()
        mediaUrl = url
      }
    }

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content:   content.trim(),
        mediaUrls: mediaUrl ? [mediaUrl] : [],
      }),
    })

    if (res.ok) {
      const post: FeedPost = await res.json()
      onPost(post)
      setContent('')
      removeMedia()
    }
    setLoading(false)
  }

  return (
    <div className="bg-[#111827] rounded-xl shadow-lg shadow-black/20 p-4">
      <form onSubmit={handlePost}>
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0B8F3C] flex items-center justify-center font-poppins text-sm font-bold text-white shrink-0">
            {initial}
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('feed.placeholder', 'Partage une performance, un résultat… #Perform')}
              rows={3}
              maxLength={500}
              className="w-full bg-[#0F172A] rounded-xl px-4 py-3 text-white font-inter text-sm placeholder-[#4B5563] focus:outline-none focus:ring-1 focus:ring-[#0B8F3C] transition resize-none"
            />

            {/* Prévisualisation média */}
            {mediaPreview && (
              <div className="relative mt-2 rounded-xl overflow-hidden">
                {isVideo ? (
                  <video src={mediaPreview} controls className="w-full max-h-48 rounded-xl bg-black" />
                ) : (
                  <div className="relative h-40">
                    <Image src={mediaPreview} alt="Aperçu" fill className="object-cover rounded-xl" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white text-sm transition-colors"
                >
                  ✕
                </button>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pl-12">
          <div className="flex items-center gap-1">
            {/* Bouton image/vidéo/GIF */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-[#9CA3AF] hover:text-[#22C55E] font-inter text-xs px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="text-base">🖼️</span>
              <span>{t('feed.photo', 'Photo')}</span>
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-[#9CA3AF] hover:text-[#22C55E] font-inter text-xs px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="text-base">🎥</span>
              <span>{t('feed.video', 'Vidéo')}</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
              onChange={handleMediaSelect}
            />
            <span className="font-inter text-xs text-[#4B5563] ml-2">{content.length}/500</span>
          </div>

          <button
            type="submit"
            disabled={!canPost}
            className="bg-[#0B8F3C] hover:bg-[#22C55E] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full px-5 py-2 font-inter text-sm font-semibold transition-colors"
          >
            {loading ? t('feed.publishing', 'Publication...') : t('feed.publish', 'Publier')}
          </button>
        </div>
      </form>
    </div>
  )
}
