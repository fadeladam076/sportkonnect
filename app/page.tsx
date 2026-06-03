'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from '@/components/layout/LanguageSelector'
import { motion, Variants } from 'framer-motion'

const FEATURES = (t: any) => [
  {
    image: '/e21aacfe2a52e447e7b6a45335d6af54.jpg',
    icon: '⚽',
    title: t('features.passport.title', 'Passeport Numérique'),
    desc: t('features.passport.desc', 'Stats, santé, médias — ton profil complet visible par les recruteurs du monde entier.'),
  },
  {
    image: '/d0be3dd03badac6245aad579ecc3d10b.jpg',
    icon: '📍',
    title: t('features.matches.title', 'Matchs Locaux'),
    desc: t('features.matches.desc', 'Trouve et rejoins des matchs près de chez toi en quelques taps.'),
  },
  {
    image: '/aa4fe1690a38a2f40d1ed65b196f3006.jpg',
    icon: '🔍',
    title: t('features.scouts.title', 'Visibilité Recruteurs'),
    desc: t('features.scouts.desc', 'Les recruteurs recherchent des talents sur SportKonnect. Sois visible.'),
  },
]

const STATS = (t: any) => [
  { value: '100%', label: t('stats.free', 'Gratuit') },
  { value: '5',    label: t('stats.languages', 'Langues') },
  { value: '0$',   label: t('stats.cost', 'Coût') },
]

