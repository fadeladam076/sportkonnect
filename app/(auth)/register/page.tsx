'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

type Role = 'PLAYER' | 'CLUB_ADMIN' | 'RECRUITER'

const ROLES = [
  {
    value: 'PLAYER' as Role,
    label: 'Joueur',
    description: 'Je veux créer mon passeport numérique et me faire repérer.',
    icon: '⚽',
  },
  {
    value: 'CLUB_ADMIN' as Role,
    label: 'Club',
    description: 'Je gère un club et je veux organiser des matchs.',
    icon: '🏟️',
  },
  {
    value: 'RECRUITER' as Role,
    label: 'Recruteur',
    description: 'Je recherche des talents pour mon organisation.',
    icon: '🔍',
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [role, setRole] = useState<Role | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleRoleSelect(r: Role) {
    setRole(r)
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role, firstName, lastName }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Une erreur est survenue.')
      setLoading(false)
      return
    }

    await signIn('credentials', { email, password, redirect: false })
    router.push(role === 'PLAYER' ? '/profil/completer' : '/dashboard')
  }

  const selectedRole = ROLES.find((r) => r.value === role)

  /* ── Étape 1 : choix du rôle ── */
  if (step === 1) {
    return (
      <div className="w-full max-w-lg">
        <h1 className="font-poppins text-2xl font-bold text-white mb-2 text-center">
          Je suis…
        </h1>
        <p className="font-inter text-[#9CA3AF] text-sm mb-8 text-center">
          Choisis ton profil pour commencer
        </p>

        <div className="space-y-3">
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => handleRoleSelect(r.value)}
              className="w-full bg-[#111827] hover:bg-[#1a2332] border border-white/10 hover:border-[#0B8F3C] rounded-xl p-5 text-left transition-all group"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{r.icon}</span>
                <div className="flex-1">
                  <div className="font-poppins font-semibold text-white group-hover:text-[#22C55E] transition-colors">
                    {r.label}
                  </div>
                  <div className="font-inter text-sm text-[#9CA3AF]">{r.description}</div>
                </div>
                <span className="text-[#9CA3AF] group-hover:text-[#22C55E] transition-colors text-lg">
                  →
                </span>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center font-inter text-sm text-[#9CA3AF]">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-[#22C55E] hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    )
  }

  /* ── Étape 2 : formulaire ── */
  return (
    <div className="w-full max-w-md">
      <div className="bg-[#111827] rounded-2xl shadow-xl shadow-black/30 p-8">
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-2 text-[#9CA3AF] hover:text-white font-inter text-sm mb-6 transition-colors"
        >
          ← Retour
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">{selectedRole?.icon}</span>
          <div>
            <h1 className="font-poppins text-xl font-bold text-white">Créer mon compte</h1>
            <p className="font-inter text-sm text-[#9CA3AF]">{selectedRole?.label}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {role === 'PLAYER' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-inter text-sm text-[#9CA3AF] mb-2">Prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Kylian"
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder-[#4B5563] focus:outline-none focus:border-[#0B8F3C] transition-colors"
                />
              </div>
              <div>
                <label className="block font-inter text-sm text-[#9CA3AF] mb-2">Nom</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Mbappé"
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder-[#4B5563] focus:outline-none focus:border-[#0B8F3C] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-inter text-sm text-[#9CA3AF] mb-2">Adresse email</label>
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
            <label className="block font-inter text-sm text-[#9CA3AF] mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min. 8 caractères"
              className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder-[#4B5563] focus:outline-none focus:border-[#0B8F3C] transition-colors"
            />
          </div>

          <div>
            <label className="block font-inter text-sm text-[#9CA3AF] mb-2">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  )
}
