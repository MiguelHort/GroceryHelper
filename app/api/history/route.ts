import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.householdId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const itemId = searchParams.get('itemId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const history = await prisma.itemHistory.findMany({
      where: {
        item: {
          householdId: session.user.householdId,
        },
        ...(action ? { action } : {}),
        ...(itemId ? { itemId } : {}),
      },
      include: {
        item: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error('GET history error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
