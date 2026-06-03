import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Feed } from '@/components/feed/Feed'

export const metadata = { title: 'Feed — SportKonnect' }

export default async function FeedPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const posts = await prisma.post.findMany({
    take: 10,
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
      likes: { where: { userId: session.user.id }, select: { id: true } },
    },
  })

  const initialPosts = posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }))

  return (
    <div className="min-h-screen bg-[#0F172A] pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Feed initialPosts={initialPosts} currentUserId={session.user.id} />
      </main>
      <MobileNav />
    </div>
  )
}
