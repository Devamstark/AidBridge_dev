import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/db.js'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { z } from 'zod'
import { handleHttpError, methodNotAllowed } from './_lib/utils.js'
import { getUserFromToken, requireAuth } from './_lib/auth.js'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

const updateProfileSchema = z.object({
    fullName: z.string().min(1).optional(),
    phone: z.string().optional(),
    language: z.string().optional(),
    fontSize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'XLARGE']).optional(),
    contrast: z.enum(['STANDARD', 'ENHANCED', 'HIGH']).optional(),
    theme: z.enum(['LIGHT', 'DARK']).optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const url = req.url || ''

    try {
        if (url.includes('/auth/login')) {
            if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
            const body = loginSchema.parse(req.body)
            const user = await prisma.user.findUnique({ where: { email: body.email } })
            if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' })
            const isCorrectPassword = await bcrypt.compare(body.password, user.passwordHash)
            if (!isCorrectPassword) return res.status(401).json({ error: 'Invalid credentials' })
            await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-min-32-chars')
            const token = await new SignJWT({ sub: user.id, email: user.email, role: user.role })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('7d')
                .sign(secret)
            return res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } })
        }

        if (url.includes('/auth/me')) {
            if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])
            const token = req.headers.authorization?.replace('Bearer ', '')
            const user = await getUserFromToken(token)
            if (!user) return res.status(401).json({ error: 'Unauthorized' })
            const fullUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { id: true, email: true, fullName: true, phone: true, role: true, language: true, fontSize: true, contrast: true, theme: true, image: true, breakGlassAccess: true, createdAt: true }
            })
            return res.json(fullUser)
        }

        if (url.includes('/auth/update')) {
            if (req.method !== 'PUT') return methodNotAllowed(res, ['PUT'])
            const authUser = await requireAuth(req)
            const body = updateProfileSchema.parse(req.body)
            const updatedUser = await prisma.user.update({
                where: { id: authUser.id },
                data: body,
                select: { id: true, email: true, fullName: true, phone: true, role: true, language: true, fontSize: true, contrast: true, theme: true, image: true, breakGlassAccess: true }
            })
            return res.json(updatedUser)
        }

        return res.status(404).json({ error: 'Not found' })
    } catch (error) {
        return handleHttpError(res, error)
    }
}
