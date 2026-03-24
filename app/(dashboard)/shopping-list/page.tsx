import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ShoppingListClient } from '@/components/shopping-list/shopping-list-client'
import { NoHousehold } from '@/components/ui/no-household'

export default async function ShoppingListPage() {
  const session = await auth()
  if (!session?.user?.householdId) return <NoHousehold />

  const householdId = session.user.householdId

  const shoppingList = await prisma.shoppingList.findFirst({
    where: { householdId, completedAt: null },
    include: {
      items: {
        include: { item: true },
        orderBy: { id: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <ShoppingListClient
      shoppingList={shoppingList as any}
      householdId={householdId}
    />
  )
}
