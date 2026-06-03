'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

export default function LoginPage() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError(t('auth.error_invalid_credentials', 'Email ou mot de passe incorrect.'))
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#111827] rounded-2xl shadow-xl shadow-black/30 p-8">
        <h1 className="font-poppins text-2xl font-bold text-white mb-1">{t('auth.login')}</h1>
        <p className="font-inter text-[#9CA3AF] text-sm mb-8">
          {t('auth.welcome_back', 'Content de te revoir. Fais-toi repérer.')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-inter text-sm text-[#9CA3AF] mb-2">
              {t('auth.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ton@email.com"
              className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder-[#4B5563] focus:outline-none focus:border-[#0B8F3C] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-inter text-sm text-[#9CA3AF]">{t('auth.password')}</label>
              <Link href="/forgot-password" className="font-inter text-xs text-[#9CA3AF] hover:text-[#22C55E] transition-colors">
                {t('auth.forgot_password_short', 'Oublié ?')}
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder-[#4B5563] focus:outline-none focus:border-[#0B8F3C] transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm font-inter bg-red-400/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B8F3C] hover:bg-[#22C55E] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full py-3 font-inter font-semibold transition-colors min-h-[48px]"
          >
            {loading ? t('common.loading') : t('auth.login')}
          </button>
        </form>

        <p className="mt-6 text-center font-inter text-sm text-[#9CA3AF]">
          {t('auth.no_account')}{' '}
          <Link href="/register" className="text-[#22C55E] hover:underline font-medium">
            {t('auth.register_free', 'S\'inscrire gratuitement')}
          </Link>
        </p>
      </div>
    </div>
  )
}
