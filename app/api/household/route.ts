import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { householdSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = householdSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || parsed.error.message },
        { status: 400 }
      )
    }

    const { name } = parsed.data

    const household = await prisma.household.create({
      data: { name },
    })

    // Update user to be admin of this household
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        householdId: household.id,
        role: 'admin',
      },
    })

    return NextResponse.json(household, { status: 201 })
  } catch (error) {
    console.error('POST household error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
