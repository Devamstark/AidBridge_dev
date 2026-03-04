import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from '../_lib/utils'

const statusCheckSchema = z.object({
  volunteerId: z.string(),
  status: z.string(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number().optional(),
  }).optional(),
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
    
    const body = statusCheckSchema.parse(req.body)
    
    // Update volunteer status
    const updateData: any = {
      status: body.status,
    }
    
    if (body.location) {
      updateData.currentLat = body.location.lat
      updateData.currentLng = body.location.lng
      updateData.lastLocationUpdate = new Date()
    }
    
    const volunteer = await prisma.volunteer.update({
      where: { id: body.volunteerId },
      data: updateData,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          }
        }
      }
    })
    
    // Log location history if location provided
    if (body.location) {
      await prisma.volunteerLocationHistory.create({
        data: {
          volunteerId: body.volunteerId,
          lat: body.location.lat,
          lng: body.location.lng,
          accuracy: body.location.accuracy,
        }
      })
    }
    
    res.json(volunteer)
  } catch (error) {
    return handleHttpError(res, error)
  }
}
