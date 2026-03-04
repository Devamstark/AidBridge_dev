import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash password
  const password = 'password'
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aidbridge.org' },
    update: {},
    create: {
      email: 'admin@aidbridge.org',
      passwordHash: hashedPassword,
      fullName: 'System Administrator',
      phone: '+1-555-0001',
      role: 'ADMIN',
      language: 'en',
      fontSize: 'MEDIUM',
      contrast: 'STANDARD',
      theme: 'LIGHT',
      emailVerified: new Date(),
      isActive: true,
    },
  })
  console.log('✅ Created Admin:', admin.email)

  // Create Coordinator User
  const coordinator = await prisma.user.upsert({
    where: { email: 'coordinator@aidbridge.org' },
    update: {},
    create: {
      email: 'coordinator@aidbridge.org',
      passwordHash: hashedPassword,
      fullName: 'Disaster Coordinator',
      phone: '+1-555-0002',
      role: 'COORDINATOR',
      language: 'en',
      fontSize: 'MEDIUM',
      contrast: 'STANDARD',
      theme: 'LIGHT',
      emailVerified: new Date(),
      isActive: true,
    },
  })
  console.log('✅ Created Coordinator:', coordinator.email)

  // Create Volunteer User
  const volunteer = await prisma.user.upsert({
    where: { email: 'volunteer@aidbridge.org' },
    update: {},
    create: {
      email: 'volunteer@aidbridge.org',
      passwordHash: hashedPassword,
      fullName: 'Field Volunteer',
      phone: '+1-555-0003',
      role: 'VOLUNTEER',
      language: 'en',
      fontSize: 'MEDIUM',
      contrast: 'STANDARD',
      theme: 'LIGHT',
      emailVerified: new Date(),
      isActive: true,
    },
  })
  console.log('✅ Created Volunteer:', volunteer.email)

  // Create Volunteer Profile for the volunteer user
  await prisma.volunteer.upsert({
    where: { userId: volunteer.id },
    update: {},
    create: {
      userId: volunteer.id,
      status: 'AVAILABLE',
      skills: ['First Aid', 'Search & Rescue', 'Communication'],
      certifications: ['CPR', 'Emergency Response'],
      totalMissions: 0,
      hoursVolunteered: 0,
    },
  })
  console.log('✅ Created Volunteer Profile')

  console.log('🎉 Seeding completed!')
  console.log('')
  console.log('📋 Login Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin:       admin@aidbridge.org / password')
  console.log('Coordinator: coordinator@aidbridge.org / password')
  console.log('Volunteer:   volunteer@aidbridge.org / password')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
