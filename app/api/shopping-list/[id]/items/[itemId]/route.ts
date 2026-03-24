import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.householdId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id, itemId } = await params
    const body = await request.json()

    // Verify the list belongs to the user's household
    const list = await prisma.shoppingList.findFirst({
      where: { id, householdId: session.user.householdId },
    })

    if (!list) {
      return NextResponse.json({ error: 'Lista não encontrada' }, { status: 404 })
    }

    const updatedItem = await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        status: body.status,
        notes: body.notes,
      },
      include: { item: true },
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('PUT shopping list item error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.householdId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id, itemId } = await params

    // Verify the list belongs to the user's household
    const list = await prisma.shoppingList.findFirst({
      where: { id, householdId: session.user.householdId },
    })

    if (!list) {
      return NextResponse.json({ error: 'Lista não encontrada' }, { status: 404 })
    }

    await prisma.shoppingListItem.delete({ where: { id: itemId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE shopping list item error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
