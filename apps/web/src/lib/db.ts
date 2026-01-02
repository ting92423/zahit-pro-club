import { PrismaClient } from '@prisma/client/edge'
import { PrismaD1 } from '@prisma/adapter-d1'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export function getDb() {
  if (process.env.NODE_ENV === 'development') {
    // Local dev: we still need a generated client to compile, but we won't
    // connect to D1 here. Any DB access should be tested via Pages/Workers runtime.
    return new PrismaClient()
  }

  // Cloudflare production environment
  const ctx = getRequestContext()
  const env = ctx.env as any
  if (!env.DB) {
    throw new Error('D1 binding "DB" not found. Check wrangler.toml')
  }

  const adapter = new PrismaD1(env.DB)
  return new PrismaClient({ adapter })
}
