'use client'

import { useActionState, useEffect } from 'react'
import type { Item } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { getCategoryLabel } from '@/lib/utils'
import { updateItemAction } from '@/app/actions/items'

const CATEGORIES = [
  'HORTIFRUTI', 'LATICINIOS', 'CARNES', 'GRAOS_CEREAIS',
  'LIMPEZA', 'HIGIENE', 'BEBIDAS', 'CONGELADOS',
  'CONDIMENTOS', 'PADARIA', 'OUTROS',
]

const UNITS = ['kg', 'g', 'litro', 'ml', 'unidade', 'pacote', 'caixa', 'garrafa', 'lata', 'sachê']

interface EditItemFormProps {
  item: Item
  onSuccess: (item: Item) => void
  onCancel: () => void
}

export function EditItemForm({ item, onSuccess, onCancel }: EditItemFormProps) {
  const boundAction = updateItemAction.bind(null, item.id)
  const [state, formAction, isPending] = useActionState(boundAction, null)

  useEffect(() => {
    if (state && 'updatedItem' in state) {
      onSuccess(state.updatedItem as unknown as Item)
    }
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  const formatDate = (d: Date | string | null | undefined) => {
    if (!d) return ''
    return new Date(d).toISOString().split('T')[0]
  }

  return (
    <form action={formAction} className="space-y-4">
      {state && 'error' in state && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <Input id="edit-name" name="name" label="Nome" defaultValue={item.name} required />

      <Select id="edit-category" name="category" label="Categoria" defaultValue={item.category}>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="edit-quantity"
          name="quantity"
          type="number"
          label="Quantidade"
          defaultValue={item.quantity}
          min="0"
          step="0.01"
          required
        />
        <Select id="edit-unit" name="unit" label="Unidade" defaultValue={item.unit}>
          {UNITS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </Select>
      </div>

      <Input
        id="edit-minQuantity"
        name="minQuantity"
        type="number"
        label="Quantidade mínima"
        defaultValue={item.minQuantity}
        min="0"
        step="0.01"
        required
      />

      <Input
        id="edit-expiryDate"
        name="expiryDate"
        type="date"
        label="Data de validade"
        defaultValue={formatDate(item.expiryDate)}
      />

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
