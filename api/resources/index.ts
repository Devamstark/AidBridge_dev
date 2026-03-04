import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from '../_lib/utils'

const createResourceSchema = z.object({
  name: z.string().min(1),
  category: z.string(),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  unitType: z.string().optional(),
  unitWeight: z.number().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  storageTemp: z.string().optional(),
  hazardous: z.boolean().optional(),
  perishable: z.boolean().optional(),
  shelfLifeDays: z.number().optional(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await requireAuth(req)
    
    if (req.method === 'GET') {
      const { category, search, limit = '100' } = req.query
      
      const where: any = {}
      if (category) where.category = category
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { sku: { contains: search as string, mode: 'insensitive' } },
        ]
      }
      
      const resources = await prisma.resource.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      })
      
      return res.json(resources)
    }
    
    if (req.method === 'POST') {
      const body = createResourceSchema.parse(req.body)
      
      const resource = await prisma.resource.create({
        data: {
          ...body,
          unitType: body.unitType || 'each',
          hazardous: body.hazardous || false,
          perishable: body.perishable || false,
        },
      })
      
      return res.status(201).json(resource)
    }
    
    return methodNotAllowed(res, ['GET', 'POST'])
  } catch (error) {
    return handleHttpError(res, error)
  }
}
