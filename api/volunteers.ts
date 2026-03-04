import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/db.js'
import { requireAuth } from './_lib/auth.js'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { handleHttpError, methodNotAllowed } from './_lib/utils.js'

const createVolunteerSchema = z.object({
    userId: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    skills: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
    availability: z.any().optional(),
    emergencyContact: z.any().optional(),
})

const updateVolunteerSchema = z.object({
    status: z.string().optional(),
    skills: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
    availability: z.any().optional(),
    emergencyContact: z.any().optional(),
    currentLat: z.number().optional(),
    currentLng: z.number().optional(),
    totalMissions: z.number().optional(),
    hoursVolunteered: z.number().optional(),
    rating: z.number().optional(),
})

const statusCheckSchema = z.object({
    volunteerId: z.string(),
    status: z.string(),
    location: z.object({ lat: z.number(), lng: z.number(), accuracy: z.number().optional() }).optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        await requireAuth(req)
        const url = req.url || ''
        const id = req.query.id as string

        // status-check functionality
        if (url.includes('/status-check')) {
            if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
            const body = statusCheckSchema.parse(req.body)
            const updateData: any = { status: body.status }
            if (body.location) {
                updateData.currentLat = body.location.lat
                updateData.currentLng = body.location.lng
                updateData.lastLocationUpdate = new Date()
            }
            const volunteer = await prisma.volunteer.update({ where: { id: body.volunteerId }, data: updateData, include: { user: { select: { fullName: true, email: true } } } })
            if (body.location) {
                await prisma.volunteerLocationHistory.create({ data: { volunteerId: body.volunteerId, lat: body.location.lat, lng: body.location.lng, accuracy: body.location.accuracy } })
            }
            return res.json(volunteer)
        }

        // [id].ts functionality
        if (id) {
            if (req.method === 'GET') {
                const volunteer = await prisma.volunteer.findUnique({ where: { id }, include: { user: { select: { fullName: true, email: true, phone: true, role: true } }, missions: { take: 10, orderBy: { assignedAt: 'desc' } } } })
                if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' })
                return res.json(volunteer)
            }
            if (req.method === 'PUT') {
                const body = updateVolunteerSchema.parse(req.body)
                const volunteer = await prisma.volunteer.update({ where: { id: id as string }, data: body, include: { user: { select: { fullName: true, email: true, role: true } } } })
                return res.json(volunteer)
            }
            if (req.method === 'DELETE') {
                await prisma.volunteer.delete({ where: { id: id as string } })
                return res.status(204).end()
            }
            return methodNotAllowed(res, ['GET', 'PUT', 'DELETE'])
        }

        // index.ts functionality
        if (req.method === 'GET') {
            const { status, limit = '100' } = req.query
            const volunteers = await prisma.volunteer.findMany({ where: status ? { status: status as string } : {}, include: { user: { select: { fullName: true, email: true, phone: true } } }, orderBy: { createdAt: 'desc' }, take: Number(limit) })
            return res.json(volunteers)
        }
        if (req.method === 'POST') {
            const body = createVolunteerSchema.parse(req.body)
            let userId = body.userId

            if (!userId) {
                // Create a user if they don't exist
                const email = body.email || `volunteer-${Date.now()}@aidbridge.org`
                const user = await prisma.user.create({
                    data: {
                        email,
                        fullName: `${body.firstName || 'New'} ${body.lastName || 'Volunteer'}`.trim(),
                        phone: body.phone,
                        role: 'VOLUNTEER',
                        passwordHash: await bcrypt.hash('temporary-password', 10)
                    }
                })
                userId = user.id
            }

            const volunteer = await prisma.volunteer.create({
                data: {
                    userId,
                    skills: body.skills || [],
                    certifications: body.certifications || [],
                    status: 'AVAILABLE'
                },
                include: { user: { select: { fullName: true, email: true, role: true } } }
            })
            return res.status(201).json(volunteer)
        }
        return methodNotAllowed(res, ['GET', 'POST'])
    } catch (error) {
        return handleHttpError(res, error)
    }
}
