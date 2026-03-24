import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { PantryClient } from '@/components/pantry/pantry-client'
import { NoHousehold } from '@/components/ui/no-household'

export default async function PantryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; filter?: string; search?: string }>
}) {
  const session = await auth()
  if (!session?.user?.householdId) return <NoHousehold />

  const params = await searchParams
  const { category, filter, search } = params

  const items = await prisma.item.findMany({
    where: {
      householdId: session.user.householdId,
      ...(category ? { category } : {}),
      ...(search ? { name: { contains: search } } : {}),
    },
    orderBy: { updatedAt: 'desc' },
  })

  return <PantryClient items={items} category={category} filter={filter} search={search} />
}
