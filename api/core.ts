import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/db.js'
import { requireAuth } from './_lib/auth.js'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from './_lib/utils.js'

const createLocationSchema = z.object({
    name: z.string().min(1),
    locationType: z.string(),
    operationalStatus: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    latitude: z.number(),
    longitude: z.number(),
    capacity: z.number().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    managerName: z.string().optional(),
    disasterId: z.string().optional(),
    resources: z.any().optional(),
})

const createResourceSchema = z.object({
    name: z.string().min(1),
    category: z.string(),
    subcategory: z.string().optional(),
    description: z.string().optional(),
    unitType: z.string().optional(),
    unitWeight: z.number().optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    storageTemp: z.string().optional(),
    hazardous: z.boolean().optional(),
    perishable: z.boolean().optional(),
    shelfLifeDays: z.number().optional(),
})

const createDistributionSchema = z.object({
    distributionType: z.string(),
    quantity: z.number(),
    disasterId: z.string().optional(),
    locationId: z.string().optional(),
    status: z.string().optional(),
    scheduledDate: z.string().datetime().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({ resourceId: z.string(), quantity: z.number() })).optional(),
})

const breakGlassSchema = z.object({ reason: z.string().min(10), duration: z.number().min(1).max(24).optional() })

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const authUser = await requireAuth(req)
        const url = req.url || ''

        // Locations
        if (url.includes('/locations')) {
            if (req.method === 'GET') {
                const { operationalStatus, locationType, disasterId, limit = '100' } = req.query
                const where: any = {}
                if (operationalStatus) where.operationalStatus = operationalStatus
                if (locationType) where.locationType = locationType
                if (disasterId) where.disasterId = disasterId
                const locations = await prisma.location.findMany({ where, include: { disaster: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: Number(limit) })
                return res.json(locations)
            }
            if (req.method === 'POST') {
                const body = createLocationSchema.parse(req.body)
                const location = await prisma.location.create({ data: { ...body, operationalStatus: body.operationalStatus || 'OPEN', country: body.country || 'USA', currentOccupancy: 0 } })
                return res.status(201).json(location)
            }
            return methodNotAllowed(res, ['GET', 'POST'])
        }

        // Resources
        if (url.includes('/resources')) {
            if (req.method === 'GET') {
                const { category, search, limit = '100' } = req.query
                const where: any = {}
                if (category) where.category = category
                if (search) where.OR = [{ name: { contains: search as string, mode: 'insensitive' } }, { sku: { contains: search as string, mode: 'insensitive' } }]
                const resources = await prisma.resource.findMany({ where, orderBy: { createdAt: 'desc' }, take: Number(limit) })
                return res.json(resources)
            }
            if (req.method === 'POST') {
                const body = createResourceSchema.parse(req.body)
                const resource = await prisma.resource.create({ data: { ...body, unitType: body.unitType || 'each', hazardous: body.hazardous || false, perishable: body.perishable || false } })
                return res.status(201).json(resource)
            }
            return methodNotAllowed(res, ['GET', 'POST'])
        }

        // Distributions
        if (url.includes('/distributions')) {
            if (req.method === 'GET') {
                const { status, disasterId, limit = '100' } = req.query
                const where: any = {}
                if (status) where.status = status
                if (disasterId) where.disasterId = disasterId
                const distributions = await prisma.distribution.findMany({ where, include: { disaster: { select: { name: true } }, location: { select: { name: true } }, items: { include: { resource: { select: { name: true, category: true } } } } }, orderBy: { createdAt: 'desc' }, take: Number(limit) })
                return res.json(distributions)
            }
            if (req.method === 'POST') {
                const body = createDistributionSchema.parse(req.body)
                const { items, ...distributionData } = body
                const distribution = await prisma.distribution.create({ data: { ...distributionData, status: body.status || 'PLANNED', scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null, createdById: authUser.id, quantityDistributed: 0, items: items ? { create: items.map(item => ({ resourceId: item.resourceId, quantity: item.quantity, quantityDistributed: 0 })) } : undefined }, include: { items: { include: { resource: true } } } })
                return res.status(201).json(distribution)
            }
            return methodNotAllowed(res, ['GET', 'POST'])
        }

        // Break Glass
        if (url.includes('/break-glass')) {
            if (req.method === 'GET') {
                const events = await prisma.breakGlassEvent.findMany({ where: { userId: authUser.id }, orderBy: { grantedAt: 'desc' }, take: 20 })
                return res.json(events)
            }
            if (req.method === 'POST') {
                const body = breakGlassSchema.parse(req.body)
                const user = await prisma.user.findUnique({ where: { id: authUser.id }, select: { breakGlassAccess: true } })
                if (!user?.breakGlassAccess) return res.status(403).json({ error: 'No break glass access' })
                const expiresAt = new Date()
                expiresAt.setHours(expiresAt.getHours() + (body.duration || 4))
                const event = await prisma.breakGlassEvent.create({ data: { userId: authUser.id, reason: body.reason, expiresAt, used: false } })
                await prisma.auditLog.create({ data: { action: 'BREAK_GLASS_ACTIVATED', entity: 'BreakGlassEvent', entityId: event.id, details: { reason: body.reason, expiresAt: expiresAt.toISOString() } } })
                return res.status(201).json({ ...event, message: 'Break glass access granted. Use before it expires.' })
            }
            return methodNotAllowed(res, ['GET', 'POST'])
        }

        // Alerts
        if (url.includes('/alerts/disaster')) {
            if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
            const { disasterId } = req.body
            const disaster = await prisma.disaster.findUnique({ where: { id: disasterId } })
            if (!disaster) return res.status(404).json({ error: 'Disaster not found' })
            const volunteers = await prisma.volunteer.findMany({ where: { status: 'AVAILABLE', currentLat: { not: null }, currentLng: { not: null } }, include: { user: { select: { email: true, phone: true, fullName: true } } } })
            return res.json({ disaster, alertedVolunteers: volunteers.length, volunteers })
        }

        return res.status(404).json({ error: 'Not found' })
    } catch (error) {
        return handleHttpError(res, error)
    }
}
