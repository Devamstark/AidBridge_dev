import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { getUserFromToken } from '../_lib/auth'
import { handleHttpError } from '../_lib/utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    const user = await getUserFromToken(token)
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    // Get full user data with preferences
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        language: true,
        fontSize: true,
        contrast: true,
        theme: true,
        image: true,
        breakGlassAccess: true,
        createdAt: true,
      }
    })
    
    res.json(fullUser)
  } catch (error) {
    return handleHttpError(res, error)
  }
}
