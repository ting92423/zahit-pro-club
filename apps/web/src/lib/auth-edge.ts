import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'secret' // Default for dev, must set in Cloudflare

export async function getMemberId() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    if (payload.role !== 'MEMBER' && payload.role !== 'ADMIN') return null
    return payload.sub as string // 'sub' is usually the user ID
  } catch (e) {
    return null
  }
}
