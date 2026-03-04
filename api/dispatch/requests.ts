import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { handleHttpError, methodNotAllowed } from '../_lib/utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Require authentication
    await requireAuth(req)

    if (req.method !== 'GET') {
      return methodNotAllowed(res, ['GET'])
    }

    const { status, priority, type } = req.query

    const where: any = {}
    
    if (status) where.status = status
    if (priority) where.priority = priority
    
    // If type is 'public', only get public help requests
    if (type === 'public') {
      const requests = await prisma.publicHelpRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          disaster: { select: { name: true } },
        },
      })

      return res.json(requests)
    }

    // Otherwise return emergency requests
    const requests = await prisma.emergencyRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        disaster: { select: { name: true } },
        assignedVolunteers: {
          include: {
            user: { select: { fullName: true, phone: true } }
          }
        },
      },
    })

    res.json(requests)
  } catch (error) {
    return handleHttpError(res, error)
  }
}
