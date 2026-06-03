import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const postSchema = z.object({
  content:  z.string().min(1).max(500),
  hashtags: z.array(z.string()).optional(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor')
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '10'), 20)

  const session = await getServerSession(authOptions)

  const posts = await prisma.post.findMany({
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          player: {
            select: { id: true, firstName: true, lastName: true, photoUrl: true, positionMain: true },
          },
        },
      },
      _count: { select: { likes: true, comments: true } },
      likes: session?.user?.id
        ? { where: { userId: session.user.id }, select: { id: true } }
        : false,
    },
  })

  const hasMore = posts.length > limit
  const data    = hasMore ? posts.slice(0, limit) : posts

  return NextResponse.json({
    posts: data.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
    nextCursor: hasMore ? data[data.length - 1]?.id ?? null : null,
  })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Contenu invalide.' }, { status: 400 })
  }

  const { content, hashtags: rawHashtags } = parsed.data

  const autoHashtags = (content.match(/#\w+/g) ?? []).map((t) => t.slice(1))
  const hashtags = [...new Set([...(rawHashtags ?? []), ...autoHashtags])]

  const post = await prisma.post.create({
    data: {
      authorId: session.user.id,
      content,
      hashtags,
      type: 'TEXT',
    },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          player: {
            select: { id: true, firstName: true, lastName: true, photoUrl: true, positionMain: true },
          },
        },
      },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: session.user.id }, select: { id: true } },
    },
  })

  return NextResponse.json({ ...post, createdAt: post.createdAt.toISOString() }, { status: 201 })
}
