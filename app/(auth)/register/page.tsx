'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registerAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null)

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Criar Conta</CardTitle>
        <CardDescription>Preencha os dados para se cadastrar</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && !state.field && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          <Input
            id="name"
            name="name"
            type="text"
            label="Nome completo"
            placeholder="Seu nome"
            error={state?.field === 'name' ? state.error : undefined}
            autoComplete="name"
            required
          />
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="seu@email.com"
            error={state?.field === 'email' ? state.error : undefined}
            autoComplete="email"
            required
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Senha"
            placeholder="Mínimo 6 caracteres"
            error={state?.field === 'password' ? state.error : undefined}
            autoComplete="new-password"
            required
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirmar senha"
            placeholder="Repita a senha"
            error={state?.field === 'confirmPassword' ? state.error : undefined}
            autoComplete="new-password"
            required
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Já tem conta?{' '}
          <Link href="/login" className="text-green-600 font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
