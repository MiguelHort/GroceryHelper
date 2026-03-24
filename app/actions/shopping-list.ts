'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { ShoppingListWithItems } from '@/types'

export type ShoppingState = { error: string } | null

// ── Create list (auto-generate from low stock) ────────────────────────────────

export async function createShoppingListAction(): Promise<
  { error: string } | { list: ShoppingListWithItems }
> {
  const session = await auth()
  if (!session?.user?.householdId) return { error: 'Não autorizado' }

  const householdId = session.user.householdId

  // If a list already exists, return it (idempotent)
  const existing = await prisma.shoppingList.findFirst({
    where: { householdId, completedAt: null },
    include: { items: { include: { item: true }, orderBy: { id: 'asc' } } },
  })
  if (existing) return { list: existing as ShoppingListWithItems }

  const allItems = await prisma.item.findMany({ where: { householdId } })
  const lowStock = allItems.filter((i) => i.quantity <= i.minQuantity)

  const list = await prisma.shoppingList.create({
    data: {
      householdId,
      items: {
        create: lowStock.map((i) => ({
          itemId: i.id,
          name: i.name,
          quantity: Math.max(i.minQuantity * 2 - i.quantity, i.minQuantity),
          unit: i.unit,
          status: 'pending',
        })),
      },
    },
    include: { items: { include: { item: true }, orderBy: { id: 'asc' } } },
  })

  revalidatePath('/shopping-list')
  revalidatePath('/dashboard')
  return { list: list as ShoppingListWithItems }
}

// ── Add item to list ──────────────────────────────────────────────────────────

export async function addShoppingListItemAction(
  listId: string,
  _prev: ShoppingState,
  formData: FormData,
): Promise<ShoppingState | { addedItem: unknown }> {
  const session = await auth()
  if (!session?.user?.householdId) return { error: 'Não autorizado' }

  const name = (formData.get('name') as string)?.trim()
  const quantity = parseFloat(formData.get('quantity') as string) || 1
  const unit = (formData.get('unit') as string) || 'unidade'

  if (!name) return { error: 'Nome obrigatório' }

  const item = await prisma.shoppingListItem.create({
    data: { shoppingListId: listId, name, quantity, unit, status: 'pending' },
    include: { item: true },
  })

  revalidatePath('/shopping-list')
  return { addedItem: item }
}

// ── Toggle item status ────────────────────────────────────────────────────────

export async function toggleShoppingListItemAction(
  listId: string,
  itemId: string,
  newStatus: 'pending' | 'bought',
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.householdId) return { error: 'Não autorizado' }

  await prisma.shoppingListItem.update({
    where: { id: itemId, shoppingListId: listId },
    data: { status: newStatus },
  })

  revalidatePath('/shopping-list')
  return {}
}

// ── Complete list (update stock) ──────────────────────────────────────────────

export async function completeShoppingListAction(
  listId: string,
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.householdId) return { error: 'Não autorizado' }

  const list = await prisma.shoppingList.findFirst({
    where: { id: listId, householdId: session.user.householdId },
    include: { items: true },
  })
  if (!list) return { error: 'Lista não encontrada' }

  const bought = list.items.filter((i) => i.status === 'bought' && i.itemId)

  await Promise.all(
    bought.map(async (li) => {
      const item = await prisma.item.findUnique({ where: { id: li.itemId! } })
      if (!item) return
      const newQty = item.quantity + li.quantity
      return Promise.all([
        prisma.item.update({ where: { id: item.id }, data: { quantity: newQty } }),
        prisma.itemHistory.create({
          data: {
            itemId: item.id,
            oldQuantity: item.quantity,
            newQuantity: newQty,
            action: 'purchase',
            userId: session.user!.id,
          },
        }),
      ])
    }),
  )

  await prisma.shoppingList.update({
    where: { id: listId },
    data: { completedAt: new Date() },
  })

  revalidatePath('/shopping-list')
  revalidatePath('/pantry')
  revalidatePath('/dashboard')
  return {}
}
