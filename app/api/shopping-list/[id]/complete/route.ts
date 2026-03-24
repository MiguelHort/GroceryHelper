import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const list = await prisma.shoppingList.findFirst({
      where: { id, householdId: session.user.householdId },
      include: {
        items: {
          include: { item: true },
        },
      },
    })

    if (!list) {
      return NextResponse.json({ error: 'Lista não encontrada' }, { status: 404 })
    }

    // Update stock for bought items that have a linked pantry item
    const boughtItems = list.items.filter((item) => item.status === 'bought' && item.itemId && item.item)

    await Promise.all(
      boughtItems.map(async (listItem) => {
        if (!listItem.item || !listItem.itemId) return

        const oldQuantity = listItem.item.quantity
        const newQuantity = oldQuantity + listItem.quantity

        await prisma.item.update({
          where: { id: listItem.itemId },
          data: { quantity: newQuantity },
        })

        await prisma.itemHistory.create({
          data: {
            itemId: listItem.itemId,
            oldQuantity,
            newQuantity,
            action: 'purchase',
            userId: session.user.id,
          },
        })
      })
    )

    // Mark list as completed
    const completedList = await prisma.shoppingList.update({
      where: { id },
      data: { completedAt: new Date() },
    })

    return NextResponse.json(completedList)
  } catch (error) {
    console.error('POST complete shopping list error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
