import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/db.js'
import { requireAuth } from './_lib/auth.js'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from './_lib/utils.js'

const createDisasterSchema = z.object({
    name: z.string().min(1),
    disasterType: z.string(),
    severity: z.number().min(1).max(5).optional(),
    affectedArea: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    radius: z.number().optional(),
    description: z.string().optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    estimatedAffected: z.number().optional(),
})

const updateDisasterSchema = z.object({
    name: z.string().min(1).optional(),
    status: z.string().optional(),
    severity: z.number().min(1).max(5).optional(),
    affectedArea: z.string().optional(),
    description: z.string().optional(),
    endDate: z.string().datetime().optional(),
    resourcesAssigned: z.any().optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        await requireAuth(req)
        const url = req.url || ''
        const id = req.query.id as string

        // [id].ts functionality
        if (id) {
            if (req.method === 'GET') {
                const disaster = await prisma.disaster.findUnique({ where: { id } })
                if (!disaster) return res.status(404).json({ error: 'Disaster not found' })
                return res.json(disaster)
            }
            if (req.method === 'PUT') {
                const body = updateDisasterSchema.parse(req.body)
                const disaster = await prisma.disaster.update({
                    where: { id },
                    data: { ...body, endDate: body.endDate ? new Date(body.endDate) : undefined },
                })
                return res.json(disaster)
            }
            if (req.method === 'DELETE') {
                await prisma.disaster.delete({ where: { id } })
                return res.status(204).end()
            }
            return methodNotAllowed(res, ['GET', 'PUT', 'DELETE'])
        }

        // index.ts functionality
        if (req.method === 'GET') {
            const { status, disasterType, limit = '100', orderBy = '-created_date' } = req.query
            const where: any = {}
            if (status) where.status = status
            if (disasterType) where.disasterType = disasterType
            const disasters = await prisma.disaster.findMany({
                where,
                orderBy: { createdAt: (orderBy as string).startsWith('-') ? 'desc' : 'asc' },
                take: Number(limit),
            })
            return res.json(disasters)
        }
        if (req.method === 'POST') {
            const body = createDisasterSchema.parse(req.body)
            const disaster = await prisma.disaster.create({
                data: { ...body, severity: body.severity || 1, startDate: new Date(body.startDate), endDate: body.endDate ? new Date(body.endDate) : null, status: 'ACTIVE' },
            })
            return res.status(201).json(disaster)
        }
        return methodNotAllowed(res, ['GET', 'POST'])
    } catch (error) {
        return handleHttpError(res, error)
    }
}
