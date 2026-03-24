import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { joinHouseholdSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = joinHouseholdSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || parsed.error.message },
        { status: 400 }
      )
    }

    const { inviteCode } = parsed.data

    const household = await prisma.household.findUnique({
      where: { inviteCode },
    })

    if (!household) {
      return NextResponse.json(
        { error: 'Código de convite inválido' },
        { status: 404 }
      )
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        householdId: household.id,
        role: 'member',
      },
    })

    return NextResponse.json(household)
  } catch (error) {
    console.error('POST household join error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
