'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { LanguageSelector } from '@/components/layout/LanguageSelector'
import { useTranslation } from 'react-i18next'

const NAV_LINKS = [
  { href: '/feed',      i18nKey: 'feed' },
  { href: '/matchs',    i18nKey: 'matches' },
  { href: '/recherche', i18nKey: 'search' },
  { href: '/messages',  i18nKey: 'messages' },
]

export function Navbar() {
  const { t } = useTranslation('common')
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const initial = session?.user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/10 bg-[#0F172A]/90 backdrop-blur">
      {/* Logo */}
      <Link href="/dashboard" className="shrink-0">
        <Image
          src="/logo-white.png"
          alt="SportKonnect"
          width={130}
          height={32}
          className="h-7 w-auto"
          priority
        />
      </Link>

      {/* Nav desktop */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map((link) => {
          const active = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full font-inter text-sm transition-colors ${
                active
                  ? 'bg-[#0B8F3C]/20 text-[#22C55E]'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
              }`}
            >
              {t(`nav.${link.i18nKey}`)}
            </Link>
          )
        })}
      </nav>

      {/* Droite */}
      <div className="flex items-center gap-3">
        <LanguageSelector />
        {session?.user && <NotificationBell />}
        {session?.user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="w-8 h-8 rounded-full bg-[#0B8F3C] flex items-center justify-center font-poppins text-sm font-bold text-white hover:bg-[#22C55E] transition-colors"
            >
              {initial}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#111827] border border-white/10 rounded-xl shadow-xl py-2 z-50">
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 font-inter text-sm text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Dashboard
                </Link>
                <hr className="border-white/10 my-1" />
                <button
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/login' }) }}
                  className="w-full text-left px-4 py-2.5 font-inter text-sm text-red-400 hover:bg-white/5 transition-colors"
                >
                  {t('nav.logout', 'Déconnexion')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
