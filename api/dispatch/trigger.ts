import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from '../_lib/utils'

const triggerSchema = z.object({
  type: z.string(),
  priority: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  description: z.string(),
  disasterId: z.string().optional(),
  details: z.any().optional(),
  maxVolunteers: z.number().optional(),
  deadline: z.string().datetime().optional(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await requireAuth(req)
    
    if (req.method !== 'POST') {
      return methodNotAllowed(res, ['POST'])
    }
    
    const body = triggerSchema.parse(req.body)
    const { maxVolunteers = 5, ...requestData } = body
    
    // Create emergency request
    const request = await prisma.emergencyRequest.create({
      data: {
        ...requestData,
        status: 'PENDING',
        reportedAt: new Date(),
        maxVolunteers,
      },
      include: {
        disaster: true,
      }
    })
    
    // Find available volunteers
    const availableVolunteers = await prisma.volunteer.findMany({
      where: {
        status: { in: ['AVAILABLE', 'ON_DUTY'] },
      },
      take: maxVolunteers,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          }
        }
      }
    })
    
    // Create missions for assigned volunteers
    await prisma.mission.createMany({
      data: availableVolunteers.map(v => ({
        emergencyRequestId: request.id,
        volunteerId: v.id,
        latitude: body.latitude,
        longitude: body.longitude,
        status: 'ASSIGNED',
      }))
    })
    
    // Update volunteer status
    if (availableVolunteers.length > 0) {
      await prisma.volunteer.updateMany({
        where: {
          id: { in: availableVolunteers.map(v => v.id) }
        },
        data: { status: 'ON_DUTY' }
      })
    }
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        action: 'TRIGGER_EMERGENCY_DISPATCH',
        entity: 'EmergencyRequest',
        entityId: request.id,
        details: {
          type: body.type,
          priority: body.priority,
          volunteersAssigned: availableVolunteers.length,
        }
      }
    })
    
    res.status(201).json({
      request,
      assignedVolunteers: availableVolunteers.length,
      volunteers: availableVolunteers.map(v => ({
        id: v.id,
        name: v.user.fullName,
        email: v.user.email,
      }))
    })
  } catch (error) {
    return handleHttpError(res, error)
  }
}
