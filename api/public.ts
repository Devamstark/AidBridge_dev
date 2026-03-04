import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/db.js'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from './_lib/utils.js'

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const url = req.url || ''

        // Help Request
        if (url.includes('/public/help')) {
            if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

            console.log('Help request body:', req.body)

            const body = helpRequestSchema.parse(req.body)
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
            const randomNum = Math.floor(100 + Math.random() * 900)
            const requestId = `REQ-${dateStr}-${randomNum}`
            const helpRequest = await prisma.publicHelpRequest.create({
                data: {
                    ...body,
                    requestId,
                    status: 'PENDING',
                    latitude: body.latitude || null,
                    longitude: body.longitude || null,
                }
            })
            return res.status(201).json({
                requestId: helpRequest.requestId,
                status: helpRequest.status,
                message: 'Help request submitted successfully. Save your Request ID to track status.',
                createdAt: helpRequest.createdAt
            })
        }

        // Register Survivor
        if (url.includes('/public/register')) {
            if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
            const body = registerSchema.parse(req.body)
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
            const randomNum = Math.floor(1000 + Math.random() * 9000)
            const caseNumber = `SRV-${dateStr}-${randomNum}`
            const registration = await prisma.survivorRegistration.create({ data: { ...body, caseNumber, dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null } })
            return res.status(201).json({ caseNumber: registration.caseNumber, status: 'PENDING', message: 'Registration submitted successfully. Save your Case Number to track status.', createdAt: registration.createdAt })
        }

        // Track Request
        if (url.includes('/public/track')) {
            if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])
            const { id } = req.query
            if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Request ID is required' })
            const helpRequest = await prisma.publicHelpRequest.findUnique({ where: { requestId: id }, include: { disaster: { select: { name: true } } } })
            if (helpRequest) {
                return res.json({ type: 'HELP_REQUEST', requestId: helpRequest.requestId, status: helpRequest.status, emergencyType: helpRequest.emergencyType, createdAt: helpRequest.createdAt, updatedAt: helpRequest.updatedAt, resolvedAt: helpRequest.resolvedAt, location: helpRequest.location, peopleCount: helpRequest.peopleCount, timeline: [{ status: 'PENDING', timestamp: helpRequest.createdAt }, ...(helpRequest.status !== 'PENDING' ? [{ status: 'ASSIGNED', timestamp: helpRequest.updatedAt }] : []), ...(helpRequest.status === 'RESOLVED' ? [{ status: 'RESOLVED', timestamp: helpRequest.resolvedAt }] : [])] })
            }
            const registration = await prisma.survivorRegistration.findUnique({ where: { caseNumber: id } })
            if (registration) {
                return res.json({ type: 'SURVIVOR_REGISTRATION', caseNumber: registration.caseNumber, status: 'PENDING', firstName: registration.firstName, lastName: registration.lastName, createdAt: registration.createdAt, message: 'Your registration is being processed. A coordinator will contact you soon.' })
            }
            return res.status(404).json({ error: 'Request ID or Case Number not found' })
        }

        return res.status(404).json({ error: 'Not found' })
    } catch (error) {
        return handleHttpError(res, error)
    }
}
