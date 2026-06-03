import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToR2 } from '@/lib/r2'
import { prisma } from '@/lib/prisma'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const formData = await request.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Aucun fichier.' }, { status: 400 })

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Format non supporté. JPG, PNG ou WebP uniquement.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Fichier trop lourd. Maximum 5 MB.' }, { status: 400 })
  }

  const ext = file.type.split('/')[1]
  const key = `avatars/${session.user.id}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const url = await uploadToR2(key, buffer, file.type)

  await prisma.player.updateMany({
    where: { userId: session.user.id },
    data: { photoUrl: url },
  })

  return NextResponse.json({ url })
}
