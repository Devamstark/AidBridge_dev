import type { VercelRequest } from '@vercel/node'
import { prisma } from './db.js'
import { jwtVerify } from 'jose'

export interface AuthUser {
  id: string
  email: string
  role: string
  fullName: string
}

export async function getUserFromToken(token?: string): Promise<AuthUser | null> {
  if (!token) return null

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-min-32-chars')
    const { payload } = await jwtVerify(token, secret)

    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
      }
    })

    return user as AuthUser | null
  } catch {
    return null
  }
}

export async function requireAuth(req: VercelRequest): Promise<AuthUser> {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  const user = await getUserFromToken(token)
  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function optionalAuth(req: VercelRequest): Promise<AuthUser | null> {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.replace('Bearer ', '')
    return await getUserFromToken(token)
  } catch {
    return null
  }
}
