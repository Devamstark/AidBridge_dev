import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from '../_lib/utils'

const updateSurvivorSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  status: z.string().optional(),
  medicalNeeds: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  specialNeeds: z.string().optional(),
  locationId: z.string().optional(),
  intakeNotes: z.string().optional(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await requireAuth(req)
    
    const { id } = req.query
    
    if (req.method === 'GET') {
      const survivor = await prisma.survivor.findUnique({
        where: { id: id as string },
        include: {
          disaster: true,
          location: true,
        },
      })
      
      if (!survivor) {
        return res.status(404).json({ error: 'Survivor not found' })
      }
      
      return res.json(survivor)
    }
    
    if (req.method === 'PUT') {
      const body = updateSurvivorSchema.parse(req.body)
      
      const survivor = await prisma.survivor.update({
        where: { id: id as string },
        data: body,
      })
      
      return res.json(survivor)
    }
    
    if (req.method === 'DELETE') {
      await prisma.survivor.delete({
        where: { id: id as string },
      })
      
      return res.status(204).end()
    }
    
    return methodNotAllowed(res, ['GET', 'PUT', 'DELETE'])
  } catch (error) {
    return handleHttpError(res, error)
  }
}
