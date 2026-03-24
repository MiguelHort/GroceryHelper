import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.householdId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const list = await prisma.shoppingList.findFirst({
      where: {
        householdId: session.user.householdId,
        completedAt: null,
      },
      include: {
        items: {
          include: { item: true },
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(list)
  } catch (error) {
    console.error('GET shopping list error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.householdId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { autoGenerate } = body

    // Auto generate items from low stock
    let autoItems: { name: string; quantity: number; unit: string; itemId: string; notes: string }[] = []

    if (autoGenerate) {
      const lowStockItems = await prisma.item.findMany({
        where: {
          householdId: session.user.householdId,
        },
      })

      autoItems = lowStockItems
        .filter((item) => item.quantity <= item.minQuantity)
        .map((item) => ({
          name: item.name,
          quantity: Math.max(item.minQuantity * 2 - item.quantity, item.minQuantity),
          unit: item.unit,
          itemId: item.id,
          notes: `Estoque atual: ${item.quantity} ${item.unit}`,
        }))

      // Also add seasonal items for current month that aren't in pantry
      const currentMonth = new Date().getMonth() + 1
      const seasonalData = await prisma.seasonality.findMany()
      const pantryItemNames = lowStockItems.map((i) => i.name.toLowerCase())

      for (const seasonal of seasonalData) {
        const months = JSON.parse(seasonal.idealMonths) as number[]
        if (months.includes(currentMonth) && !pantryItemNames.includes(seasonal.product.toLowerCase())) {
          autoItems.push({
            name: seasonal.product,
            quantity: 1,
            unit: 'unidade',
            itemId: '',
            notes: `Produto sazonal - ${seasonal.region}`,
          })
        }
      }
    }

    const list = await prisma.shoppingList.create({
      data: {
        householdId: session.user.householdId,
        items: autoItems.length > 0 ? {
          create: autoItems.map(({ itemId, ...item }) => ({
            ...item,
            ...(itemId ? { itemId } : {}),
          })),
        } : undefined,
      },
      include: {
        items: {
          include: { item: true },
        },
      },
    })

    return NextResponse.json(list, { status: 201 })
  } catch (error) {
    console.error('POST shopping list error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
