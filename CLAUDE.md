# SportKonnect — Contexte Projet (CLAUDE.md)

> Ce fichier est lu automatiquement par Claude Code / Antygravity à chaque session.
> Il contient le contexte complet et les règles du projet SportKonnect.
> **Ne pas supprimer ce fichier.**

---

## 🎯 QU'EST-CE QUE SPORTKONNECT ?

SportKonnect est une **plateforme web** dédiée au football amateur africain.
Vision : devenir le **LinkedIn du football amateur africain**.

- Les **joueurs** construisent un passeport numérique (stats, santé, éducation, médias)
- Les **clubs** gèrent leur effectif et publient des matchs
- Les **recruteurs** recherchent et comparent des talents
- Tout le monde peut interagir via un **réseau social sportif**

**Propriétaire** : Nephtali Koutia Prefna Mignongui Kinanga — kinanganephtali@gmail.com
**Assistant IA** : Antygravity
**Statut** : En développement actif

---

## 🏗️ STACK TECHNIQUE (immuable — ne pas changer)

```
Frontend + Backend : Next.js 16 (App Router) sur Vercel
Styles            : Tailwind CSS + shadcn/ui
Base de données   : PostgreSQL (Supabase — gratuit)
ORM               : Prisma
Auth              : NextAuth.js
Stockage médias   : Cloudflare R2 (10 GB gratuit)
Recherche         : Meilisearch Cloud (gratuit)
Temps réel        : Socket.io
Cache             : Upstash Redis (gratuit)
Hébergement       : Vercel (100% gratuit)
CI/CD             : GitHub Actions
Langage           : TypeScript (obligatoire partout)
```

**Coût total** : 0 $ jusqu'à ~10 000 utilisateurs actifs.

---

## 📁 STRUCTURE DOSSIERS

```
sportkonnect/
├── app/
│   ├── (auth)/login         page/route login
│   ├── (auth)/register      page/route inscription
│   ├── (dashboard)/         tableau de bord
│   ├── profil/[id]/         passeport joueur
│   ├── feed/                réseau social
│   ├── matchs/              matchs & compétitions
│   ├── messages/            messagerie
│   ├── clubs/[id]/          espace clubs
│   ├── recruteurs/          espace recruteurs
│   ├── recherche/           recherche avancée
│   └── admin/               back-office
├── app/api/                 API Routes Next.js (tout le backend)
│   ├── auth/[...nextauth]/  NextAuth
│   ├── players/             CRUD joueurs + stats
│   ├── posts/               feed social
│   ├── matches/             matchs
│   ├── messages/            messagerie
│   ├── search/              Meilisearch
│   └── upload/              Cloudflare R2
├── components/
│   ├── ui/                  shadcn/ui (jamais modifier ces fichiers)
│   ├── profil/              PlayerCard, RadarChart, StatsGrid, HealthBadge
│   ├── feed/                PostCard, PostComposer, CommentThread
│   ├── chat/                MessageBubble, ConversationList, TypingIndicator
│   ├── match/               MatchCard, MatchMap, ParticipantsList
│   └── layout/              Navbar, Sidebar, MobileNav, Footer, LanguageSelector
├── lib/
│   ├── prisma.ts            singleton Prisma client
│   ├── auth.ts              config NextAuth (options)
│   ├── r2.ts                client S3 compatible Cloudflare R2
│   ├── redis.ts             client Upstash Redis
│   ├── meilisearch.ts       client Meilisearch
│   └── ai-score.ts          calcul Score de Performance Global
├── hooks/
│   ├── usePlayer.ts         fetch profil joueur
│   ├── useFeed.ts           infinite scroll feed
│   ├── useSocket.ts         connexion Socket.io
│   └── useNotifications.ts  notifications temps réel
├── store/
│   ├── authStore.ts         Zustand — utilisateur connecté
│   ├── chatStore.ts         Zustand — conversations actives
│   └── notifStore.ts        Zustand — notifications non-lues
├── prisma/
│   └── schema.prisma        source de vérité BDD
└── public/
    └── locales/
        ├── fr/common.json   Français (langue principale)
        ├── en/common.json   Anglais
        ├── es/common.json   Espagnol
        ├── de/common.json   Allemand
        └── zh/common.json   Mandarin
```

