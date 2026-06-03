'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

const ITEMS = [
  { href: '/dashboard', i18nKey: 'home', icon: '🏠' },
  { href: '/feed',      i18nKey: 'feed',    icon: '📰' },
  { href: '/matchs',    i18nKey: 'matches',  icon: '⚽' },
  { href: '/messages',  i18nKey: 'messages', icon: '💬' },
  { href: '/recherche', i18nKey: 'search', icon: '🔍' },
]

export function MobileNav() {
  const { t } = useTranslation('common')
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#111827] border-t border-white/10 flex md:hidden safe-area-bottom">
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
              active ? 'text-[#22C55E]' : 'text-[#9CA3AF]'
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="font-inter text-[10px]">{t(`nav.${item.i18nKey}`)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
