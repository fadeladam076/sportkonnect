import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)

  const notifications = await prisma.notification.findMany({
    where:   { recipientId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take:    limit,
  })

  return NextResponse.json(
    notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))
  )
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { ids } = body as { ids?: string[] }

  if (ids && ids.length > 0) {
    await prisma.notification.updateMany({
      where: { id: { in: ids }, recipientId: session.user.id },
      data:  { read: true },
    })
  } else {
    await prisma.notification.updateMany({
      where: { recipientId: session.user.id, read: false },
      data:  { read: true },
    })
  }

  return NextResponse.json({ ok: true })
}
