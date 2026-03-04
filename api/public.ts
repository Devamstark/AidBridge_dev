import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/db.js'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from './_lib/utils.js'

const helpRequestSchema = z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional().or(z.literal('')).nullable(),
    location: z.string().min(1),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    emergencyType: z.enum(['MEDICAL', 'RESCUE', 'SHELTER', 'FOOD', 'OTHER']),
    priority: z.enum(['P0', 'P1', 'P2', 'P3']).default('P2'),
    description: z.string().min(1),
    peopleCount: z.number().min(1).default(1),
})

const registerSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional().or(z.literal('')).nullable(),
    dateOfBirth: z.string().optional().nullable(),
    householdSize: z.number().min(1).default(1),
    consentDataSharing: z.boolean().default(false),
    consentContact: z.boolean().default(true),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const url = req.url || ''
        const id = (req.query.id as string || '').replace(/\/$/, '')

        console.log('Public API Call:', { url, id, method: req.method })

        // Help Request
        if (id === 'help' || url.includes('/public/help')) {
            if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

            console.log('Help request body:', req.body)
            const body = helpRequestSchema.parse(req.body)
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
            const randomNum = Math.floor(100 + Math.random() * 900)
            const requestId = `REQ-${dateStr}-${randomNum}`
            const helpRequest = await (prisma as any).publicHelpRequest.create({
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
        if (id === 'register' || id === 'survivor/register' || url.includes('/register')) {
            if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
            const body = registerSchema.parse(req.body)
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
            const randomNum = Math.floor(1000 + Math.random() * 9000)
            const caseNumber = `SRV-${dateStr}-${randomNum}`

            // Create in the main Survivor table so it shows on Dashboard
            const registration = await prisma.survivor.create({
                data: {
                    firstName: body.firstName,
                    lastName: body.lastName,
                    phone: body.phone,
                    email: body.email,
                    caseNumber,
                    dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
                    familySize: body.householdSize,
                    status: 'PENDING_REVIEW', // Special status for web registrations
                    intakeNotes: `[WEB_PORTAL] Consent Info: Data=${body.consentDataSharing}, Contact=${body.consentContact}`
                }
            })

            return res.status(201).json({
                caseNumber: registration.caseNumber,
                status: 'PENDING',
                message: 'Registration submitted successfully. Save your Case Number to track status.',
                createdAt: registration.createdAt
            })
        }

        // Track Request
        let activeRoute = id
        let searchId = req.query.trackingId as string || ''

        if (id.startsWith('track')) {
            activeRoute = 'track'
            if (!searchId) searchId = id.replace('track', '').replace(/^\//, '')
        }

        if (activeRoute === 'track' || url.includes('/public/track')) {
            if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

            if (!searchId || searchId === 'track') return res.status(400).json({ error: 'Request ID is required' })

            // Try to find as Help Request
            const helpRequest = await (prisma as any).publicHelpRequest.findUnique({
                where: { requestId: searchId },
                include: { disaster: { select: { name: true } } }
            })
            if (helpRequest) {
                let responder = null
                // Use stored volunteer info first, fallback to lookup
                if (helpRequest.assignedVolunteerName) {
                    responder = {
                        fullName: helpRequest.assignedVolunteerName,
                        phone: helpRequest.assignedVolunteerPhone
                    }
                } else if (helpRequest.assignedTo) {
                    const volunteer = await prisma.volunteer.findUnique({
                        where: { id: helpRequest.assignedTo },
                        include: { user: { select: { fullName: true, phone: true } } }
                    })
                    if (volunteer) {
                        responder = {
                            fullName: volunteer.user.fullName,
                            phone: volunteer.user.phone
                        }
                    }
                }

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
                    responder,
                    timeline: [
                        { status: 'PENDING', timestamp: helpRequest.createdAt },
                        ...(helpRequest.status !== 'PENDING' ? [{ status: 'ASSIGNED', timestamp: helpRequest.updatedAt }] : []),
                        ...(helpRequest.status === 'RESOLVED' ? [{ status: 'RESOLVED', timestamp: helpRequest.resolvedAt }] : [])
                    ]
                })
            }

            // Try to find as Survivor Registration (Main Table)
            const survivor = await prisma.survivor.findUnique({
                where: { caseNumber: searchId }
            })
            if (survivor) {
                return res.json({
                    type: 'SURVIVOR_REGISTRATION',
                    caseNumber: survivor.caseNumber,
                    status: survivor.status,
                    firstName: survivor.firstName,
                    lastName: survivor.lastName,
                    createdAt: survivor.createdAt,
                    message: survivor.status === 'PENDING_REVIEW'
                        ? 'Your registration is being processed. A coordinator will contact you soon.'
                        : `Your status is currently: ${survivor.status}`
                })
            }

            // Fallback for legacy registration table
            const legacyReg = await (prisma as any).survivorRegistration.findUnique({
                where: { caseNumber: searchId }
            })
            if (legacyReg) {
                return res.json({ type: 'SURVIVOR_REGISTRATION', caseNumber: legacyReg.caseNumber, status: 'PENDING', firstName: legacyReg.firstName, lastName: legacyReg.lastName, createdAt: legacyReg.createdAt, message: 'Your registration is being processed. A coordinator will contact you soon.' })
            }
            return res.status(404).json({ error: 'Request ID or Case Number not found' })
        }

        return res.status(404).json({ error: 'Not found' })
    } catch (error) {
        return handleHttpError(res, error)
    }
}
