'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Painel',
  '/pantry': 'Despensa',
  '/pantry/new': 'Adicionar Item',
  '/shopping-list': 'Lista de Compras',
  '/seasonality': 'Sazonalidade',
  '/history': 'Histórico',
  '/household': 'Domicílio',
}

export function Header() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || 'GroceryHelper'

  return (
    <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl">🛒</span>
          <span className="text-lg font-bold text-green-700">GroceryHelper</span>
        </Link>
        <h1 className="text-sm font-semibold text-gray-700">{title}</h1>
      </div>
    </header>
  )
}
