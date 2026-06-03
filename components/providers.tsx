'use client'

import { SessionProvider } from 'next-auth/react'
import { I18nProvider } from './i18n-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchOnWindowFocus={false}
      refetchInterval={0}
    >
      <I18nProvider>
        {children}
      </I18nProvider>
    </SessionProvider>
  )
}
