import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { id: matchId } = await params

  const player = await prisma.player.findUnique({ where: { userId: session.user.id } })
  if (!player) return NextResponse.json({ error: 'Profil joueur requis.' }, { status: 403 })

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { _count: { select: { participants: true } } },
  })
  if (!match) return NextResponse.json({ error: 'Match introuvable.' }, { status: 404 })
  if (match.status !== 'OPEN') return NextResponse.json({ error: 'Match fermé.' }, { status: 400 })
  if (match._count.participants >= match.maxPlayers) {
    return NextResponse.json({ error: 'Match complet.' }, { status: 400 })
  }

  await prisma.matchParticipant.upsert({
    where: { matchId_playerId: { matchId, playerId: player.id } },
    create: { matchId, playerId: player.id },
    update: {},
  })

  const newCount = match._count.participants + 1
  if (newCount >= match.maxPlayers) {
    await prisma.match.update({ where: { id: matchId }, data: { status: 'FULL' } })
    await createNotification(match.organizerId, 'MATCH_FULL', {
      matchId, matchTitle: match.title,
    })
  } else {
    const playerName = player.firstName
      ? `${player.firstName} ${player.lastName}`
      : 'Un joueur'
    await createNotification(match.organizerId, 'JOIN_MATCH', {
      matchId, matchTitle: match.title, playerName,
    })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { id: matchId } = await params
  const player = await prisma.player.findUnique({ where: { userId: session.user.id } })
  if (!player) return NextResponse.json({ error: 'Profil joueur requis.' }, { status: 403 })

  await prisma.matchParticipant.deleteMany({ where: { matchId, playerId: player.id } })
  await prisma.match.updateMany({
    where: { id: matchId, status: 'FULL' },
    data: { status: 'OPEN' },
  })

  return NextResponse.json({ ok: true })
}
