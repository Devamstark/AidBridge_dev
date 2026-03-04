import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import bcrypt from 'bcryptjs'
import { sign } from 'jose'
import { z } from 'zod'
import { handleHttpError } from '../_lib/utils'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const body = loginSchema.parse(req.body)
    
    const user = await prisma.user.findUnique({
      where: { email: body.email }
    })
    
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    const isCorrectPassword = await bcrypt.compare(
      body.password,
      user.passwordHash
    )
    
    if (!isCorrectPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })
    
    // Generate JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-min-32-chars')
    const token = await sign(
      { 
        sub: user.id,
        email: user.email,
        role: user.role 
      },
      secret,
      { expiresIn: '7d' }
    )
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      }
    })
  } catch (error) {
    return handleHttpError(res, error)
  }
}
