import { PrismaClient } from './generated/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding E2E test data...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.stayExtension.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.serviceItem.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.room.deleteMany();
  await prisma.device.deleteMany();
  await prisma.user.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.hotel.deleteMany();

  // Create admin user
  const adminHash = await bcrypt.hash('AdminPassword123!', 10);
  await prisma.user.create({
    data: {
      email: 'admin@zuroy.com',
      passwordHash: adminHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
    },
  });

  // Create test hotel
  const hotel = await prisma.hotel.create({
    data: {
      name: 'Test Beach Resort',
      slug: 'test-beach-resort',
      address: '123 Ocean Drive',
      primaryColor: '#0d7377',
      secondaryColor: '#d97706',
      hotspotDataCapMb: 5000,
    },
  });

  // Create staff user assigned to hotel
  const staffHash = await bcrypt.hash('StaffPassword123!', 10);
  await prisma.user.create({
    data: {
      email: 'staff@testhotel.com',
      passwordHash: staffHash,
      firstName: 'Staff',
      lastName: 'User',
      role: 'HOTEL_STAFF',
      hotelId: hotel.id,
    },
  });

  console.log(`Seeded: admin user, hotel "${hotel.name}" (${hotel.id}), staff user`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
