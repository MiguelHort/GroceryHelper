import { auth } from '@/lib/auth'
import { AddItemForm } from '@/components/pantry/add-item-form'
import { NoHousehold } from '@/components/ui/no-household'

export default async function NewItemPage() {
  const session = await auth()
  if (!session?.user?.householdId) return <NoHousehold />

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Adicionar Item</h1>
        <p className="text-gray-500 mt-1">Adicione um novo item à sua despensa</p>
      </div>
      <AddItemForm />
    </div>
  )
}
