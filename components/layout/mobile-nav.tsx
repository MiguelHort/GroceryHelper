'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Painel', icon: '🏠' },
  { href: '/pantry', label: 'Despensa', icon: '🥫' },
  { href: '/shopping-list', label: 'Compras', icon: '🛒' },
  { href: '/household', label: 'Casa', icon: '🏡' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'text-green-700'
                : 'text-gray-500'
            )}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
