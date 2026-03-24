'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Entrar</CardTitle>
        <CardDescription>Entre com seu email e senha para acessar</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="seu@email.com"
            autoComplete="email"
            required
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Senha"
            placeholder="Sua senha"
            autoComplete="current-password"
            required
          />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-green-600 hover:underline">
              Esqueci a senha
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Não tem conta?{' '}
          <Link href="/register" className="text-green-600 font-medium hover:underline">
            Criar conta
          </Link>
        </p>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p className="font-medium mb-1">Contas de teste:</p>
          <p>admin@test.com / 123456</p>
          <p>member@test.com / 123456</p>
        </div>
      </CardContent>
    </Card>
  )
}
