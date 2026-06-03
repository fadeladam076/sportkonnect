'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const LEVELS = [
  { value: 'debutant',      label: '🟢 Débutant' },
  { value: 'intermediaire', label: '🟡 Intermédiaire' },
  { value: 'avance',        label: '🟠 Avancé' },
  { value: 'pro',           label: '🔴 Pro' },
]

export default function NouveauMatchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '', city: '', address: '', date: '', level: 'intermediaire',
    maxPlayers: '16', ageMin: '', ageMax: '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title:      form.title,
        city:       form.city,
        address:    form.address,
        date:       new Date(form.date).toISOString(),
        level:      form.level,
        maxPlayers: parseInt(form.maxPlayers),
        ageMin:     form.ageMin ? parseInt(form.ageMin) : undefined,
        ageMax:     form.ageMax ? parseInt(form.ageMax) : undefined,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? 'Erreur.'); return }
    router.push(`/matchs/${data.id}`)
  }

  const inputClass = 'w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder-[#4B5563] focus:outline-none focus:border-[#0B8F3C] transition-colors'
  const labelClass = 'block font-inter text-sm text-[#9CA3AF] mb-2'

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/matchs" className="text-[#9CA3AF] hover:text-white transition-colors font-inter text-sm">
            ← Matchs
          </Link>
        </div>

        <div className="bg-[#111827] rounded-2xl shadow-xl shadow-black/30 p-8">
          <h1 className="font-poppins text-2xl font-bold text-white mb-1">Créer un match</h1>
          <p className="font-inter text-sm text-[#9CA3AF] mb-8">
            Organise un match et invite des joueurs à te rejoindre.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Titre du match *</label>
              <input type="text" required placeholder="Ex: Match amical Dakar Centre" value={form.title} onChange={(e) => set('title', e.target.value)} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Ville *</label>
                <input type="text" required placeholder="Dakar" value={form.city} onChange={(e) => set('city', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Adresse *</label>
                <input type="text" required placeholder="Stade Léopold" value={form.address} onChange={(e) => set('address', e.target.value)} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Date et heure *</label>
              <input type="datetime-local" required value={form.date} onChange={(e) => set('date', e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Niveau *</label>
              <div className="grid grid-cols-2 gap-2">
                {LEVELS.map((l) => (
                  <button key={l.value} type="button" onClick={() => set('level', l.value)}
                    className={`px-4 py-2.5 rounded-xl font-inter text-sm text-left transition-all border ${
                      form.level === l.value ? 'bg-[#0B8F3C]/20 border-[#0B8F3C] text-[#22C55E]' : 'bg-[#0F172A] border-white/10 text-[#9CA3AF] hover:border-white/30'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Nb joueurs *</label>
                <input type="number" required min="2" max="100" value={form.maxPlayers} onChange={(e) => set('maxPlayers', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Âge min</label>
                <input type="number" min="10" max="80" placeholder="—" value={form.ageMin} onChange={(e) => set('ageMin', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Âge max</label>
                <input type="number" min="10" max="80" placeholder="—" value={form.ageMax} onChange={(e) => set('ageMax', e.target.value)} className={inputClass} />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm font-inter bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-[#0B8F3C] hover:bg-[#22C55E] disabled:opacity-50 text-white rounded-full py-3 font-inter font-semibold transition-colors min-h-[48px]"
            >
              {loading ? 'Création...' : 'Créer le match'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
