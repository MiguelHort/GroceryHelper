import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NoHousehold } from '@/components/ui/no-household'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, getCategoryEmoji } from '@/lib/utils'

export default async function HistoryPage() {
  const session = await auth()
  if (!session?.user?.householdId) return <NoHousehold />

  const history = await prisma.itemHistory.findMany({
    where: {
      item: {
        householdId: session.user.householdId,
      },
    },
    include: {
      item: true,
      user: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const actionConfig = {
    purchase: {
      label: 'Compra',
      icon: '🟢',
      color: 'text-green-600',
      badge: 'success' as const,
      symbol: '+',
    },
    consumption: {
      label: 'Consumo',
      icon: '🔵',
      color: 'text-blue-600',
      badge: 'secondary' as const,
      symbol: '-',
    },
    adjustment: {
      label: 'Ajuste',
      icon: '⚪',
      color: 'text-gray-600',
      badge: 'outline' as const,
      symbol: '~',
    },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
        <p className="text-gray-500 mt-1">Registro de compras e consumos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {history.filter((h) => h.action === 'purchase').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Compras</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {history.filter((h) => h.action === 'consumption').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Consumos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-gray-600">
              {history.filter((h) => h.action === 'adjustment').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Ajustes</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Linha do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">📋</span>
              <p className="text-gray-500 mt-3">Nenhum histórico ainda.</p>
              <p className="text-sm text-gray-400 mt-1">O histórico aparece aqui quando você adicionar ou consumir itens.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

              <div className="space-y-4">
                {history.map((entry) => {
                  const config = actionConfig[entry.action as keyof typeof actionConfig] || actionConfig.adjustment
                  const diff = entry.newQuantity - entry.oldQuantity

                  return (
                    <div key={entry.id} className="flex gap-4 relative">
                      {/* Icon */}
                      <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm ${
                        entry.action === 'purchase' ? 'bg-green-100' :
                        entry.action === 'consumption' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {config.symbol}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-4 border-b border-gray-100 last:border-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-gray-900">
                                {getCategoryEmoji(entry.item.category)} {entry.item.name}
                              </span>
                              <Badge variant={config.badge} className="text-xs">
                                {config.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {entry.oldQuantity} → {entry.newQuantity} {entry.item.unit}
                              <span className={`ml-1 font-medium ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                ({diff > 0 ? '+' : ''}{diff} {entry.item.unit})
                              </span>
                            </p>
                            {entry.user && (
                              <p className="text-xs text-gray-400 mt-0.5">por {entry.user.name}</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 flex-shrink-0">
                            {formatDateTime(entry.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
