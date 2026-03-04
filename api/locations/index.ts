import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from '../_lib/utils'

const createLocationSchema = z.object({
  name: z.string().min(1),
  locationType: z.string(),
  operationalStatus: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  capacity: z.number().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  managerName: z.string().optional(),
  disasterId: z.string().optional(),
  resources: z.any().optional(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await requireAuth(req)
    
    if (req.method === 'GET') {
      const { operationalStatus, locationType, disasterId, limit = '100' } = req.query
      
      const where: any = {}
      if (operationalStatus) where.operationalStatus = operationalStatus
      if (locationType) where.locationType = locationType
      if (disasterId) where.disasterId = disasterId
      
      const locations = await prisma.location.findMany({
        where,
        include: {
          disaster: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      })
      
      return res.json(locations)
    }
    
    if (req.method === 'POST') {
      const body = createLocationSchema.parse(req.body)
      
      const location = await prisma.location.create({
        data: {
          ...body,
          operationalStatus: body.operationalStatus || 'OPEN',
          country: body.country || 'USA',
          currentOccupancy: 0,
        },
      })
      
      return res.status(201).json(location)
    }
    
    return methodNotAllowed(res, ['GET', 'POST'])
  } catch (error) {
    return handleHttpError(res, error)
  }
}
