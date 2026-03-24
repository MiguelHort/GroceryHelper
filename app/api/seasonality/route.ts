import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const monthParam = searchParams.get('month')
    const currentMonth = monthParam ? parseInt(monthParam) : new Date().getMonth() + 1

    const allData = await prisma.seasonality.findMany({
      orderBy: [{ region: 'asc' }, { product: 'asc' }],
    })

    const filtered = allData.filter((item) => {
      const months = JSON.parse(item.idealMonths) as number[]
      return months.includes(currentMonth)
    })

    return NextResponse.json(
      filtered.map((item) => ({
        ...item,
        idealMonths: JSON.parse(item.idealMonths),
      }))
    )
  } catch (error) {
    console.error('GET seasonality error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
