import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { MobileNav } from '@/components/layout/MobileNav'
import { MessagesContent } from '@/components/messages/MessagesContent'

export const metadata = { title: 'Messages — SportKonnect' }

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-[#0F172A] pb-20 md:pb-0">
      <Navbar />
      <MessagesContent />
      <MobileNav />
    </div>
  )
}
