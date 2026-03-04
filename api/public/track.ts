import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/db.js'
import { handleHttpError, methodNotAllowed } from '../_lib/utils.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    if (req.method !== 'GET') {
      return methodNotAllowed(res, ['GET'])
    }

    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Request ID is required' })
    }

    // Try to find as help request first
    const helpRequest = await prisma.publicHelpRequest.findUnique({
      where: { requestId: id },
      include: {
        disaster: { select: { name: true } },
      },
    })

    if (helpRequest) {
      return res.json({
        type: 'HELP_REQUEST',
        requestId: helpRequest.requestId,
        status: helpRequest.status,
        emergencyType: helpRequest.emergencyType,
        createdAt: helpRequest.createdAt,
        updatedAt: helpRequest.updatedAt,
        resolvedAt: helpRequest.resolvedAt,
        location: helpRequest.location,
        peopleCount: helpRequest.peopleCount,
        timeline: [
          { status: 'PENDING', timestamp: helpRequest.createdAt },
          ...(helpRequest.status !== 'PENDING' ? [{ status: 'ASSIGNED', timestamp: helpRequest.updatedAt }] : []),
          ...(helpRequest.status === 'RESOLVED' ? [{ status: 'RESOLVED', timestamp: helpRequest.resolvedAt }] : []),
        ],
      })
    }

    // Try to find as survivor registration
    const registration = await prisma.survivorRegistration.findUnique({
      where: { caseNumber: id },
    })

    if (registration) {
      return res.json({
        type: 'SURVIVOR_REGISTRATION',
        caseNumber: registration.caseNumber,
        status: 'PENDING',
        firstName: registration.firstName,
        lastName: registration.lastName,
        createdAt: registration.createdAt,
        message: 'Your registration is being processed. A coordinator will contact you soon.',
      })
    }

    return res.status(404).json({ error: 'Request ID or Case Number not found' })
  } catch (error) {
    return handleHttpError(res, error)
  }
}
