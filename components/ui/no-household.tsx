import Link from 'next/link'

export function NoHousehold() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <span className="text-6xl mb-4">🏡</span>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Você ainda não tem um domicílio</h2>
      <p className="text-gray-500 mb-6 max-w-sm">
        Crie um domicílio ou entre em um existente com um código de convite para começar a usar o GroceryHelper.
      </p>
      <Link
        href="/household"
        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
      >
        <span>🏡</span>
        Configurar Domicílio
      </Link>
    </div>
  )
}