export default function HomePage() {
  const { t } = useTranslation('common')

  const features = FEATURES(t)
  const stats = STATS(t)

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  }

  const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -50 },
    show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  }

  const slideInRight: Variants = {
    hidden: { opacity: 0, x: 50 },
    show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  }

  return (
    <div className="bg-[#0F172A] text-white">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Image de fond */}
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <Image
            src="/hero_new.png"
            alt="SportKonnect hero"
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/85 to-[#0F172A]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-[#0F172A]/40" />
        </motion.div>

        {/* Navbar */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-50 flex items-center justify-between px-6 md:px-12 py-5"
        >
          <Image src="/logo-white.png" alt="SportKonnect" width={150} height={38} className="h-8 w-auto" priority />
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link href="/login"
              className="font-inter text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
              {t('nav.login')}
            </Link>
            <Link href="/register"
              className="bg-[#0B8F3C] hover:bg-[#22C55E] text-white rounded-full px-5 py-2.5 font-inter text-sm font-semibold transition-colors">
              {t('nav.register')}
            </Link>
          </div>
        </motion.header>

        {/* Contenu hero */}
        <div className="relative z-10 flex-1 flex items-center px-6 md:px-12 pb-20">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-white/5 border border-[#0B8F3C]/40 backdrop-blur rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="font-inter text-sm text-[#9CA3AF]">#Perform · #Progress · #Konnect</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-poppins text-5xl md:text-7xl font-bold leading-tight mb-4">
              Sport<span className="text-[#22C55E]">Konnect</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="font-poppins text-2xl md:text-3xl font-semibold text-[#22C55E] mb-5">
              {t('hero.title')}
            </motion.p>
            <motion.p variants={itemVariants} className="font-inter text-[#9CA3AF] text-lg max-w-lg mb-10 leading-relaxed">
              {t('hero.subtitle')}. {t('hero.description', 'Construis ton passeport numérique, rejoins des matchs, montre ta progression aux recruteurs.')}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <Link href="/register"
                className="inline-flex items-center justify-center bg-[#0B8F3C] hover:bg-[#22C55E] text-white rounded-full px-8 py-4 font-inter font-semibold text-base transition-colors min-h-[52px]">
                {t('hero.cta_register')} →
              </Link>
              <Link href="/login"
                className="inline-flex items-center justify-center border border-white/20 hover:border-white/50 text-white rounded-full px-8 py-4 font-inter font-semibold text-base transition-colors min-h-[52px] backdrop-blur">
                {t('hero.cta_login')}
              </Link>
            </motion.div>

            {/* Stats rapides */}
            <motion.div variants={itemVariants} className="flex gap-8 mt-12">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-poppins text-2xl font-bold text-[#22C55E]">{s.value}</div>
                  <div className="font-inter text-xs text-[#9CA3AF]">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="relative z-10 flex justify-center pb-8"
        >
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="font-inter text-xs text-[#4B5563]">{t('common.discover', 'Découvrir')}</span>
            <span className="text-[#4B5563]">↓</span>
          </div>
        </motion.div>
      </section>

      {/* ── PASSEPORT MOCKUP ─────────────────────────────── */}
      <section className="py-24 bg-[#0F172A] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Mockup carte joueur */}
          <motion.div 
            variants={slideInLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <div className="bg-[#111827] rounded-2xl p-6 shadow-2xl shadow-black/40 border border-white/5 relative z-10 hover:-translate-y-2 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#0B8F3C] shrink-0">
                  <Image src="/584cd625e6c1229f3fc982a6e528224a.jpg" alt="Player" fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-poppins text-xl font-bold text-white">Moussa DIALLO</div>
                  <span className="inline-block mt-1 bg-[#0B8F3C]/20 text-[#22C55E] border border-[#0B8F3C]/30 rounded-full px-3 py-0.5 text-xs font-inter">
                    {t('player.midfielder', 'Milieu de terrain')}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-poppins text-4xl font-bold text-[#22C55E]">87</div>
                  <div className="font-inter text-xs text-[#9CA3AF]">{t('stats.score')} / 100</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-5">
                {[[ '12', t('stats.goals') ],[ '8', t('stats.assists') ],[ '24', t('stats.matches') ],[ '78%', t('stats.wins') ]].map(([ v, l ], i) => (
                  <motion.div 
                    key={l} 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    viewport={{ once: true }}
                    className="bg-[#0F172A] rounded-xl p-3 text-center"
                  >
                    <div className="font-poppins text-lg font-bold text-[#22C55E]">{v}</div>
                    <div className="font-inter text-[10px] text-[#9CA3AF]">{l}</div>
                  </motion.div>
                ))}
              </div>

              {/* Radar bar preview */}
              <div className="space-y-2">
                {[[ t('stats.speed'), 82 ],[ t('stats.technique'), 91 ],[ t('stats.physical'), 75 ],[ t('stats.vision'), 88 ]].map(([ label, val ], i) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="font-inter text-xs text-[#9CA3AF] w-20">{label}</span>
                    <div className="flex-1 bg-[#0F172A] rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${val}%` }}
                        transition={{ duration: 1, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="bg-[#0B8F3C] h-1.5 rounded-full" 
                      />
                    </div>
                    <span className="font-inter text-xs text-[#22C55E] w-8 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-[#0B8F3C]/10 rounded-3xl blur-2xl -z-10" />
          </motion.div>

          {/* Texte */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="inline-flex items-center gap-2 bg-[#0B8F3C]/10 border border-[#0B8F3C]/30 rounded-full px-4 py-2 mb-6">
              <span className="text-[#22C55E] text-sm font-inter font-medium">{t('features.passport.title')}</span>
            </div>
            <h2 className="font-poppins text-4xl font-bold text-white mb-5 leading-tight">
              {t('features.passport.headline', 'Ton profil parle pour toi.')}
            </h2>
            <p className="font-inter text-[#9CA3AF] text-lg leading-relaxed mb-8">
              {t('features.passport.details', 'Stats par saison, score IA, radar physique, highlights vidéo, statut santé — tout ce qu\'un recruteur veut voir, au même endroit.')}
            </p>
            <Link href="/register"
              className="inline-flex items-center bg-[#0B8F3C] hover:bg-[#22C55E] text-white rounded-full px-7 py-3.5 font-inter font-semibold transition-colors">
              {t('features.passport.cta', 'Créer mon passeport →')}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="py-24 bg-[#111827]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="font-poppins text-4xl font-bold text-white mb-4">
              {t('features.title', 'Tout ce dont tu as besoin')}
            </h2>
            <p className="font-inter text-[#9CA3AF] text-lg max-w-xl mx-auto">
              {t('features.subtitle', 'Une seule plateforme pour jouer, progresser et te faire remarquer.')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div 
                key={f.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative h-96 rounded-2xl overflow-hidden group cursor-pointer"
              >
                <Image
                  src={f.image}
                  alt={f.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent" />
                <div className="absolute inset-0 bg-[#0B8F3C]/0 group-hover:bg-[#0B8F3C]/10 transition-colors duration-300" />
                <div className="absolute bottom-0 p-6 transform group-hover:-translate-y-2 transition-transform duration-300">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="font-poppins font-bold text-white text-xl mb-2">{f.title}</h3>
                  <p className="font-inter text-[#9CA3AF] text-sm leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACTION SHOT BANNER ───────────────────────────── */}
      <section className="relative h-80 overflow-hidden">
        <Image
          src="/9ffe749cfdd993b6d9cf004a706b2074.jpg"
          alt="SportKonnect action"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0F172A]/70" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        >
          <h2 className="font-poppins text-4xl md:text-5xl font-bold text-white mb-4">
            {t('banner.title_start', 'Montre ta')} <span className="text-[#22C55E]">{t('banner.title_accent', 'progression.')}</span>
          </h2>
          <p className="font-inter text-[#9CA3AF] text-lg mb-8 max-w-md">
            {t('banner.subtitle', 'Rejoins des milliers de joueurs africains qui construisent leur carrière sur SportKonnect.')}
          </p>
          <Link href="/register"
            className="bg-[#0B8F3C] hover:bg-[#22C55E] text-white rounded-full px-8 py-4 font-inter font-semibold text-base transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[#0B8F3C]/20">
            {t('banner.cta', 'Commencer maintenant — C\'est gratuit')}
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="bg-[#0F172A] border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Image src="/logo-white.png" alt="SportKonnect" width={130} height={32} className="h-7 w-auto" />
          <p className="font-inter text-xs text-[#4B5563] text-center">
            {t('footer.copyright', '© 2026 SportKonnect — La plateforme du football amateur africain.')}<br />
            Nephtali Koutia Prefna Mignongui Kinanga · kinanganephtali@gmail.com
          </p>
          <div className="flex gap-6">
            <Link href="/login" className="font-inter text-xs text-[#9CA3AF] hover:text-white transition-colors">{t('nav.login')}</Link>
            <Link href="/register" className="font-inter text-xs text-[#9CA3AF] hover:text-white transition-colors">{t('nav.register')}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
