'use client'

import { useState, useTransition, useRef } from 'react'
import type { ShoppingListWithItems } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  createShoppingListAction,
  addShoppingListItemAction,
  toggleShoppingListItemAction,
  completeShoppingListAction,
} from '@/app/actions/shopping-list'

const UNITS = ['kg', 'g', 'litro', 'ml', 'unidade', 'pacote', 'caixa', 'garrafa', 'lata', 'sachê']

interface ShoppingListClientProps {
  shoppingList: ShoppingListWithItems | null
  householdId: string
}

export function ShoppingListClient({ shoppingList: initialList }: ShoppingListClientProps) {
  const [list, setList] = useState(initialList)
  const [isCreating, startCreate] = useTransition()
  const [isCompleting, startComplete] = useTransition()
  const [isToggling, startToggle] = useTransition()
  const [isAdding, startAdd] = useTransition()
  const [addError, setAddError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function createList() {
    startCreate(async () => {
      const result = await createShoppingListAction()
      if ('error' in result) {
        alert(result.error)
      } else {
        setList(result.list as any)
      }
    })
  }

  function handleAddItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!list) return
    const formData = new FormData(e.currentTarget)
    setAddError(null)
    startAdd(async () => {
      const result = await addShoppingListItemAction(list.id, null, formData)
      if (result && 'error' in result) {
        setAddError(result.error)
      } else if (result && 'addedItem' in result) {
        setList((prev) => prev ? { ...prev, items: [...prev.items, result.addedItem as any] } : prev)
        formRef.current?.reset()
      }
    })
  }

  function toggleItem(itemId: string, currentStatus: string) {
    if (!list) return
    const newStatus = currentStatus === 'bought' ? 'pending' : 'bought'

    setList((prev) =>
      prev ? { ...prev, items: prev.items.map((i) => i.id === itemId ? { ...i, status: newStatus } : i) } : prev
    )

    startToggle(async () => {
      const result = await toggleShoppingListItemAction(list.id, itemId, newStatus as 'pending' | 'bought')
      if (result.error) {
        setList((prev) =>
          prev ? { ...prev, items: prev.items.map((i) => i.id === itemId ? { ...i, status: currentStatus } : i) } : prev
        )
      }
    })
  }

  function completeList() {
    if (!list) return
    startComplete(async () => {
      const result = await completeShoppingListAction(list.id)
      if (result.error) {
        alert(result.error)
      } else {
        setList(null)
      }
    })
  }

  if (!list) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lista de Compras</h1>
          <p className="text-gray-500 mt-1">Nenhuma lista ativa</p>
        </div>
        <div className="text-center py-16">
          <span className="text-5xl">🛒</span>
          <p className="text-gray-600 mt-4 text-lg font-medium">Nenhuma lista de compras ativa</p>
          <p className="text-gray-500 mt-1 text-sm">Crie uma lista com os itens em falta automaticamente</p>
          <Button className="mt-6" disabled={isCreating} onClick={createList}>
            {isCreating ? 'Criando...' : 'Criar Lista Automaticamente'}
          </Button>
        </div>
      </div>
    )
  }

  const pendingItems = list.items.filter((i) => i.status === 'pending')
  const boughtItems = list.items.filter((i) => i.status === 'bought')
  const progress = list.items.length > 0 ? (boughtItems.length / list.items.length) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lista de Compras</h1>
          <p className="text-gray-500 mt-1">{boughtItems.length} de {list.items.length} itens comprados</p>
        </div>
        <Button variant="outline" onClick={completeList} disabled={isCompleting || list.items.length === 0}>
          {isCompleting ? 'Finalizando...' : '✅ Finalizar Lista'}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progresso</span>
            <span className="text-sm font-medium text-gray-900">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Adicionar Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleAddItem} className="flex gap-2 flex-wrap">
            {addError && <p className="w-full text-sm text-red-600">{addError}</p>}
            <Input name="name" placeholder="Nome do item..." className="flex-1 min-w-[150px]" required />
            <Input name="quantity" type="number" placeholder="Qtd" min="0.1" step="0.1" defaultValue="1" className="w-20" />
            <Select name="unit" className="w-28" defaultValue="unidade">
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </Select>
            <Button type="submit" disabled={isAdding}>
              {isAdding ? '...' : '+ Adicionar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {pendingItems.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">A Comprar</CardTitle>
                <Badge variant="secondary">{pendingItems.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors ${isToggling ? 'opacity-70' : ''}`}
                    onClick={() => toggleItem(item.id, item.status)}
                  >
                    <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      {item.notes && <p className="text-xs text-gray-500">{item.notes}</p>}
                    </div>
                    <span className="text-sm text-gray-500 flex-shrink-0">{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {boughtItems.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-gray-400">Comprados</CardTitle>
                <Badge variant="success">{boughtItems.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {boughtItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
                    onClick={() => toggleItem(item.id, item.status)}
                  >
                    <div className="w-5 h-5 rounded border-2 border-green-500 bg-green-500 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400 line-through flex-1">{item.name}</p>
                    <span className="text-sm text-gray-400 flex-shrink-0">{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {list.items.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum item na lista. Adicione acima.</p>
          </div>
        )}
      </div>
    </div>
  )
}
