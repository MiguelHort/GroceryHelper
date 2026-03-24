import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { itemSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.householdId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const item = await prisma.item.findFirst({
      where: { id, householdId: session.user.householdId },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('GET item error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
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
    const parsed = itemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || parsed.error.message },
        { status: 400 }
      )
    }

    const existingItem = await prisma.item.findFirst({
      where: { id, householdId: session.user.householdId },
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    const { expiryDate, ...rest } = parsed.data

    const item = await prisma.item.update({
      where: { id },
      data: {
        ...rest,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    })

    // Create history entry if quantity changed
    if (existingItem.quantity !== item.quantity) {
      await prisma.itemHistory.create({
        data: {
          itemId: item.id,
          oldQuantity: existingItem.quantity,
          newQuantity: item.quantity,
          action: 'adjustment',
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('PUT item error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.householdId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const item = await prisma.item.findFirst({
      where: { id, householdId: session.user.householdId },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    await prisma.item.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE item error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
