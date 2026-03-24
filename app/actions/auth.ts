'use server'

import { signIn, signOut } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AuthError } from 'next-auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// ── Login ─────────────────────────────────────────────────────────────────────

export type LoginState = { error: string } | null

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'Email e senha são obrigatórios' }

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' })
    return null
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Email ou senha incorretos' }
    throw error // re-lança o NEXT_REDIRECT para o Next.js redirecionar
  }
}

// ── Register ──────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type RegisterState = { error: string; field?: string } | null

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { error: issue.message, field: String(issue.path[0] ?? '') }
  }

  const { name, email, password } = parsed.data

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return { error: 'Este email já está cadastrado', field: 'email' }

    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.create({ data: { name, email, password: hashed } })

    // Após criar a conta, faz login automático
    await signIn('credentials', { email, password, redirectTo: '/dashboard' })
    return null
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Conta criada! Faça login.' }
    throw error // re-lança NEXT_REDIRECT
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logoutAction() {
  await signOut({ redirectTo: '/login' })
}
