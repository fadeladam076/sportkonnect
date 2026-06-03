import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

type Params = { params: Promise<{ id: string }> }

const commentSchema = z.object({
  content:  z.string().min(1).max(500),
  parentId: z.string().optional(),
})

export async function GET(_req: Request, { params }: Params) {
  const { id: postId } = await params

  // Récupère tous les commentaires du post (sans relation author pour éviter le type manquant)
  const rawComments = await prisma.comment.findMany({
    where:   { postId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, content: true, authorId: true,
      parentId: true, createdAt: true, postId: true,
    },
  })

  if (rawComments.length === 0) return NextResponse.json([])

  // Récupère les auteurs en une seule requête
  const authorIds = [...new Set(rawComments.map((c) => c.authorId))]
  const users = await prisma.user.findMany({
    where:  { id: { in: authorIds } },
    select: {
      id: true, email: true,
      player: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
    },
  })
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  // Assemble les commentaires avec leurs auteurs
  const withAuthor = rawComments.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    author: userMap[c.authorId] ?? { id: c.authorId, email: null, player: null },
    replies: [] as typeof rawComments,
  }))

  // Sépare top-level et réponses
  const topLevel = withAuthor.filter((c) => !c.parentId)
  const replies  = withAuthor.filter((c) => !!c.parentId)

  const result = topLevel.map((c) => ({
    ...c,
    replies: replies.filter((r) => r.parentId === c.id),
  }))

  return NextResponse.json(result)
}

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { id: postId } = await params
  const body   = await request.json().catch(() => null)
  const parsed = commentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Contenu invalide.' }, { status: 400 })

  const { content, parentId } = parsed.data

  const post = await prisma.post.findUnique({
    where: { id: postId }, select: { authorId: true, content: true },
  })
  if (!post) return NextResponse.json({ error: 'Post introuvable.' }, { status: 404 })

  const comment = await prisma.comment.create({
    data: { postId, authorId: session.user.id, content, parentId: parentId ?? null },
    select: { id: true, content: true, authorId: true, parentId: true, createdAt: true, postId: true },
  })

  // Récupère l'auteur
  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: {
      id: true, email: true,
      player: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
    },
  })

  // Notification si ce n'est pas l'auteur du post
  if (post.authorId !== session.user.id && !parentId) {
    const commenterName = user?.player
      ? `${user.player.firstName} ${user.player.lastName}`
      : (session.user.email ?? 'Quelqu\'un')

    await createNotification(post.authorId, 'COMMENT', {
      postId,
      commenterName,
      postPreview: (post.content ?? '').slice(0, 60),
    })
  }

  return NextResponse.json({
    ...comment,
    createdAt: comment.createdAt.toISOString(),
    author: user ?? { id: session.user.id, email: null, player: null },
    replies: [],
  }, { status: 201 })
}
