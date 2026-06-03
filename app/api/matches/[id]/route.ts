import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      club: { select: { name: true, logoUrl: true } },
      participants: {
        include: {
          player: {
            select: { id: true, firstName: true, lastName: true, photoUrl: true, positionMain: true },
          },
        },
      },
      _count: { select: { participants: true } },
    },
  })

  if (!match) return NextResponse.json({ error: 'Match introuvable.' }, { status: 404 })

  return NextResponse.json({ ...match, date: match.date.toISOString(), createdAt: match.createdAt.toISOString() })
}
