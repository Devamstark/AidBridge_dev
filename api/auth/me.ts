import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/db.js'
import { getUserFromToken } from '../_lib/auth.js'
import { handleHttpError } from '../_lib/utils.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
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
