import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/db.js'
import { requireAuth } from '../_lib/auth.js'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from '../_lib/utils.js'

const updateVolunteerSchema = z.object({
  status: z.string().optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  availability: z.any().optional(),
  emergencyContact: z.any().optional(),
  currentLat: z.number().optional(),
  currentLng: z.number().optional(),
  totalMissions: z.number().optional(),
  hoursVolunteered: z.number().optional(),
  rating: z.number().optional(),
})

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    await requireAuth(req)

    const { id } = req.query

    if (req.method === 'GET') {
      const volunteer = await prisma.volunteer.findUnique({
        where: { id: id as string },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phone: true,
              role: true,
            }
          },
          missions: {
            take: 10,
            orderBy: { assignedAt: 'desc' },
          },
        },
      })

      if (!volunteer) {
        return res.status(404).json({ error: 'Volunteer not found' })
      }

      return res.json(volunteer)
    }

    if (req.method === 'PUT') {
      const body = updateVolunteerSchema.parse(req.body)

      const volunteer = await prisma.volunteer.update({
        where: { id: id as string },
        data: body,
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              role: true,
            }
          }
        },
      })

      return res.json(volunteer)
    }

    if (req.method === 'DELETE') {
      await prisma.volunteer.delete({
        where: { id: id as string },
      })

      return res.status(204).end()
    }

    return methodNotAllowed(res, ['GET', 'PUT', 'DELETE'])
  } catch (error) {
    return handleHttpError(res, error)
  }
}
