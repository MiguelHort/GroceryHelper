'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { getCategoryLabel } from '@/lib/utils'
import { addItemAction } from '@/app/actions/items'

const CATEGORIES = [
  'HORTIFRUTI', 'LATICINIOS', 'CARNES', 'GRAOS_CEREAIS',
  'LIMPEZA', 'HIGIENE', 'BEBIDAS', 'CONGELADOS',
  'CONDIMENTOS', 'PADARIA', 'OUTROS',
]

const UNITS = ['kg', 'g', 'litro', 'ml', 'unidade', 'pacote', 'caixa', 'garrafa', 'lata', 'sachê']

export function AddItemForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(addItemAction, null)

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          {state?.error && !state.field && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          <Input
            id="name"
            name="name"
            label="Nome do item"
            placeholder="Ex: Arroz, Leite, Detergente..."
            error={state?.field === 'name' ? state.error : undefined}
            required
          />

          <Select
            id="category"
            name="category"
            label="Categoria"
            error={state?.field === 'category' ? state.error : undefined}
            required
          >
            <option value="">Selecione uma categoria</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="quantity"
              name="quantity"
              type="number"
              label="Quantidade atual"
              placeholder="0"
              min="0"
              step="0.01"
              error={state?.field === 'quantity' ? state.error : undefined}
              defaultValue="0"
              required
            />
            <Select id="unit" name="unit" label="Unidade" defaultValue="unidade">
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </Select>
          </div>

          <Input
            id="minQuantity"
            name="minQuantity"
            type="number"
            label="Quantidade mínima (estoque baixo)"
            placeholder="1"
            min="0"
            step="0.01"
            error={state?.field === 'minQuantity' ? state.error : undefined}
            defaultValue="1"
            required
          />

          <Input
            id="expiryDate"
            name="expiryDate"
            type="date"
            label="Data de validade (opcional)"
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/pantry')}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? 'Adicionando...' : 'Adicionar à Despensa'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
