'use client'

import { useTranslation } from 'react-i18next'

export function MessagesContent() {
  const { t } = useTranslation('common')

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-[#111827] rounded-2xl mb-6 text-3xl">💬</div>
      <h1 className="font-poppins text-2xl font-bold text-white mb-3">
        {t('messages.title', 'Messagerie')}
      </h1>
      <p className="font-inter text-[#9CA3AF] mb-6 max-w-md mx-auto">
        {t('messages.desc', 'La messagerie temps réel avec Socket.io arrive en Phase 3. Tu pourras contacter des joueurs et recruteurs directement.')}
      </p>
      <span className="inline-flex items-center gap-2 bg-[#111827] border border-[#0B8F3C]/20 rounded-full px-4 py-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
        <span className="font-inter text-xs text-[#9CA3AF]">
          {t('messages.coming_soon', 'Phase 3 — Bientôt disponible')}
        </span>
      </span>
    </main>
  )
}
