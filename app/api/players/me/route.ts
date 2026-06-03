import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateSPG } from '@/lib/ai-score'

const patchSchema = z.object({
  firstName:    z.string().min(1).optional(),
  lastName:     z.string().min(1).optional(),
  dob:          z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  nationality:  z.string().min(1).optional(),
  city:         z.string().min(1).optional(),
  positionMain: z.string().min(1).optional(),
  positionsOther: z.array(z.string()).optional(),
  foot:         z.string().optional(),
  height:       z.number().min(100).max(250).optional(),
  weight:       z.number().min(30).max(200).optional(),
  vma:          z.number().min(5).max(35).optional(),
  healthStatus: z.enum(['FIT', 'INJURED', 'SUSPENDED', 'RECOVERING']).optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const player = await prisma.player.findUnique({
    where: { userId: session.user.id },
    include: { stats: { orderBy: { season: 'desc' }, take: 1 } },
  })

  if (!player) return NextResponse.json({ error: 'Profil joueur introuvable.' }, { status: 404 })

  return NextResponse.json(player)
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const { dob, ...rest } = parsed.data

  const player = await prisma.player.update({
    where: { userId: session.user.id },
    data: {
      ...rest,
      ...(dob ? { dob: new Date(dob) } : {}),
    },
    include: { stats: { orderBy: { season: 'desc' }, take: 1 } },
  })

  // Recalcule le SPG si des stats existent
  if (player.stats[0] && player.positionMain) {
    const score = calculateSPG(player.stats[0], player.positionMain)
    await prisma.player.update({ where: { id: player.id }, data: { aiScore: score } })
  }

  return NextResponse.json({ id: player.id })
}
