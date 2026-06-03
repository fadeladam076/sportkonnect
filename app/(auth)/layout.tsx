import Image from 'next/image'
import Link from 'next/link'

const QUOTES = [
  '"Fais-toi repérer."',
  '"Montre ta progression."',
  '"Ton talent mérite d\'être vu."',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F172A] flex">

      {/* ── Panneau gauche — image (desktop uniquement) ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden shrink-0">
        <Image
          src="/9ffe749cfdd993b6d9cf004a706b2074.jpg"
          alt="SportKonnect"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/20 to-[#0F172A]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/60 via-transparent to-transparent" />

        {/* Brand en haut */}
        <div className="absolute top-8 left-8 z-10">
          <Link href="/">
            <Image src="/logo-white.png" alt="SportKonnect" width={140} height={35} className="h-8 w-auto" />
          </Link>
        </div>

        {/* Tagline en bas */}
        <div className="absolute bottom-10 left-8 right-8 z-10">
          <p className="font-poppins text-3xl font-bold text-white leading-tight mb-3">
            {QUOTES[0]}
          </p>
          <p className="font-inter text-[#9CA3AF] text-sm">
            La plateforme du football amateur africain.
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-6">
            {[['100%', 'Gratuit'], ['5', 'Langues'], ['0$', 'Coût']].map(([v, l]) => (
              <div key={l}>
                <div className="font-poppins text-xl font-bold text-[#22C55E]">{v}</div>
                <div className="font-inter text-xs text-[#9CA3AF]">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="flex-1 flex flex-col">
        {/* Mobile : logo en haut */}
        <div className="flex lg:hidden items-center justify-between px-6 py-5 border-b border-white/5">
          <Link href="/">
            <Image src="/logo-white.png" alt="SportKonnect" width={130} height={32} className="h-7 w-auto" />
          </Link>
        </div>

        {/* Formulaire centré */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          {children}
        </div>
      </div>
    </div>
  )
}
