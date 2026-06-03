import { prisma } from '@/lib/prisma'

type NotifType = 'LIKE' | 'JOIN_MATCH' | 'MATCH_FULL' | 'NEW_FOLLOWER' | 'COMMENT'

interface NotifPayload {
  LIKE:        { postId: string; likerName: string; postPreview: string }
  JOIN_MATCH:  { matchId: string; matchTitle: string; playerName: string }
  MATCH_FULL:  { matchId: string; matchTitle: string }
  NEW_FOLLOWER:{ followerId: string; followerName: string }
  COMMENT:     { postId: string; commenterName: string; postPreview: string }
}

export async function createNotification<T extends NotifType>(
  recipientId: string,
  type: T,
  payload: NotifPayload[T]
) {
  if (!recipientId) return
  return prisma.notification.create({
    data: { recipientId, type, payload: payload as object },
  })
}

export const NOTIF_ICONS: Record<string, string> = {
  LIKE:         '❤️',
  JOIN_MATCH:   '⚽',
  MATCH_FULL:   '🏟️',
  NEW_FOLLOWER: '👤',
  COMMENT:      '💬',
}

export function getNotifText(type: string, payload: Record<string, string>): string {
  switch (type) {
    case 'LIKE':
      return `${payload.likerName} a aimé ton post`
    case 'JOIN_MATCH':
      return `${payload.playerName} a rejoint ton match "${payload.matchTitle}"`
    case 'MATCH_FULL':
      return `Ton match "${payload.matchTitle}" est complet !`
    case 'COMMENT':
      return `${payload.commenterName} a commenté ton post`
    case 'NEW_FOLLOWER':
      return `${payload.followerName} te suit maintenant`
    default:
      return 'Nouvelle notification'
  }
}

export function getNotifLink(type: string, payload: Record<string, string>): string {
  switch (type) {
    case 'LIKE':
    case 'COMMENT':
      return `/feed`
    case 'JOIN_MATCH':
    case 'MATCH_FULL':
      return `/matchs/${payload.matchId}`
    case 'NEW_FOLLOWER':
      return `/profil/${payload.followerId}`
    default:
      return '/notifications'
  }
}
