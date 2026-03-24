import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isExpiringSoon(date: Date | string | null | undefined): boolean {
  if (!date) return false
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const days = diff / (1000 * 60 * 60 * 24)
  return days >= 0 && days <= 7
}

export function isExpired(date: Date | string | null | undefined): boolean {
  if (!date) return false
  const d = typeof date === 'string' ? new Date(date) : date
  return d < new Date()
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    HORTIFRUTI: 'Hortifruti',
    LATICINIOS: 'Laticínios',
    CARNES: 'Carnes',
    GRAOS_CEREAIS: 'Grãos e Cereais',
    LIMPEZA: 'Limpeza',
    HIGIENE: 'Higiene',
    BEBIDAS: 'Bebidas',
    CONGELADOS: 'Congelados',
    CONDIMENTOS: 'Condimentos',
    PADARIA: 'Padaria',
    OUTROS: 'Outros',
  }
  return labels[category] || category
}

export function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    HORTIFRUTI: '🥦',
    LATICINIOS: '🥛',
    CARNES: '🥩',
    GRAOS_CEREAIS: '🌾',
    LIMPEZA: '🧹',
    HIGIENE: '🧴',
    BEBIDAS: '🥤',
    CONGELADOS: '❄️',
    CONDIMENTOS: '🧂',
    PADARIA: '🍞',
    OUTROS: '📦',
  }
  return emojis[category] || '📦'
}

export function getStockStatus(quantity: number, minQuantity: number): 'ok' | 'low' | 'critical' {
  if (quantity <= 0) return 'critical'
  if (quantity <= minQuantity) return 'low'
  return 'ok'
}

export function getMonthName(month: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return months[month - 1] || ''
}
