import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  email: z.string().email('Email invalide.'),
  password: z.string().min(8, 'Mot de passe trop court.'),
  role: z.enum(['PLAYER', 'CLUB_ADMIN', 'RECRUITER']),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Données invalides.' },
      { status: 400 }
    )
  }

  const { email, password, role, firstName, lastName } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { email, passwordHash, role },
    })

    if (role === 'PLAYER') {
      await tx.player.create({
        data: {
          userId: newUser.id,
          firstName: firstName ?? '',
          lastName: lastName ?? '',
          dob: new Date('2000-01-01'),
          nationality: '',
          city: '',
          positionMain: '',
        },
      })
    }

    return newUser
  })

  return NextResponse.json({ id: user.id }, { status: 201 })
}
