import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs', '@libsql/client', '@prisma/adapter-libsql'],
  allowedDevOrigins: ['192.168.0.108'],
}

export default nextConfig
