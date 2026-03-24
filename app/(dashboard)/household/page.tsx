import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { HouseholdClient } from '@/components/dashboard/household-client'

export default async function HouseholdPage() {
  const session = await auth()

  let household = null
  let members: Array<{ id: string; name: string; email: string; role: string; createdAt: Date }> = []

  if (session?.user?.householdId) {
    household = await prisma.household.findUnique({
      where: { id: session.user.householdId },
    })
    members = await prisma.user.findMany({
      where: { householdId: session.user.householdId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })
  }

  return (
    <HouseholdClient
      household={household}
      members={members}
      currentUserId={session?.user?.id}
      currentUserRole={session?.user?.role}
    />
  )
}
