import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { shoppingListItemSchema } from '@/lib/validations'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.householdId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = shoppingListItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || parsed.error.message },
        { status: 400 }
      )
    }

    // Verify the list belongs to the user's household
    const list = await prisma.shoppingList.findFirst({
      where: { id, householdId: session.user.householdId },
    })

    if (!list) {
      return NextResponse.json({ error: 'Lista não encontrada' }, { status: 404 })
    }

    const { itemId, notes, ...rest } = parsed.data

    const item = await prisma.shoppingListItem.create({
      data: {
        ...rest,
        shoppingListId: id,
        ...(itemId ? { itemId } : {}),
        notes: notes || null,
      },
      include: { item: true },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('POST shopping list item error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
