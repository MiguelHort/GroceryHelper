'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export type HouseholdState = { error: string } | null

export async function createHouseholdAction(
  _prev: HouseholdState,
  formData: FormData,
): Promise<HouseholdState> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Sessão expirada. Faça login novamente.' }

  const name = (formData.get('name') as string)?.trim()
  if (!name || name.length < 2) return { error: 'Nome deve ter pelo menos 2 caracteres' }

  const household = await prisma.household.create({ data: { name } })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { householdId: household.id, role: 'admin' },
  })

  redirect('/dashboard')
}

export async function joinHouseholdAction(
  _prev: HouseholdState,
  formData: FormData,
): Promise<HouseholdState> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Sessão expirada. Faça login novamente.' }

  const inviteCode = (formData.get('inviteCode') as string)?.trim()
  if (!inviteCode) return { error: 'Código de convite obrigatório' }

  const household = await prisma.household.findUnique({ where: { inviteCode } })
  if (!household) return { error: 'Código de convite inválido' }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { householdId: household.id, role: 'member' },
  })

  redirect('/dashboard')
}
