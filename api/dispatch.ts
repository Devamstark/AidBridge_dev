import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/db.js'
import { requireAuth } from './_lib/auth.js'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from './_lib/utils.js'

const triggerSchema = z.object({
    type: z.string(),
    priority: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
    description: z.string(),
    disasterId: z.string().optional(),
    details: z.any().optional(),
    maxVolunteers: z.number().optional(),
    deadline: z.string().datetime().optional(),
})

const assignSchema = z.object({
    volunteerId: z.string(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        await requireAuth(req)
        const url = req.url || ''
        const id = req.query.id as string

        // trigger functionality
        if (url.includes('/trigger')) {
            if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
            const body = triggerSchema.parse(req.body)
            const { maxVolunteers = 5, ...requestData } = body
            const request = await prisma.emergencyRequest.create({
                data: {
                    ...requestData,
                    status: 'PENDING',
                    reportedAt: new Date(),
                    maxVolunteers,
                    latitude: body.latitude || 0,
                    longitude: body.longitude || 0,
                    disasterId: body.disasterId || null
                },
                include: { disaster: true }
            })
            const availableVolunteers = await prisma.volunteer.findMany({ where: { status: { in: ['AVAILABLE', 'ON_DUTY'] } }, take: maxVolunteers, include: { user: { select: { fullName: true, email: true, phone: true } } } })
            await prisma.mission.createMany({
                data: availableVolunteers.map((v: any) => ({
                    emergencyRequestId: request.id,
                    volunteerId: v.id,
                    latitude: body.latitude || 0,
                    longitude: body.longitude || 0,
                    status: 'ASSIGNED'
                }))
            })
            if (availableVolunteers.length > 0) await prisma.volunteer.updateMany({ where: { id: { in: availableVolunteers.map((v: any) => v.id) } }, data: { status: 'ON_DUTY' } })
            await prisma.auditLog.create({ data: { action: 'TRIGGER_EMERGENCY_DISPATCH', entity: 'EmergencyRequest', entityId: request.id, details: { type: body.type, priority: body.priority, volunteersAssigned: availableVolunteers.length } } })
            return res.status(201).json({ request, assignedVolunteers: availableVolunteers.length, volunteers: availableVolunteers.map((v: any) => ({ id: v.id, name: v.user.fullName, email: v.user.email })) })
        }

        // assign functionality
        if (url.includes('/assign')) {
            if (req.method !== 'PUT' && req.method !== 'POST') return methodNotAllowed(res, ['PUT', 'POST'])
            const body = assignSchema.parse(req.body)
            const requestIdValue = (req.query.requestId as string) || (req.body.requestId as string) || id

            if (!requestIdValue || requestIdValue === 'assign') {
                return res.status(400).json({ error: 'Request ID is required' })
            }

            // Fetch volunteer details for logging/details
            const volunteerInfo = await prisma.volunteer.findUnique({
                where: { id: body.volunteerId },
                include: { user: { select: { fullName: true, phone: true } } }
            })

            // Check if it's a public request (HelpRequest)
            if (requestIdValue.startsWith('REQ-')) {
                const publicReq = await (prisma as any).publicHelpRequest.findUnique({
                    where: { requestId: requestIdValue }
                })

                if (!publicReq) return res.status(404).json({ error: 'Public request not found' })

                // Create internal request AND link the volunteer
                const internalRequest = await prisma.emergencyRequest.create({
                    data: {
                        type: publicReq.emergencyType,
                        priority: publicReq.priority,
                        status: 'IN_PROGRESS',
                        latitude: publicReq.latitude || 0,
                        longitude: publicReq.longitude || 0,
                        address: publicReq.location,
                        description: `[PORTAL REQUEST ${publicReq.requestId}] ${publicReq.description}`,
                        details: {
                            portalId: publicReq.id,
                            requestId: publicReq.requestId,
                            assignedVolunteer: volunteerInfo?.user?.fullName,
                            volunteerPhone: volunteerInfo?.user?.phone
                        },
                        reportedBy: publicReq.fullName,
                        contactInfo: { phone: publicReq.phone, email: publicReq.email },
                        disasterId: publicReq.disasterId,
                        assignedVolunteers: { // Connect the volunteer here
                            connect: { id: body.volunteerId }
                        }
                    }
                })

                await (prisma as any).publicHelpRequest.update({
                    where: { requestId: requestIdValue },
                    data: { assignedTo: body.volunteerId, status: 'ASSIGNED' }
                })

                await prisma.mission.create({
                    data: {
                        emergencyRequestId: internalRequest.id,
                        volunteerId: body.volunteerId,
                        latitude: internalRequest.latitude,
                        longitude: internalRequest.longitude,
                        status: 'ASSIGNED'
                    }
                })

                return res.json({ success: true, request: internalRequest })
            } else {
                // Internal request (EmergencyRequest)
                const updatedRequest = await prisma.emergencyRequest.update({
                    where: { id: requestIdValue },
                    data: {
                        status: 'IN_PROGRESS',
                        assignedVolunteers: {
                            connect: { id: body.volunteerId }
                        }
                    }
                })
                await prisma.mission.create({
                    data: {
                        emergencyRequestId: updatedRequest.id,
                        volunteerId: body.volunteerId,
                        latitude: updatedRequest.latitude || 0,
                        longitude: updatedRequest.longitude || 0,
                        status: 'ASSIGNED'
                    }
                })
                return res.json({ success: true, request: updatedRequest })
            }
        }

        // requests functionality
        if (url.includes('/requests')) {
            if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])
            const { status, priority, type } = req.query
            const where: any = {}
            if (status) where.status = status
            if (priority) where.priority = priority

            if (type === 'public') {
                const requests = await (prisma as any).publicHelpRequest.findMany({ where, orderBy: { createdAt: 'desc' }, include: { disaster: { select: { name: true } } } })
                return res.json(requests)
            }

            if (type === 'internal') {
                const requests = await prisma.emergencyRequest.findMany({ where, orderBy: { createdAt: 'desc' }, include: { disaster: { select: { name: true } }, assignedVolunteers: { include: { user: { select: { fullName: true, phone: true } } } } } })
                return res.json(requests)
            }

            // By default, return both combined
            const [internal, publicReqs] = await Promise.all([
                prisma.emergencyRequest.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        disaster: { select: { name: true } },
                        assignedVolunteers: { include: { user: { select: { fullName: true, phone: true } } } }
                    }
                }),
                (prisma as any).publicHelpRequest.findMany({
                    where: { ...where, status: 'PENDING' }, // Only show pending public requests to avoid duplicates
                    orderBy: { createdAt: 'desc' },
                    include: { disaster: { select: { name: true } } }
                })
            ])

            const normalizedPublic = publicReqs.map((r: any) => ({
                ...r,
                type: r.emergencyType,
                address: r.location,
                isPublic: true
            }))

            const internalWithFlag = internal.map((r: any) => {
                const details = typeof r.details === 'object' ? r.details : {};
                const isPortal = !!(details as any)?.portalId;
                return {
                    ...r,
                    isPublic: isPortal,
                    // Keep the portal requestId for the UI badge if it exists
                    requestId: (details as any)?.requestId || r.id
                };
            })

            const all = [...normalizedPublic, ...internalWithFlag].sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )

            return res.json(all)
        }

        // status update functionality
        if (url.includes('/status')) {
            if (req.method !== 'PUT' && req.method !== 'POST') return methodNotAllowed(res, ['PUT', 'POST'])
            const { requestId, status: newStatus } = req.body
            if (!requestId || !newStatus) return res.status(400).json({ error: 'requestId and status are required' })

            // Check if it's a public request
            if (requestId.startsWith('REQ-')) {
                const publicReq = await (prisma as any).publicHelpRequest.findUnique({
                    where: { requestId }
                })
                if (!publicReq) return res.status(404).json({ error: 'Request not found' })

                await (prisma as any).publicHelpRequest.update({
                    where: { requestId },
                    data: {
                        status: newStatus,
                        ...(newStatus === 'RESOLVED' ? { resolvedAt: new Date() } : {})
                    }
                })

                // Release volunteers if resolving/cancelling
                if (['RESOLVED', 'CANCELLED'].includes(newStatus) && publicReq.assignedTo) {
                    await prisma.volunteer.update({
                        where: { id: publicReq.assignedTo },
                        data: { status: 'AVAILABLE' }
                    }).catch(() => { }) // ignore if volunteer not found
                }

                return res.json({ success: true, status: newStatus })
            }

            // Internal EmergencyRequest
            const request = await prisma.emergencyRequest.findUnique({
                where: { id: requestId },
                include: { assignedVolunteers: true }
            })
            if (!request) return res.status(404).json({ error: 'Request not found' })

            await prisma.emergencyRequest.update({
                where: { id: requestId },
                data: {
                    status: newStatus,
                    ...(newStatus === 'RESOLVED' ? { resolvedAt: new Date() } : {})
                }
            })

            // Release assigned volunteers back to AVAILABLE
            if (['RESOLVED', 'CANCELLED'].includes(newStatus) && request.assignedVolunteers?.length > 0) {
                await prisma.volunteer.updateMany({
                    where: { id: { in: request.assignedVolunteers.map((v: any) => v.id) } },
                    data: { status: 'AVAILABLE' }
                })
            }

            // If this was linked to a portal request, update that too
            const details = typeof request.details === 'object' ? request.details : {} as any
            if (details?.requestId) {
                await (prisma as any).publicHelpRequest.update({
                    where: { requestId: details.requestId },
                    data: {
                        status: newStatus,
                        ...(newStatus === 'RESOLVED' ? { resolvedAt: new Date() } : {})
                    }
                }).catch(() => { })
            }

            // Update missions
            await prisma.mission.updateMany({
                where: { emergencyRequestId: requestId },
                data: { status: newStatus === 'RESOLVED' ? 'COMPLETED' : newStatus }
            })

            return res.json({ success: true, status: newStatus })
        }

        return res.status(404).json({ error: 'Not found' })
    } catch (error) {
        return handleHttpError(res, error)
    }
}
