'use client'

import { useEffect, useState } from 'react'
import i18n from '@/lib/i18n-init'
import { I18nextProvider } from 'react-i18next'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
    }

    const locale = getCookie('NEXT_LOCALE') || 'fr'
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale)
    }
    setIsInitialized(true)
  }, [])

  if (!isInitialized) return null

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  )
}
