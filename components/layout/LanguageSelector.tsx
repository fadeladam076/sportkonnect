'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LOCALES, LOCALE_NAMES, LOCALE_FLAGS, type Locale } from '@/lib/i18n'
import { useRouter } from 'next/navigation'

export function LanguageSelector() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const currentLocale = (i18n.language?.split('-')[0] as Locale) || 'fr'

  const toggleDropdown = () => setIsOpen(!isOpen)

  const changeLanguage = (locale: Locale) => {
    i18n.changeLanguage(locale)
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000` // 1 an
    setIsOpen(false)
    router.refresh()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors border border-white/10"
      >
        <span className="text-lg">{LOCALE_FLAGS[currentLocale]}</span>
        <span className="text-sm font-medium uppercase">{currentLocale}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#111827] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {LOCALES.map((locale) => (
            <button
              key={locale}
              onClick={() => changeLanguage(locale)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#22C55E]/10 transition-colors ${
                currentLocale === locale ? 'text-[#22C55E] bg-[#22C55E]/5' : 'text-white/70'
              }`}
            >
              <span className="text-xl">{LOCALE_FLAGS[locale]}</span>
              <span className="font-inter text-sm font-medium">{LOCALE_NAMES[locale]}</span>
              {currentLocale === locale && (
                <svg className="ml-auto w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
