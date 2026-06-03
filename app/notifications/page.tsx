import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { MobileNav } from '@/components/layout/MobileNav'
import { NOTIF_ICONS, getNotifText, getNotifLink } from '@/lib/notifications'

export const metadata = { title: 'Notifications — SportKonnect' }

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `il y a ${mins}min`
  const h = Math.floor(mins / 60)
  if (h < 24) return `il y a ${h}h`
  return `il y a ${Math.floor(h / 24)}j`
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const notifications = await prisma.notification.findMany({
    where:   { recipientId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  await prisma.notification.updateMany({
    where: { recipientId: session.user.id, read: false },
    data:  { read: true },
  })

  const grouped: Record<string, typeof notifications> = {}
  for (const n of notifications) {
    const day = new Date(n.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    if (!grouped[day]) grouped[day] = []
    grouped[day].push(n)
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="font-poppins text-2xl font-bold text-white mb-6">Notifications</h1>

        {notifications.length === 0 ? (
          <div className="bg-[#111827] rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">🔔</div>
            <p className="font-poppins font-semibold text-white mb-2">Tout est à jour</p>
            <p className="font-inter text-sm text-[#9CA3AF]">
              Tes notifications apparaîtront ici — likes, matchs, messages.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([day, notifs]) => (
              <div key={day}>
                <p className="font-inter text-xs text-[#4B5563] uppercase tracking-wider mb-3 capitalize">
                  {day}
                </p>
                <div className="bg-[#111827] rounded-xl overflow-hidden shadow-lg shadow-black/20 divide-y divide-white/5">
                  {notifs.map((n) => {
                    const payload = n.payload as Record<string, string>
                    return (
                      <Link
                        key={n.id}
                        href={getNotifLink(n.type, payload)}
                        className="flex items-start gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#0F172A] flex items-center justify-center text-xl shrink-0">
                          {NOTIF_ICONS[n.type] ?? '🔔'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-inter text-sm text-white leading-snug">
                            {getNotifText(n.type, payload)}
                          </p>
                          <p className="font-inter text-xs text-[#9CA3AF] mt-1">
                            {timeAgo(new Date(n.createdAt))}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  )
}
