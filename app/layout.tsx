import type { Metadata } from 'next'
import { Poppins, Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import { Providers } from '@/components/providers'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SportKonnect — Fais-toi repérer.',
  description:
    'La plateforme du football amateur africain. Construis ton passeport numérique, rejoins des matchs, fais-toi repérer.',
  keywords: ['football', 'amateur', 'africain', 'recrutement', 'joueur', 'sport'],
  openGraph: {
    title: 'SportKonnect',
    description: 'La plateforme du football amateur africain.',
    type: 'website',
    images: [{ url: '/logo-color.png', width: 1200, height: 630 }],
  },
  icons: {
    icon: '/logo-white.png',
    apple: '/logo-white.png',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'fr'

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${inter.variable} bg-[#0F172A] text-white antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
