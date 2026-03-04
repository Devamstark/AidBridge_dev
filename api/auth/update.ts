import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { z } from 'zod'
import { handleHttpError } from '../_lib/utils'

const updateProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().optional(),
  language: z.string().optional(),
  fontSize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'XLARGE']).optional(),
  contrast: z.enum(['STANDARD', 'ENHANCED', 'HIGH']).optional(),
  theme: z.enum(['LIGHT', 'DARK']).optional(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const authUser = await requireAuth(req)
    const body = updateProfileSchema.parse(req.body)
    
    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: body,
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
      }
    })
    
    res.json(updatedUser)
  } catch (error) {
    return handleHttpError(res, error)
  }
}
