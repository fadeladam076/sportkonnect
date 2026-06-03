import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { id: postId } = await params

  await prisma.like.upsert({
    where:  { postId_userId: { postId, userId: session.user.id } },
    create: { postId, userId: session.user.id },
    update: {},
  })

  const post = await prisma.post.findUnique({
    where:  { id: postId },
    select: { authorId: true, content: true },
  })

  if (post && post.authorId !== session.user.id) {
    const liker = await prisma.player.findUnique({
      where:  { userId: session.user.id },
      select: { firstName: true, lastName: true },
    })
    const likerName = liker
      ? `${liker.firstName} ${liker.lastName}`
      : session.user.email ?? 'Quelqu\'un'

    await createNotification(post.authorId, 'LIKE', {
      postId,
      likerName,
      postPreview: (post.content ?? '').slice(0, 60),
    })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { id: postId } = await params

  await prisma.like.deleteMany({
    where: { postId, userId: session.user.id },
  })

  return NextResponse.json({ ok: true })
}
