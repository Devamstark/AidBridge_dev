import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from '../_lib/utils'

const helpRequestSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal('')),
  location: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  emergencyType: z.enum(['MEDICAL', 'RESCUE', 'SHELTER', 'FOOD', 'OTHER']),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).default('P2'),
  description: z.string().min(10),
  peopleCount: z.number().min(1).default(1),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      return methodNotAllowed(res, ['POST'])
    }

    const body = helpRequestSchema.parse(req.body)

    // Generate request ID: REQ-YYYYMMDD-XXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = Math.floor(100 + Math.random() * 900)
    const requestId = `REQ-${dateStr}-${randomNum}`

    const helpRequest = await prisma.publicHelpRequest.create({
      data: {
        ...body,
        requestId,
        status: 'PENDING',
      },
    })

    res.status(201).json({
      requestId: helpRequest.requestId,
      status: helpRequest.status,
      message: 'Help request submitted successfully. Save your Request ID to track status.',
      createdAt: helpRequest.createdAt,
    })
  } catch (error) {
    return handleHttpError(res, error)
  }
}
