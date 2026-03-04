import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from '../_lib/utils'

const createDisasterSchema = z.object({
  name: z.string().min(1),
  disasterType: z.string(),
  severity: z.number().min(1).max(5).optional(),
  affectedArea: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().optional(),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  estimatedAffected: z.number().optional(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await requireAuth(req)
    
    if (req.method === 'GET') {
      const { status, disasterType, limit = '100', orderBy = '-created_date' } = req.query
      
      const where: any = {}
      if (status) where.status = status
      if (disasterType) where.disasterType = disasterType
      
      const disasters = await prisma.disaster.findMany({
        where,
        orderBy: { createdAt: orderBy.startsWith('-') ? 'desc' : 'asc' },
        take: Number(limit),
      })
      
      return res.json(disasters)
    }
    
    if (req.method === 'POST') {
      const body = createDisasterSchema.parse(req.body)
      
      const disaster = await prisma.disaster.create({
        data: {
          ...body,
          severity: body.severity || 1,
          startDate: new Date(body.startDate),
          endDate: body.endDate ? new Date(body.endDate) : null,
          status: 'ACTIVE',
        },
      })
      
      return res.status(201).json(disaster)
    }
    
    return methodNotAllowed(res, ['GET', 'POST'])
  } catch (error) {
    return handleHttpError(res, error)
  }
}
