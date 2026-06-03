'use client'

import { useEffect } from 'react'
import { useNotifStore } from '@/store/notifStore'

export function useNotifications(userId: string | null) {
  const { setUnreadCount } = useNotifStore()

  useEffect(() => {
    if (!userId) return

    async function fetchUnread() {
      const res = await fetch('/api/notifications/unread-count')
      if (res.ok) {
        const { count } = await res.json()
        setUnreadCount(count)
      }
    }

    fetchUnread()
  }, [userId, setUnreadCount])
}
