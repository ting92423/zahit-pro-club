import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export function getDb() {
  if (process.env.NODE_ENV === 'development') {
    // Local development fallback (if needed, or use remote D1)
    // Note: Local D1 requires using wrangler pages dev
    return new PrismaClient()
  }

  // Cloudflare production environment
  const ctx = getRequestContext()
  if (!ctx.env.DB) {
    throw new Error('D1 binding "DB" not found. Check wrangler.toml')
  }

  const adapter = new PrismaD1(ctx.env.DB)
  return new PrismaClient({ adapter })
}