---

## 🗃️ SCHÉMA PRISMA (dernière version)

```prisma
enum Role        { PLAYER CLUB_ADMIN RECRUITER MODERATOR ADMIN }
enum Health      { FIT INJURED SUSPENDED RECOVERING }
enum PostType    { TEXT IMAGE VIDEO STATS }
enum MediaCat    { HIGHLIGHT FULL_MATCH TRAINING DETECTION COMPETITION }
enum MsgType     { TEXT IMAGE VIDEO DOCUMENT }
enum MatchStatus { OPEN FULL CLOSED COMPLETED }

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  role         Role      @default(PLAYER)
  lang         String    @default("fr")
  verified     Boolean   @default(false)
  createdAt    DateTime  @default(now())
  player       Player?
  club         Club?
  recruiter    Recruiter?
  posts        Post[]
  sentMessages Message[] @relation("sender")
  notifications Notification[]
}

model Player {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  firstName       String
  lastName        String
  dob             DateTime
  nationality     String
  city            String
  height          Float?
  weight          Float?
  foot            String?
  positionMain    String
  positionsOther  String[]
  photoUrl        String?
  healthStatus    Health   @default(FIT)
  vma             Float?
  lastMedicalDate DateTime?
  aiScore         Float?
  stats           PlayerStat[]
  injuries        Injury[]
  education       Education?
  medicalDocs     MedicalDoc[]
  media           Media[]
  clubMemberships ClubPlayer[]
  matchParticipations MatchParticipant[]
}

model PlayerStat {
  id            String  @id @default(cuid())
  playerId      String
  player        Player  @relation(fields: [playerId], references: [id], onDelete: Cascade)
  season        String
  matchesPlayed Int     @default(0)
  wins          Int     @default(0)
  goals         Int     @default(0)
  assists       Int     @default(0)
  minutesPlayed Int     @default(0)
  yellowCards   Int     @default(0)
  redCards      Int     @default(0)
  speed         Float?
  technique     Float?
  physical      Float?
  mental        Float?
  vision        Float?
  shooting      Float?
  updatedAt     DateTime @updatedAt
  @@unique([playerId, season])
}

model Club {
  id          String  @id @default(cuid())
  userId      String  @unique
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  logoUrl     String?
  city        String
  description String?
  foundedYear Int?
  verified    Boolean @default(false)
  players     ClubPlayer[]
  matches     Match[]
}

model Match {
  id           String      @id @default(cuid())
  title        String
  organizerId  String
  clubId       String?
  club         Club?       @relation(fields: [clubId], references: [id])
  city         String
  address      String
  latitude     Float?
  longitude    Float?
  date         DateTime
  level        String
  ageMin       Int?
  ageMax       Int?
  maxPlayers   Int
  status       MatchStatus @default(OPEN)
  participants MatchParticipant[]
  createdAt    DateTime    @default(now())
}

model Post {
  id        String   @id @default(cuid())
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  content   String?
  mediaUrls String[]
  hashtags  String[]
  type      PostType @default(TEXT)
  likes     Like[]
  comments  Comment[]
  createdAt DateTime @default(now())
  @@index([createdAt(sort: Desc)])
}

model Notification {
  id          String   @id @default(cuid())
  recipientId String
  recipient   User     @relation(fields: [recipientId], references: [id], onDelete: Cascade)
  type        String
  payload     Json
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())
  @@index([recipientId, read])
}
```

---

## 🎨 CHARTE GRAPHIQUE (obligatoire — ne jamais dévier)

### Couleurs officielles

```css
/* === FOND (dark mode — l'app est TOUJOURS en dark mode) === */
--bg-primary:    #0F172A;   /* Arrière-plan global */
--bg-secondary:  #111827;   /* Cartes, blocs de contenu */

/* === VERT SPORTKONNECT === */
--green-main:    #0B8F3C;   /* Boutons CTA, actions clés */
--green-accent:  #22C55E;   /* Hover, états actifs, feedback, stats */

/* === TEXTE === */
--text-primary:  #FFFFFF;   /* Texte principal */
--text-muted:    #9CA3AF;   /* Texte secondaire, icônes inactives */

/* === BORDURES === */
--border:        #E5E7EB;   /* Bordures, séparateurs */
```

