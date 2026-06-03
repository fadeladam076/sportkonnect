'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { NOTIF_ICONS, getNotifText, getNotifLink } from '@/lib/notifications'

interface Notif {
  id: string
  type: string
  payload: Record<string, string>
  read: boolean
  createdAt: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `il y a ${mins}min`
  const h = Math.floor(mins / 60)
  if (h < 24) return `il y a ${h}h`
  return `il y a ${Math.floor(h / 24)}j`
}

export function NotificationBell() {
  const [count,     setCount]     = useState(0)
  const [notifs,    setNotifs]    = useState<Notif[]>([])
  const [open,      setOpen]      = useState(false)
  const [loading,   setLoading]   = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchCount = useCallback(async () => {
    const res = await fetch('/api/notifications/unread-count')
    if (res.ok) { const { count } = await res.json(); setCount(count) }
  }, [])

  const fetchNotifs = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/notifications?limit=8')
    if (res.ok) setNotifs(await res.json())
    setLoading(false)
  }, [])

  /* Poll toutes les 30 secondes */
  useEffect(() => {
    fetchCount()
    const id = setInterval(fetchCount, 30000)
    return () => clearInterval(id)
  }, [fetchCount])

  /* Fermer en cliquant à l'extérieur */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleOpen() {
    if (!open) {
      setOpen(true)
      await fetchNotifs()
      if (count > 0) {
        await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' })
        setCount(0)
        setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
      }
    } else {
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cloche */}
      <button
        onClick={handleOpen}
        className="relative w-8 h-8 flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#0B8F3C] rounded-full flex items-center justify-center font-inter text-[9px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-[#111827] border border-white/10 rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="font-poppins font-semibold text-white text-sm">Notifications</span>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="font-inter text-xs text-[#9CA3AF] hover:text-[#22C55E] transition-colors"
            >
              Tout voir →
            </Link>
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="flex justify-center py-6">
                <div className="w-4 h-4 border-2 border-[#0B8F3C] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loading && notifs.length === 0 && (
              <div className="py-8 text-center font-inter text-sm text-[#9CA3AF]">
                Aucune notification
              </div>
            )}
            {!loading && notifs.map((n) => (
              <Link
                key={n.id}
                href={getNotifLink(n.type, n.payload)}
                onClick={() => setOpen(false)}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${!n.read ? 'bg-[#0B8F3C]/5' : ''}`}
              >
                <span className="text-xl mt-0.5 shrink-0">{NOTIF_ICONS[n.type] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm text-white leading-snug">
                    {getNotifText(n.type, n.payload)}
                  </p>
                  <p className="font-inter text-xs text-[#9CA3AF] mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0 mt-1.5" />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
