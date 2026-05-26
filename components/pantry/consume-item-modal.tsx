'use client'

import { useActionState, useEffect } from 'react'
import type { Item } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { consumeItemAction } from '@/app/actions/items'

interface ConsumeItemModalProps {
  item: Item
  onSuccess: (item: Item) => void
  onCancel: () => void
}

export function ConsumeItemModal({ item, onSuccess, onCancel }: ConsumeItemModalProps) {
  const boundAction = consumeItemAction.bind(null, item.id)
  const [state, formAction, isPending] = useActionState(boundAction, null)

  useEffect(() => {
    if (state && 'updatedItem' in state) {
      onSuccess(state.updatedItem as unknown as Item)
    }
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Item: <span className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Disponível: <span className="font-semibold text-gray-900 dark:text-gray-100">{item.quantity} {item.unit}</span>
        </p>
      </div>

      {state && 'error' in state && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <Input
        id="consume-quantity"
        name="quantity"
        type="number"
        label="Quantidade consumida"
        placeholder="0"
        min="0.01"
        max={item.quantity}
        step="0.01"
        required
      />

      <Textarea
        id="consume-notes"
        name="notes"
        label="Observações (opcional)"
        placeholder="Ex: usado no jantar, aberto..."
        rows={2}
      />

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? 'Registrando...' : 'Registrar Consumo'}
        </Button>
      </div>
    </form>
  )
}