**Règle absolue :** Le vert est réservé aux actions importantes. Toujours maintenir un contraste élevé.

### Tailwind config (tailwind.config.ts)

```typescript
colors: {
  background: {
    primary:   '#0F172A',
    secondary: '#111827',
  },
  green: {
    main:   '#0B8F3C',
    accent: '#22C55E',
  },
  text: {
    primary: '#FFFFFF',
    muted:   '#9CA3AF',
  },
  border: '#E5E7EB',
}
```

### Typographie

| Usage | Police | Graisse |
|-------|--------|---------|
| Titres, impact | **Poppins** | Bold / Semi-Bold |
| Corps, interfaces | **Inter** | Regular / Medium |
| Statistiques (grandes) | **Poppins** | Bold, couleur `#22C55E` |

```typescript
// next.config + layout.tsx
import { Poppins, Inter } from 'next/font/google'
const poppins = Poppins({ subsets: ['latin'], weight: ['600', '700'] })
const inter   = Inter({ subsets: ['latin'], weight: ['400', '500'] })
```

**Règle des 3 secondes** : les stats, nom et poste doivent être lisibles et compris en < 3 secondes.

### Composants UI

**Cartes :**
- Fond : `bg-[#111827]`
- Coins arrondis : `rounded-xl` (12px) à `rounded-2xl` (16px) maximum
- Ombre légère : `shadow-lg shadow-black/20`

**Boutons (Pill Shape — très arrondis) :**
```tsx
// Primaire
<button className="bg-[#0B8F3C] hover:bg-[#22C55E] text-white rounded-full px-6 py-3 font-semibold transition-colors">
  S'inscrire
</button>

// Secondaire (outline)
<button className="border border-[#E5E7EB] hover:border-[#9CA3AF] text-white rounded-full px-6 py-3 font-semibold transition-colors">
  Voir profil
</button>
```

**Espacement :** système de grille en multiples de 8px (`gap-2`, `gap-4`, `gap-6`, `gap-8`...)
**Boutons minimum 44px** de hauteur (accessibilité mobile).

### Règles UX

- **Mobile-first** — chaque composant pensé smartphone d'abord
- **Chemin critique ≤ 3 taps** pour toutes les actions clés
- **Vert accent `#22C55E`** uniquement pour : hover, états actifs, feedback succès, statistiques
- **Simplicité max** — interfaces épurées, sans surcharge cognitive
- Vidéos highlights accessibles en **1 tap** depuis le profil

### Logo

- Taille minimale : hauteur **≥ 24px** sur mobile
- Ne jamais déformer, étirer, changer les couleurs, ajouter des ombres ou gradients non prévus
- Placement : header, écran d'accueil, page onboarding

### Ton & Voix de la Marque

- Style : **Direct · Ambitieux · Encourageant · Crédible**
- Accroches : *"Fais-toi repérer."* / *"Montre ta progression."*
- CTA courts et orientés action
- Hashtags officiels : **#Perform #Progress #Konnect**

---

## 🤖 CALCUL SCORE IA (lib/ai-score.ts)

