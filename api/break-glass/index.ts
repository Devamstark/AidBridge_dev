import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { requireAuth } from '../_lib/auth'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from '../_lib/utils'

const breakGlassSchema = z.object({
  reason: z.string().min(10),
  duration: z.number().min(1).max(24).optional(), // hours
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const authUser = await requireAuth(req)
    
    if (req.method === 'GET') {
      // Get user's break glass events
      const events = await prisma.breakGlassEvent.findMany({
        where: { userId: authUser.id },
        orderBy: { grantedAt: 'desc' },
        take: 20,
      })
      
      return res.json(events)
    }
    
    if (req.method === 'POST') {
      const body = breakGlassSchema.parse(req.body)
      
      // Check if user has break glass access
      const user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { breakGlassAccess: true }
      })
      
      if (!user?.breakGlassAccess) {
        return res.status(403).json({ error: 'No break glass access' })
      }
      
      // Create break glass event
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + (body.duration || 4))
      
      const event = await prisma.breakGlassEvent.create({
        data: {
          userId: authUser.id,
          reason: body.reason,
          expiresAt,
          used: false,
        }
      })
      
      // Log audit
      await prisma.auditLog.create({
        data: {
          action: 'BREAK_GLASS_ACTIVATED',
          entity: 'BreakGlassEvent',
          entityId: event.id,
          details: {
            reason: body.reason,
            expiresAt: expiresAt.toISOString(),
          }
        }
      })
      
      return res.status(201).json({
        ...event,
        message: 'Break glass access granted. Use before it expires.',
      })
    }
    
    return methodNotAllowed(res, ['GET', 'POST'])
  } catch (error) {
    return handleHttpError(res, error)
  }
}
