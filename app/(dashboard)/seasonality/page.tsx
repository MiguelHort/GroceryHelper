import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SeasonalityClient } from '@/components/dashboard/seasonality-client'

export default async function SeasonalityPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const seasonalityData = await prisma.seasonality.findMany({
    orderBy: [{ region: 'asc' }, { product: 'asc' }],
  })

  const parsedData = seasonalityData.map((item) => ({
    ...item,
    idealMonths: JSON.parse(item.idealMonths) as number[],
  }))

  return <SeasonalityClient data={parsedData} />
}
