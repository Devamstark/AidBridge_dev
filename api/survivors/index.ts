import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from '../_lib/utils'

const createSurvivorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  status: z.string().optional(),
  medicalNeeds: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  specialNeeds: z.string().optional(),
  familySize: z.number().optional(),
  dependents: z.number().optional(),
  familyMembers: z.any().optional(),
  disasterId: z.string().optional(),
  locationId: z.string().optional(),
  intakeNotes: z.string().optional(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await requireAuth(req)
    
    if (req.method === 'GET') {
      const { status, disasterId, search, limit = '100' } = req.query
      
      const where: any = {}
      if (status) where.status = status
      if (disasterId) where.disasterId = disasterId
      if (search) {
        where.OR = [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { caseNumber: { contains: search as string, mode: 'insensitive' } },
        ]
      }
      
      const survivors = await prisma.survivor.findMany({
        where,
        include: {
          disaster: { select: { name: true } },
          location: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      })
      
      return res.json(survivors)
    }
    
    if (req.method === 'POST') {
      const body = createSurvivorSchema.parse(req.body)
      
      // Generate case number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      const caseNumber = `SRV-${dateStr}-${randomNum}`
      
      const survivor = await prisma.survivor.create({
        data: {
          ...body,
          caseNumber,
          status: body.status || 'REGISTERED',
          familySize: body.familySize || 1,
          dependents: body.dependents || 0,
          medicalNeeds: body.medicalNeeds || [],
          medications: body.medications || [],
          allergies: body.allergies || [],
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        },
      })
      
      // Log audit
      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'Survivor',
          entityId: survivor.id,
          details: { caseNumber },
        }
      })
      
      return res.status(201).json(survivor)
    }
    
    return methodNotAllowed(res, ['GET', 'POST'])
  } catch (error) {
    return handleHttpError(res, error)
  }
}
