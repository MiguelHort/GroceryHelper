import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { consumeItemSchema } from '@/lib/validations'

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
    const parsed = consumeItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || parsed.error.message },
        { status: 400 }
      )
    }

    const { quantity } = parsed.data

    const existingItem = await prisma.item.findFirst({
      where: { id, householdId: session.user.householdId },
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    if (quantity > existingItem.quantity) {
      return NextResponse.json(
        { error: `Quantidade não pode ser maior que ${existingItem.quantity} ${existingItem.unit}` },
        { status: 400 }
      )
    }

    const newQuantity = existingItem.quantity - quantity

    const item = await prisma.item.update({
      where: { id },
      data: { quantity: newQuantity },
    })

    await prisma.itemHistory.create({
      data: {
        itemId: id,
        oldQuantity: existingItem.quantity,
        newQuantity,
        action: 'consumption',
        userId: session.user.id,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('POST consume error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
