import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../_lib/db'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from '../_lib/utils'

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  householdSize: z.number().min(1).default(1),
  consentDataSharing: z.boolean().default(false),
  consentContact: z.boolean().default(true),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      return methodNotAllowed(res, ['POST'])
    }

    const body = registerSchema.parse(req.body)

    // Generate case number: SRV-YYYYMMDD-XXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const caseNumber = `SRV-${dateStr}-${randomNum}`

    const registration = await prisma.survivorRegistration.create({
      data: {
        ...body,
        caseNumber,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      },
    })

    res.status(201).json({
      caseNumber: registration.caseNumber,
      status: 'PENDING',
      message: 'Registration submitted successfully. Save your Case Number to track status.',
      createdAt: registration.createdAt,
    })
  } catch (error) {
    return handleHttpError(res, error)
  }
}
