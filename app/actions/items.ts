'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const itemSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  category: z.enum([
    'HORTIFRUTI', 'LATICINIOS', 'CARNES', 'GRAOS_CEREAIS',
    'LIMPEZA', 'HIGIENE', 'BEBIDAS', 'CONGELADOS',
    'CONDIMENTOS', 'PADARIA', 'OUTROS',
  ], { error: 'Categoria obrigatória' }),
  quantity: z.coerce.number({ error: 'Quantidade inválida' }).min(0),
  unit: z.string().min(1),
  minQuantity: z.coerce.number({ error: 'Mínimo inválido' }).min(0),
  expiryDate: z.string().optional().nullable(),
})

export type ItemFormState = { error: string; field?: string } | null

// ── Add ───────────────────────────────────────────────────────────────────────

export async function addItemAction(
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const session = await auth()
  if (!session?.user?.householdId) return { error: 'Não autorizado' }

  const parsed = itemSchema.safeParse({
    name: formData.get('name'),
    category: formData.get('category'),
    quantity: formData.get('quantity'),
    unit: formData.get('unit'),
    minQuantity: formData.get('minQuantity'),
    expiryDate: formData.get('expiryDate') || null,
  })

  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { error: issue.message, field: String(issue.path[0] ?? '') }
  }

  const { name, category, quantity, unit, minQuantity, expiryDate } = parsed.data

  await prisma.item.create({
    data: {
      name, category, quantity, unit, minQuantity,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      householdId: session.user.householdId,
    },
  })

  redirect('/pantry')
}

// ── Update ────────────────────────────────────────────────────────────────────

export type UpdateItemState = { error: string } | { updatedItem: Record<string, unknown> } | null

export async function updateItemAction(
  itemId: string,
  _prev: UpdateItemState,
  formData: FormData,
): Promise<UpdateItemState> {
  const session = await auth()
  if (!session?.user?.householdId) return { error: 'Não autorizado' }

  const parsed = itemSchema.safeParse({
    name: formData.get('name'),
    category: formData.get('category'),
    quantity: formData.get('quantity'),
    unit: formData.get('unit'),
    minQuantity: formData.get('minQuantity'),
    expiryDate: formData.get('expiryDate') || null,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const { name, category, quantity, unit, minQuantity, expiryDate } = parsed.data

  const updatedItem = await prisma.item.update({
    where: { id: itemId, householdId: session.user.householdId },
    data: {
      name, category, quantity, unit, minQuantity,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    },
  })

  revalidatePath('/pantry')
  return { updatedItem: updatedItem as unknown as Record<string, unknown> }
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteItemAction(itemId: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.householdId) return { error: 'Não autorizado' }

  await prisma.item.delete({
    where: { id: itemId, householdId: session.user.householdId },
  })

  revalidatePath('/pantry')
  return {}
}

// ── Consume ───────────────────────────────────────────────────────────────────

export type ConsumeItemState = { error: string } | { updatedItem: Record<string, unknown> } | null

export async function consumeItemAction(
  itemId: string,
  _prev: ConsumeItemState,
  formData: FormData,
): Promise<ConsumeItemState> {
  const session = await auth()
  if (!session?.user?.householdId) return { error: 'Não autorizado' }

  const quantity = parseFloat(formData.get('quantity') as string)
  const notes = (formData.get('notes') as string) || ''

  if (isNaN(quantity) || quantity <= 0) return { error: 'Quantidade inválida' }

  const existing = await prisma.item.findFirst({
    where: { id: itemId, householdId: session.user.householdId },
  })

  if (!existing) return { error: 'Item não encontrado' }
  if (quantity > existing.quantity) {
    return { error: `Não pode consumir mais que ${existing.quantity} ${existing.unit}` }
  }

  const newQty = existing.quantity - quantity

  const [updatedItem] = await Promise.all([
    prisma.item.update({ where: { id: itemId }, data: { quantity: newQty } }),
    prisma.itemHistory.create({
      data: {
        itemId,
        oldQuantity: existing.quantity,
        newQuantity: newQty,
        action: 'consumption',
        userId: session.user.id,
      },
    }),
  ])

  revalidatePath('/pantry')
  return { updatedItem: updatedItem as unknown as Record<string, unknown> }
}
