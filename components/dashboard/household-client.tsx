'use client'

import { useActionState, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { createHouseholdAction, joinHouseholdAction } from '@/app/actions/household'
import type { Household } from '@/types'

interface Member {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
}

interface HouseholdClientProps {
  household: Household | null
  members: Member[]
  currentUserId?: string
  currentUserRole?: string
}

export function HouseholdClient({ household, members, currentUserId, currentUserRole }: HouseholdClientProps) {
  const [createState, createAction, isCreating] = useActionState(createHouseholdAction, null)
  const [joinState, joinAction, isJoining] = useActionState(joinHouseholdAction, null)
  const [copied, setCopied] = useState(false)

  async function copyInviteCode() {
    if (!household) return
    await navigator.clipboard.writeText(household.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!household) {
    return (
      <div className="space-y-6 max-w-lg">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Domicílio</h1>
          <p className="text-gray-500 mt-1">Você ainda não faz parte de um domicílio</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Criar Novo Domicílio</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createAction} className="space-y-4">
              {createState?.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {createState.error}
                </div>
              )}
              <Input
                name="name"
                label="Nome do domicílio"
                placeholder="Ex: Família Silva, Apartamento 23..."
                required
              />
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? 'Criando...' : 'Criar Domicílio'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-50 px-2 text-gray-500">ou</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Entrar com Código de Convite</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={joinAction} className="space-y-4">
              {joinState?.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {joinState.error}
                </div>
              )}
              <Input
                name="inviteCode"
                label="Código de convite"
                placeholder="Ex: FAMILIA-SILVA-2024"
                required
              />
              <Button type="submit" variant="outline" className="w-full" disabled={isJoining}>
                {isJoining ? 'Entrando...' : 'Entrar no Domicílio'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Domicílio</h1>
        <p className="text-gray-500 mt-1">Gerencie seu domicílio e membros</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Nome</p>
            <p className="text-lg font-semibold text-gray-900">{household.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Código de convite</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono text-gray-900">
                {household.inviteCode}
              </code>
              <Button variant="outline" size="sm" onClick={copyInviteCode}>
                {copied ? '✓ Copiado!' : '📋 Copiar'}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Compartilhe este código para convidar membros</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Criado em</p>
            <p className="text-sm text-gray-900">{formatDate(household.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Membros</CardTitle>
            <Badge variant="secondary">{members.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm flex-shrink-0">
                  {member.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                    {member.id === currentUserId && (
                      <Badge variant="outline" className="text-xs">Você</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{member.email}</p>
                </div>
                <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                  {member.role === 'admin' ? 'Admin' : 'Membro'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Entrar em Outro Domicílio</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={joinAction} className="space-y-3">
            {joinState?.error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {joinState.error}
              </div>
            )}
            <div className="flex gap-2">
              <Input name="inviteCode" placeholder="Código de convite" className="flex-1" />
              <Button type="submit" variant="outline" disabled={isJoining}>
                {isJoining ? '...' : 'Entrar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
