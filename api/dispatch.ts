import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/db.js'
import { requireAuth } from './_lib/auth.js'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from './_lib/utils.js'

const triggerSchema = z.object({
    type: z.string(),
    priority: z.string(),
    latitude: z.number(),
    longitude: z.number(),
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
            const request = await prisma.emergencyRequest.create({ data: { ...requestData, status: 'PENDING', reportedAt: new Date(), maxVolunteers }, include: { disaster: true } })
            const availableVolunteers = await prisma.volunteer.findMany({ where: { status: { in: ['AVAILABLE', 'ON_DUTY'] } }, take: maxVolunteers, include: { user: { select: { fullName: true, email: true, phone: true } } } })
            await prisma.mission.createMany({ data: availableVolunteers.map((v: any) => ({ emergencyRequestId: request.id, volunteerId: v.id, latitude: body.latitude, longitude: body.longitude, status: 'ASSIGNED' })) })
            if (availableVolunteers.length > 0) await prisma.volunteer.updateMany({ where: { id: { in: availableVolunteers.map((v: any) => v.id) } }, data: { status: 'ON_DUTY' } })
            await prisma.auditLog.create({ data: { action: 'TRIGGER_EMERGENCY_DISPATCH', entity: 'EmergencyRequest', entityId: request.id, details: { type: body.type, priority: body.priority, volunteersAssigned: availableVolunteers.length } } })
            return res.status(201).json({ request, assignedVolunteers: availableVolunteers.length, volunteers: availableVolunteers.map((v: any) => ({ id: v.id, name: v.user.fullName, email: v.user.email })) })
        }

        // assign functionality
        if (url.includes('/assign')) {
            if (req.method !== 'PUT') return methodNotAllowed(res, ['PUT'])
            const body = assignSchema.parse(req.body)
            const updatedRequest = await prisma.publicHelpRequest.update({ where: { requestId: id }, data: { assignedTo: body.volunteerId, status: 'ASSIGNED' } })
            const request = await prisma.publicHelpRequest.findUnique({ where: { requestId: id } })
            if (request) { await prisma.mission.create({ data: { emergencyRequestId: request.id, volunteerId: body.volunteerId, latitude: request.latitude || 0, longitude: request.longitude || 0, status: 'ASSIGNED' } }) }
            return res.json({ success: true, request: updatedRequest })
        }

        // requests functionality
        if (url.includes('/requests')) {
            if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])
            const { status, priority, type } = req.query
            const where: any = {}
            if (status) where.status = status
            if (priority) where.priority = priority
            if (type === 'public') {
                const requests = await prisma.publicHelpRequest.findMany({ where, orderBy: { createdAt: 'desc' }, include: { disaster: { select: { name: true } } } })
                return res.json(requests)
            }
            const requests = await prisma.emergencyRequest.findMany({ where, orderBy: { createdAt: 'desc' }, include: { disaster: { select: { name: true } }, assignedVolunteers: { include: { user: { select: { fullName: true, phone: true } } } } } })
            return res.json(requests)
        }

        return res.status(404).json({ error: 'Not found' })
    } catch (error) {
        return handleHttpError(res, error)
    }
}
