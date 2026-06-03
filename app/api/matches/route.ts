import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const createSchema = z.object({
  title:      z.string().min(3).max(100),
  city:       z.string().min(1),
  address:    z.string().min(1),
  date:       z.string().datetime({ offset: true }).or(z.string()),
  level:      z.enum(['debutant', 'intermediaire', 'avance', 'pro']),
  maxPlayers: z.number().int().min(2).max(100),
  ageMin:     z.number().int().min(10).max(80).optional(),
  ageMax:     z.number().int().min(10).max(80).optional(),
  clubId:     z.string().optional(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city    = searchParams.get('city')    ?? ''
  const level   = searchParams.get('level')   ?? ''
  const status  = searchParams.get('status')  ?? 'OPEN'

  const matches = await prisma.match.findMany({
    where: {
      status: status as never,
      ...(city  ? { city:  { contains: city,  mode: 'insensitive' } } : {}),
      ...(level ? { level: { equals:   level } }                      : {}),
    },
    include: {
      _count: { select: { participants: true } },
      club:   { select: { name: true, logoUrl: true } },
    },
    orderBy: { date: 'asc' },
    take: 50,
  })

  return NextResponse.json(
    matches.map((m) => ({ ...m, date: m.date.toISOString(), createdAt: m.createdAt.toISOString() }))
  )
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const { date, ...rest } = parsed.data

  const match = await prisma.match.create({
    data: { ...rest, date: new Date(date), organizerId: session.user.id },
  })

  return NextResponse.json({ id: match.id }, { status: 201 })
}
