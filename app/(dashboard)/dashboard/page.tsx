import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { NoHousehold } from '@/components/ui/no-household'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCategoryEmoji, getCategoryLabel, getStockStatus, isExpiringSoon, isExpired, formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.householdId) {
    return <NoHousehold />
  }

  const householdId = session.user.householdId

  const [items, shoppingList, household] = await Promise.all([
    prisma.item.findMany({
      where: { householdId },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.shoppingList.findFirst({
      where: { householdId, completedAt: null },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.household.findUnique({
      where: { id: householdId },
    }),
  ])

  // Calculate stats
  const totalItems = items.length
  const lowStockItems = items.filter((item) => getStockStatus(item.quantity, item.minQuantity) === 'low')
  const criticalItems = items.filter((item) => getStockStatus(item.quantity, item.minQuantity) === 'critical')
  const expiringSoonItems = items.filter((item) => isExpiringSoon(item.expiryDate))
  const expiredItems = items.filter((item) => isExpired(item.expiryDate))

  // Get seasonal products for current month
  const currentMonth = new Date().getMonth() + 1
  const seasonalData = await prisma.seasonality.findMany()
  const seasonalProducts = seasonalData.filter((s) => {
    const months = JSON.parse(s.idealMonths) as number[]
    return months.includes(currentMonth)
  }).slice(0, 5)

  const pendingShoppingItems = shoppingList?.items.filter((i) => i.status === 'pending').length || 0

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {session.user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {household?.name} • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Alerts */}
      {(criticalItems.length > 0 || expiredItems.length > 0) && (
        <div className="space-y-2">
          {criticalItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="text-xl">🚨</span>
              <div>
                <p className="font-medium text-red-800">Itens em falta crítica</p>
                <p className="text-sm text-red-600">
                  {criticalItems.slice(0, 3).map((i) => i.name).join(', ')}
                  {criticalItems.length > 3 && ` e mais ${criticalItems.length - 3}`}
                </p>
              </div>
              <Link href="/pantry" className="ml-auto text-sm text-red-700 font-medium hover:underline">
                Ver
              </Link>
            </div>
          )}
          {expiredItems.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium text-orange-800">Itens vencidos</p>
                <p className="text-sm text-orange-600">
                  {expiredItems.slice(0, 3).map((i) => i.name).join(', ')}
                  {expiredItems.length > 3 && ` e mais ${expiredItems.length - 3}`}
                </p>
              </div>
              <Link href="/pantry" className="ml-auto text-sm text-orange-700 font-medium hover:underline">
                Ver
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Itens</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalItems}</p>
              </div>
              <span className="text-3xl">🥫</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Estoque Baixo</p>
                <p className={`text-3xl font-bold mt-1 ${lowStockItems.length > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>
                  {lowStockItems.length + criticalItems.length}
                </p>
              </div>
              <span className="text-3xl">⚠️</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">A Vencer em 7d</p>
                <p className={`text-3xl font-bold mt-1 ${expiringSoonItems.length > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                  {expiringSoonItems.length}
                </p>
              </div>
              <span className="text-3xl">📅</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Lista de Compras</p>
                <p className={`text-3xl font-bold mt-1 ${pendingShoppingItems > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {pendingShoppingItems}
                </p>
              </div>
              <span className="text-3xl">🛒</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">itens pendentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock items */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Estoque Baixo</CardTitle>
              <Link href="/pantry?filter=low" className="text-sm text-green-600 hover:underline">
                Ver todos
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {[...criticalItems, ...lowStockItems].length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Todos os itens estão bem estocados! ✅</p>
            ) : (
              <div className="space-y-2">
                {[...criticalItems, ...lowStockItems].slice(0, 5).map((item) => {
                  const status = getStockStatus(item.quantity, item.minQuantity)
                  return (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                      <span className="text-xl">{getCategoryEmoji(item.category)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} {item.unit} (mín: {item.minQuantity})</p>
                      </div>
                      <Badge variant={status === 'critical' ? 'destructive' : 'warning'}>
                        {status === 'critical' ? 'Crítico' : 'Baixo'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seasonal products */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Em Safra Este Mês 🌱</CardTitle>
              <Link href="/seasonality" className="text-sm text-green-600 hover:underline">
                Ver calendário
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {seasonalProducts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Nenhum produto sazonal encontrado.</p>
            ) : (
              <div className="space-y-2">
                {seasonalProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-xl">🌿</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{product.product}</p>
                      <p className="text-xs text-gray-500">{product.region} • {product.description}</p>
                    </div>
                    <Badge variant="success">Em safra</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring soon */}
        {expiringSoonItems.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Vencendo em Breve</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {expiringSoonItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-xl">{getCategoryEmoji(item.category)}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Vence: {formatDate(item.expiryDate)}</p>
                    </div>
                    <Badge variant="warning">Em breve</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shopping list summary */}
        {shoppingList && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Lista de Compras Ativa</CardTitle>
                <Link href="/shopping-list" className="text-sm text-green-600 hover:underline">
                  Abrir lista
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {shoppingList.items.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <span className={`w-4 h-4 rounded border-2 flex-shrink-0 ${item.status === 'bought' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                      {item.status === 'bought' && (
                        <svg className="w-3 h-3 text-white m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <p className={`text-sm flex-1 ${item.status === 'bought' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {item.name}
                    </p>
                    <span className="text-xs text-gray-400">{item.quantity} {item.unit}</span>
                  </div>
                ))}
                {shoppingList.items.length > 5 && (
                  <p className="text-xs text-gray-500 text-center pt-1">
                    +{shoppingList.items.length - 5} mais itens
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
