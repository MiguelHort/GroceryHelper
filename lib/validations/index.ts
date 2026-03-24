import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const itemSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  category: z.enum([
    'HORTIFRUTI', 'LATICINIOS', 'CARNES', 'GRAOS_CEREAIS',
    'LIMPEZA', 'HIGIENE', 'BEBIDAS', 'CONGELADOS',
    'CONDIMENTOS', 'PADARIA', 'OUTROS',
  ]),
  quantity: z.number().min(0, 'Quantidade deve ser maior ou igual a 0'),
  unit: z.enum(['kg', 'g', 'litro', 'ml', 'unidade', 'pacote', 'caixa', 'garrafa', 'lata', 'sachê']),
  minQuantity: z.number().min(0, 'Quantidade mínima deve ser maior ou igual a 0'),
  expiryDate: z.string().optional().nullable(),
})

export const householdSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
})

export const joinHouseholdSchema = z.object({
  inviteCode: z.string().min(1, 'Código de convite obrigatório'),
})

export const shoppingListItemSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  quantity: z.number().min(0.1, 'Quantidade obrigatória'),
  unit: z.string().min(1, 'Unidade obrigatória'),
  itemId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const consumeItemSchema = z.object({
  quantity: z.number().positive('Quantidade deve ser maior que 0'),
  notes: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ItemInput = z.infer<typeof itemSchema>
export type HouseholdInput = z.infer<typeof householdSchema>
export type JoinHouseholdInput = z.infer<typeof joinHouseholdSchema>
export type ShoppingListItemInput = z.infer<typeof shoppingListItemSchema>
export type ConsumeItemInput = z.infer<typeof consumeItemSchema>
