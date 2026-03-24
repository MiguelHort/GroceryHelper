'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Item } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { getCategoryEmoji, getCategoryLabel, getStockStatus, isExpiringSoon, isExpired, formatDate } from '@/lib/utils'
import { EditItemForm } from './edit-item-form'
import { ConsumeItemModal } from './consume-item-modal'
import { deleteItemAction } from '@/app/actions/items'

const CATEGORIES = [
  'HORTIFRUTI', 'LATICINIOS', 'CARNES', 'GRAOS_CEREAIS',
  'LIMPEZA', 'HIGIENE', 'BEBIDAS', 'CONGELADOS',
  'CONDIMENTOS', 'PADARIA', 'OUTROS',
]

interface PantryClientProps {
  items: Item[]
  category?: string
  filter?: string
  search?: string
}

export function PantryClient({ items: initialItems, category, filter, search }: PantryClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [items, setItems] = useState(initialItems)
  const [searchQuery, setSearchQuery] = useState(search || '')
  const [selectedCategory, setSelectedCategory] = useState(category || '')
  const [filterStock, setFilterStock] = useState(filter || '')
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [consumeItem, setConsumeItem] = useState<Item | null>(null)
  const [deleteItem, setDeleteItem] = useState<Item | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredItems = items.filter((item) => {
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    const status = getStockStatus(item.quantity, item.minQuantity)
    const matchesFilter =
      !filterStock ||
      (filterStock === 'low' && (status === 'low' || status === 'critical')) ||
      (filterStock === 'critical' && status === 'critical') ||
      (filterStock === 'expiring' && isExpiringSoon(item.expiryDate)) ||
      (filterStock === 'expired' && isExpired(item.expiryDate))
    return matchesSearch && matchesCategory && matchesFilter
  })

  function handleDelete(item: Item) {
    setDeletingId(item.id)
    startTransition(async () => {
      const result = await deleteItemAction(item.id)
      if (!result.error) {
        setItems((prev) => prev.filter((i) => i.id !== item.id))
        setDeleteItem(null)
      }
      setDeletingId(null)
      router.refresh()
    })
  }

  function handleItemUpdated(updatedItem: Item) {
    setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)))
    setEditItem(null)
  }

  function handleItemConsumed(updatedItem: Item) {
    setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)))
    setConsumeItem(null)
  }

  const stockBadgeVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
    ok: 'success', low: 'warning', critical: 'destructive',
  }

  const stockStatusColor: Record<string, string> = {
    ok: 'text-green-600', low: 'text-yellow-600', critical: 'text-red-600',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Despensa</h1>
          <p className="text-gray-500 mt-1">{filteredItems.length} de {items.length} itens</p>
        </div>
        <Link href="/pantry/new">
          <Button>+ Adicionar Item</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="Buscar item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">Todas as categorias</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{getCategoryEmoji(cat)} {getCategoryLabel(cat)}</option>
              ))}
            </Select>
            <Select value={filterStock} onChange={(e) => setFilterStock(e.target.value)}>
              <option value="">Todos os estoques</option>
              <option value="low">Estoque baixo</option>
              <option value="critical">Crítico</option>
              <option value="expiring">A vencer</option>
              <option value="expired">Vencidos</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl">📦</span>
          <p className="text-gray-500 mt-4 text-lg">Nenhum item encontrado</p>
          <Link href="/pantry/new" className="mt-4 inline-block">
            <Button variant="outline">Adicionar primeiro item</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const status = getStockStatus(item.quantity, item.minQuantity)
            const expired = isExpired(item.expiryDate)
            const expiringSoon = isExpiringSoon(item.expiryDate)

            return (
              <Card key={item.id} className={`relative ${expired ? 'border-red-300' : expiringSoon ? 'border-orange-300' : ''}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">{getCategoryEmoji(item.category)}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{getCategoryLabel(item.category)}</p>
                      </div>
                    </div>
                    <Badge variant={stockBadgeVariant[status]} className="flex-shrink-0 ml-2">
                      {status === 'ok' ? 'OK' : status === 'low' ? 'Baixo' : 'Crítico'}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Quantidade</span>
                      <span className={`font-semibold ${stockStatusColor[status]}`}>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Mínimo</span>
                      <span className="text-gray-700">{item.minQuantity} {item.unit}</span>
                    </div>
                    {item.expiryDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Validade</span>
                        <span className={expired ? 'text-red-600 font-semibold' : expiringSoon ? 'text-orange-600 font-semibold' : 'text-gray-700'}>
                          {expired ? '⚠️ ' : expiringSoon ? '⏰ ' : ''}{formatDate(item.expiryDate)}
                        </span>
                      </div>
                    )}
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${status === 'critical' ? 'bg-red-500' : status === 'low' ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(100, (item.quantity / (item.minQuantity * 2)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setConsumeItem(item)}>
                      🍽️ Consumir
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setEditItem(item)}>
                      ✏️ Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50 text-xs px-2"
                      onClick={() => setDeleteItem(item)}
                    >
                      🗑️
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Editar Item">
        {editItem && (
          <EditItemForm item={editItem} onSuccess={handleItemUpdated} onCancel={() => setEditItem(null)} />
        )}
      </Modal>

      <Modal isOpen={!!consumeItem} onClose={() => setConsumeItem(null)} title="Registrar Consumo">
        {consumeItem && (
          <ConsumeItemModal item={consumeItem} onSuccess={handleItemConsumed} onCancel={() => setConsumeItem(null)} />
        )}
      </Modal>

      <Modal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} title="Confirmar exclusão">
        {deleteItem && (
          <div>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja remover <strong>{deleteItem.name}</strong> da despensa?
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteItem(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={deletingId === deleteItem.id || isPending}
                onClick={() => handleDelete(deleteItem)}
              >
                {deletingId === deleteItem.id ? 'Removendo...' : 'Remover'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