```typescript
// Pondérations par poste
const WEIGHTS: Record<string, Record<string, number>> = {
  attaquant:  { goals: 0.30, assists: 0.15, shooting: 0.20, speed: 0.15, technique: 0.10, physical: 0.10 },
  milieu:     { assists: 0.25, vision: 0.25, technique: 0.20, mental: 0.15, goals: 0.10, physical: 0.05 },
  defenseur:  { physical: 0.30, mental: 0.25, technique: 0.20, vision: 0.15, speed: 0.10 },
  gardien:    { mental: 0.35, physical: 0.25, technique: 0.25, vision: 0.15 },
}

export function calculateSPG(stats: PlayerStat, position: string): number {
  const w = WEIGHTS[position.toLowerCase()] ?? WEIGHTS.milieu
  const participation = stats.matchesPlayed > 0 ? stats.wins / stats.matchesPlayed : 0
  const goalsPerMatch = stats.matchesPlayed > 0 ? Math.min(stats.goals / stats.matchesPlayed, 1) : 0
  const assistsPerMatch = stats.matchesPlayed > 0 ? Math.min(stats.assists / stats.matchesPlayed, 1) : 0

  const score =
    (goalsPerMatch    * (w.goals    ?? 0) * 100) +
    (assistsPerMatch  * (w.assists  ?? 0) * 100) +
    ((stats.shooting  ?? 50) * (w.shooting  ?? 0)) +
    ((stats.speed     ?? 50) * (w.speed     ?? 0)) +
    ((stats.technique ?? 50) * (w.technique ?? 0)) +
    ((stats.physical  ?? 50) * (w.physical  ?? 0)) +
    ((stats.mental    ?? 50) * (w.mental    ?? 0)) +
    ((stats.vision    ?? 50) * (w.vision    ?? 0)) +
    (participation    * 10)

  return Math.min(Math.round(score), 100)
}
```

---

## 🌍 INTERNATIONALISATION

- Package : `next-i18next`
- 5 langues : `fr` (défaut), `en`, `es`, `de`, `zh`
- Composant `<LanguageSelector>` dans le Navbar : dropdown drapeaux, persisté en cookie `NEXT_LOCALE`
- Chaque page utilise `useTranslation('common')`

---

## 🔐 RÈGLES SÉCURITÉ ABSOLUES

| Règle | Implémentation |
|-------|---------------|
| Mots de passe | bcrypt, cost=12 |
| JWT access | 15min, en mémoire React |
| JWT refresh | 7j, httpOnly cookie |
| Rate limiting | Upstash Redis sliding window |
| Validation inputs | Zod sur toutes les API routes |
| Docs médicaux | AES-256-GCM avant upload R2 |
| CORS | Whitelist domaines Vercel uniquement |
| XSS | Next.js échappe auto + CSP headers |

---

## 📅 PHASE EN COURS

> **Mettre à jour cette section après chaque phase terminée**

- [x] Setup initial
- [ ] **Phase 1** ← EN COURS — Auth + Passeport joueur + i18n
- [ ] Phase 2 — Feed social + Matchs + Recherche
- [ ] Phase 3 — Messagerie + Notifications
- [ ] Phase 4 — Clubs + Recruteurs
- [ ] Phase 5 — Score IA + Admin
- [ ] Phase 6 — Tests + Launch

---

## 📌 DÉCISIONS PRISES (ne pas revenir dessus)

- ✅ Web uniquement (pas de mobile React Native pour l'instant)
- ✅ Tout sur Vercel — pas de Railway ni de serveur séparé
- ✅ Supabase pour PostgreSQL
- ✅ Cloudflare R2 pour les médias (pas AWS S3)
- ✅ Socket.io pour le temps réel (pas Supabase Realtime)
- ✅ Meilisearch pour la recherche (pas Algolia)
- ✅ Score IA en TypeScript pur (pas de Python en v1)
- ✅ Coût total : 0 $ en free tiers

---

## 🆘 COMMANDES UTILES

```bash
# Démarrer le dev
npm run dev

# Migrations Prisma
npx prisma migrate dev --name "nom_migration"
npx prisma migrate deploy          # en production

# Prisma Studio (visualiser la DB)
npx prisma studio

# Générer les types Prisma
npx prisma generate

# Indexer les joueurs dans Meilisearch
npx ts-node scripts/index-players.ts

# Lint & type check
npm run lint
npm run type-check
```

---

## 💬 MOT DE CODE

Si Antygravity ne se souvient plus du contexte, dire :
> **"SportKonnect — recharge le contexte"**

Il doit relire ce fichier CLAUDE.md et reprendre là où on s'était arrêté.

---

*Dernière mise à jour : Juin 2026 | Nephtali Koutia Prefna Mignongui Kinanga — kinanganephtali@gmail.com*
