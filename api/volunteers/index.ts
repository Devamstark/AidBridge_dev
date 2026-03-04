import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from '../_lib/utils'

const createVolunteerSchema = z.object({
  userId: z.string(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  availability: z.any().optional(),
  emergencyContact: z.any().optional(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await requireAuth(req)
    
    if (req.method === 'GET') {
      const { status, limit = '100' } = req.query
      
      const where: any = {}
      if (status) where.status = status
      
      const volunteers = await prisma.volunteer.findMany({
        where,
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phone: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      })
      
      return res.json(volunteers)
    }
    
    if (req.method === 'POST') {
      const body = createVolunteerSchema.parse(req.body)
      
      const volunteer = await prisma.volunteer.create({
        data: {
          userId: body.userId,
          skills: body.skills || [],
          certifications: body.certifications || [],
          status: 'AVAILABLE',
        },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              role: true,
            }
          }
        },
      })
      
      return res.status(201).json(volunteer)
    }
    
    return methodNotAllowed(res, ['GET', 'POST'])
  } catch (error) {
    return handleHttpError(res, error)
  }
}
