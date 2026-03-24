import type { User, Household, Item, ShoppingList, ShoppingListItem, ItemHistory, Seasonality } from '@prisma/client'

export type { User, Household, Item, ShoppingList, ShoppingListItem, ItemHistory, Seasonality }

export type UserWithHousehold = User & {
  household: Household | null
}

export type ItemWithHistory = Item & {
  itemHistory: ItemHistory[]
}

export type ShoppingListWithItems = ShoppingList & {
  items: (ShoppingListItem & {
    item: Item | null
  })[]
}

export type HouseholdWithMembers = Household & {
  users: User[]
}

export type ItemHistoryWithRelations = ItemHistory & {
  item: Item
  user: User | null
}

export type StockStatus = 'ok' | 'low' | 'critical'

export type Category =
  | 'HORTIFRUTI'
  | 'LATICINIOS'
  | 'CARNES'
  | 'GRAOS_CEREAIS'
  | 'LIMPEZA'
  | 'HIGIENE'
  | 'BEBIDAS'
  | 'CONGELADOS'
  | 'CONDIMENTOS'
  | 'PADARIA'
  | 'OUTROS'

export type Unit = 'kg' | 'g' | 'litro' | 'ml' | 'unidade' | 'pacote' | 'caixa' | 'garrafa' | 'lata' | 'sachê'

export type SeasonalityWithParsedMonths = Omit<Seasonality, 'idealMonths'> & {
  idealMonths: number[]
}

// Extend next-auth types
declare module 'next-auth' {
  interface User {
    householdId?: string | null
    role?: string
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      householdId?: string | null
      role?: string
    }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    householdId?: string | null
    role?: string
  }
}
