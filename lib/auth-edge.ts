import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

// Edge-compatible auth config (no Prisma adapter, no bcrypt)
// Used only in proxy.ts for JWT verification
export const { auth: edgeAuth } = NextAuth({
  session: { strategy: 'jwt' },
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize() {
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.householdId = (user as { householdId?: string | null }).householdId
        token.role = (user as { role?: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.householdId = token.householdId as string | undefined
        session.user.role = token.role as string | undefined
      }
      return session
    },
  },
  secret: process.env.AUTH_SECRET,
})
