import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from '../_lib/utils'

const createDistributionSchema = z.object({
  distributionType: z.string(),
  quantity: z.number(),
  disasterId: z.string().optional(),
  locationId: z.string().optional(),
  status: z.string().optional(),
  scheduledDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    resourceId: z.string(),
    quantity: z.number(),
  })).optional(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const authUser = await requireAuth(req)
    
    if (req.method === 'GET') {
      const { status, disasterId, limit = '100' } = req.query
      
      const where: any = {}
      if (status) where.status = status
      if (disasterId) where.disasterId = disasterId
      
      const distributions = await prisma.distribution.findMany({
        where,
        include: {
          disaster: { select: { name: true } },
          location: { select: { name: true } },
          items: {
            include: {
              resource: { select: { name: true, category: true } }
            }
          },
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      })
      
      return res.json(distributions)
    }
    
    if (req.method === 'POST') {
      const body = createDistributionSchema.parse(req.body)
      const { items, ...distributionData } = body
      
      const distribution = await prisma.distribution.create({
        data: {
          ...distributionData,
          status: body.status || 'PLANNED',
          scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
          createdById: authUser.id,
          quantityDistributed: 0,
          items: items ? {
            create: items.map(item => ({
              resourceId: item.resourceId,
              quantity: item.quantity,
              quantityDistributed: 0,
            }))
          } : undefined,
        },
        include: {
          items: {
            include: {
              resource: true
            }
          }
        }
      })
      
      return res.status(201).json(distribution)
    }
    
    return methodNotAllowed(res, ['GET', 'POST'])
  } catch (error) {
    return handleHttpError(res, error)
  }
}
