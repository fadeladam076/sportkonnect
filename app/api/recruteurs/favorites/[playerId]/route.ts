import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ playerId: string }> }

export async function POST(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { playerId } = await params
  const recruiter = await prisma.recruiter.findUnique({ where: { userId: session.user.id } })
  if (!recruiter) return NextResponse.json({ error: 'Profil recruteur requis.' }, { status: 403 })

  await prisma.recruiterFavorite.upsert({
    where:  { recruiterId_playerId: { recruiterId: recruiter.id, playerId } },
    create: { recruiterId: recruiter.id, playerId },
    update: {},
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { playerId } = await params
  const recruiter = await prisma.recruiter.findUnique({ where: { userId: session.user.id } })
  if (!recruiter) return NextResponse.json({ error: 'Profil recruteur requis.' }, { status: 403 })

  await prisma.recruiterFavorite.deleteMany({
    where: { recruiterId: recruiter.id, playerId },
  })

  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { playerId } = await params
  const { notes } = await request.json().catch(() => ({}))
  const recruiter = await prisma.recruiter.findUnique({ where: { userId: session.user.id } })
  if (!recruiter) return NextResponse.json({ error: 'Profil recruteur requis.' }, { status: 403 })

  await prisma.recruiterFavorite.updateMany({
    where: { recruiterId: recruiter.id, playerId },
    data:  { notes: notes ?? null },
  })

  return NextResponse.json({ ok: true })
}
