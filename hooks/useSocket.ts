'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket(userId: string | null) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!userId) return

    socketRef.current = io({ path: '/api/socket', auth: { userId } })

    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [userId])

  return socketRef.current
}
