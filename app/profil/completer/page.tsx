'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const POSITIONS = [
  { value: 'gardien',   label: '🧤 Gardien (GK)' },
  { value: 'defenseur', label: '🛡️ Défenseur (DF)' },
  { value: 'milieu',    label: '⚙️ Milieu (MF)' },
  { value: 'attaquant', label: '⚡ Attaquant (FW)' },
]

const FEET = [
  { value: 'droit',     label: 'Pied droit' },
  { value: 'gauche',    label: 'Pied gauche' },
  { value: 'les deux',  label: 'Les deux pieds' },
]

export default function CompleterProfilPage() {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    firstName:    '',
    lastName:     '',
    dob:          '',
    nationality:  '',
    city:         '',
    positionMain: '',
    foot:         '',
    height:       '',
    weight:       '',
    vma:          '',
  })

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.dob || !form.nationality || !form.city || !form.positionMain) {
      setError('Remplis tous les champs obligatoires.')
      return
    }

    setLoading(true)

    // Upload avatar si sélectionné
    if (avatarFile) {
      const fd = new FormData()
      fd.append('file', avatarFile)
      await fetch('/api/upload/avatar', { method: 'POST', body: fd })
    }

    const res = await fetch('/api/players/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName:    form.firstName || undefined,
        lastName:     form.lastName  || undefined,
        dob:          form.dob,
        nationality:  form.nationality,
        city:         form.city,
        positionMain: form.positionMain,
        foot:         form.foot     || undefined,
        height:       form.height   ? parseFloat(form.height)  : undefined,
        weight:       form.weight   ? parseFloat(form.weight)  : undefined,
        vma:          form.vma      ? parseFloat(form.vma)     : undefined,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Une erreur est survenue.')
      return
    }

    router.push(`/profil/${data.id}`)
  }

  const inputClass =
    'w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder-[#4B5563] focus:outline-none focus:border-[#0B8F3C] transition-colors'

  const labelClass = 'block font-inter text-sm text-[#9CA3AF] mb-2'

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-4 py-12">
      <Image src="/logo-white.png" alt="SportKonnect" width={140} height={35} className="h-7 w-auto mb-10" />

      <div className="w-full max-w-lg">
        <div className="bg-[#111827] rounded-2xl shadow-xl shadow-black/30 p-8">
          <div className="mb-6">
            <h1 className="font-poppins text-2xl font-bold text-white mb-1">Mon passeport</h1>
            <p className="font-inter text-sm text-[#9CA3AF]">
              Ces infos seront visibles par les recruteurs. Les champs marqués <span className="text-[#22C55E]">*</span> sont obligatoires.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo de profil */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#0F172A] border-2 border-[#0B8F3C]/50 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <span className="text-4xl text-[#4B5563]">👤</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#0B8F3C] hover:bg-[#22C55E] rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg">
                  <span className="text-white text-lg font-bold leading-none">+</span>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>

            {/* Nom / Prénom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Prénom</label>
                <input type="text" placeholder="Kylian" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nom</label>
                <input type="text" placeholder="Mbappé" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} className={inputClass} />
              </div>
            </div>

            {/* Date de naissance */}
            <div>
              <label className={labelClass}>Date de naissance <span className="text-[#22C55E]">*</span></label>
              <input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} required className={inputClass} />
            </div>

            {/* Nationalité + Ville */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Nationalité <span className="text-[#22C55E]">*</span></label>
                <input type="text" placeholder="Français" value={form.nationality} onChange={(e) => set('nationality', e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ville <span className="text-[#22C55E]">*</span></label>
                <input type="text" placeholder="Dakar" value={form.city} onChange={(e) => set('city', e.target.value)} required className={inputClass} />
              </div>
            </div>

            {/* Position */}
            <div>
              <label className={labelClass}>Poste principal <span className="text-[#22C55E]">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {POSITIONS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => set('positionMain', p.value)}
                    className={`px-4 py-2.5 rounded-xl font-inter text-sm text-left transition-all border ${
                      form.positionMain === p.value
                        ? 'bg-[#0B8F3C]/20 border-[#0B8F3C] text-[#22C55E]'
                        : 'bg-[#0F172A] border-white/10 text-[#9CA3AF] hover:border-white/30'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pied fort */}
            <div>
              <label className={labelClass}>Pied fort</label>
              <div className="flex gap-2">
                {FEET.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => set('foot', f.value)}
                    className={`flex-1 px-3 py-2 rounded-xl font-inter text-sm transition-all border ${
                      form.foot === f.value
                        ? 'bg-[#0B8F3C]/20 border-[#0B8F3C] text-[#22C55E]'
                        : 'bg-[#0F172A] border-white/10 text-[#9CA3AF] hover:border-white/30'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Taille / Poids / VMA */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Taille (cm)</label>
                <input type="number" placeholder="178" value={form.height} onChange={(e) => set('height', e.target.value)} min="140" max="220" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Poids (kg)</label>
                <input type="number" placeholder="75" value={form.weight} onChange={(e) => set('weight', e.target.value)} min="40" max="150" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>VMA (km/h)</label>
                <input type="number" placeholder="17" value={form.vma} onChange={(e) => set('vma', e.target.value)} min="10" max="30" step="0.1" className={inputClass} />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm font-inter bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0B8F3C] hover:bg-[#22C55E] disabled:opacity-50 text-white rounded-full py-3 font-inter font-semibold transition-colors min-h-[48px]"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer mon passeport →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
