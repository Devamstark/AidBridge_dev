import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from '../_lib/utils'

const updateDisasterSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.string().optional(),
  severity: z.number().min(1).max(5).optional(),
  affectedArea: z.string().optional(),
  description: z.string().optional(),
  endDate: z.string().datetime().optional(),
  resourcesAssigned: z.any().optional(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await requireAuth(req)
    
    const { id } = req.query
    
    if (req.method === 'GET') {
      const disaster = await prisma.disaster.findUnique({
        where: { id: id as string },
      })
      
      if (!disaster) {
        return res.status(404).json({ error: 'Disaster not found' })
      }
      
      return res.json(disaster)
    }
    
    if (req.method === 'PUT') {
      const body = updateDisasterSchema.parse(req.body)
      
      const disaster = await prisma.disaster.update({
        where: { id: id as string },
        data: {
          ...body,
          endDate: body.endDate ? new Date(body.endDate) : undefined,
        },
      })
      
      return res.json(disaster)
    }
    
    if (req.method === 'DELETE') {
      await prisma.disaster.delete({
        where: { id: id as string },
      })
      
      return res.status(204).end()
    }
    
    return methodNotAllowed(res, ['GET', 'PUT', 'DELETE'])
  } catch (error) {
    return handleHttpError(res, error)
  }
}
