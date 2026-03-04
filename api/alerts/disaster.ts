import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from '../_lib/utils'

const alertSchema = z.object({
  disasterId: z.string(),
  message: z.string().optional(),
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
    
    const body = alertSchema.parse(req.body)
    
    // Get disaster
    const disaster = await prisma.disaster.findUnique({
      where: { id: body.disasterId }
    })
    
    if (!disaster) {
      return res.status(404).json({ error: 'Disaster not found' })
    }
    
    // Get available volunteers near the disaster
    const volunteers = await prisma.volunteer.findMany({
      where: {
        status: 'AVAILABLE',
        currentLat: { not: null },
        currentLng: { not: null },
      },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            fullName: true,
          }
        }
      }
    })
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        action: 'DISASTER_ALERT_VOLUNTEERS',
        entity: 'Disaster',
        entityId: body.disasterId,
        details: {
          disasterName: disaster.name,
          alertedVolunteers: volunteers.length,
        }
      }
    })
    
    // TODO: Send actual notifications (email/SMS/push)
    // For now, return the list of volunteers to alert
    
    res.json({
      disaster: {
        id: disaster.id,
        name: disaster.name,
        type: disaster.disasterType,
        severity: disaster.severity,
      },
      alertedVolunteers: volunteers.length,
      volunteers: volunteers.map(v => ({
        id: v.id,
        name: v.user.fullName,
        email: v.user.email,
        phone: v.user.phone,
        currentLat: v.currentLat,
        currentLng: v.currentLng,
      }))
    })
  } catch (error) {
    return handleHttpError(res, error)
  }
}
