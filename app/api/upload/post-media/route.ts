import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToR2 } from '@/lib/r2'

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/quicktime', 'video/webm',
]
const MAX_SIZE = 50 * 1024 * 1024 // 50 MB

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const formData = await request.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Aucun fichier.' }, { status: 400 })

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Format non supporté. JPG, PNG, GIF, WebP, MP4 uniquement.' },
      { status: 400 }
    )
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Fichier trop lourd. Maximum 50 MB.' }, { status: 400 })
  }

  const isVideo = file.type.startsWith('video/')
  const ext     = file.type.split('/')[1].replace('quicktime', 'mov')
  const key     = `posts/${session.user.id}/${Date.now()}.${ext}`
  const buffer  = Buffer.from(await file.arrayBuffer())
  const url     = await uploadToR2(key, buffer, file.type)

  return NextResponse.json({ url, isVideo })
}
