import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { handleHttpError, methodNotAllowed } from '../_lib/utils'
import { z } from 'zod'

const assignSchema = z.object({
  volunteerId: z.string(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await requireAuth(req)

    if (req.method !== 'PUT') {
      return methodNotAllowed(res, ['PUT'])
    }

    const { id } = req.query
    const body = assignSchema.parse(req.body)

    // Update the help request
    const updatedRequest = await prisma.publicHelpRequest.update({
      where: { requestId: id as string },
      data: {
        assignedTo: body.volunteerId,
        status: 'ASSIGNED',
      },
    })

    // Create a mission for the volunteer
    const request = await prisma.publicHelpRequest.findUnique({
      where: { requestId: id as string },
    })

    if (request) {
      await prisma.mission.create({
        data: {
          emergencyRequestId: request.id,
          volunteerId: body.volunteerId,
          latitude: request.latitude || 0,
          longitude: request.longitude || 0,
          status: 'ASSIGNED',
        },
      })
    }

    res.json({ success: true, request: updatedRequest })
  } catch (error) {
    return handleHttpError(res, error)
  }
}
