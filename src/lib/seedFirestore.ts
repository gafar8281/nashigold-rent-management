import type { Property, Room, Tenant, Rental } from '@/types'
import { propertyService } from '@/services/propertyService'
import { roomService } from '@/services/roomService'
import { tenantService } from '@/services/tenantService'
import { rentalService } from '@/services/rentalService'

const seedProperties: Property[] = [
  { id: 'PROP-0001', propertyType: 'Apartment', propertyName: 'Al-Noor Apartments',    address: '12 King Fahd Road, Riyadh',           createdAt: '2024-01-10' },
  { id: 'PROP-0002', propertyType: 'Building',  propertyName: 'Al-Faris Building',     address: '45 Prince Sultan St, Jeddah',         createdAt: '2024-02-05' },
  { id: 'PROP-0003', propertyType: 'Villa',     propertyName: 'Al-Riyad Villa',        address: '8 Al-Malaz District, Riyadh',         createdAt: '2024-03-12' },
  { id: 'PROP-0004', propertyType: 'Office',    propertyName: 'Madinah Business Hub',  address: '22 Al-Haram Road, Madinah',           createdAt: '2024-04-20' },
  { id: 'PROP-0005', propertyType: 'Apartment', propertyName: 'Salam Residences',      address: '99 Olaya Street, Riyadh',             createdAt: '2024-05-15' },
]

const seedRooms: Room[] = [
  { id: 'ROOM-0001', propertyId: 'PROP-0001', roomType: 'Bachelor', createdAt: '2024-01-15' },
  { id: 'ROOM-0002', propertyId: 'PROP-0001', roomType: 'Family',   createdAt: '2024-01-15' },
  { id: 'ROOM-0003', propertyId: 'PROP-0001', roomType: 'Family',   createdAt: '2024-01-20' },
  { id: 'ROOM-0004', propertyId: 'PROP-0001', roomType: 'Bachelor', createdAt: '2024-02-01' },
  { id: 'ROOM-0005', propertyId: 'PROP-0002', roomType: 'Bachelor', createdAt: '2024-02-10' },
  { id: 'ROOM-0006', propertyId: 'PROP-0002', roomType: 'Family',   createdAt: '2024-02-10' },
  { id: 'ROOM-0007', propertyId: 'PROP-0002', roomType: 'Bachelor', createdAt: '2024-02-15' },
  { id: 'ROOM-0008', propertyId: 'PROP-0005', roomType: 'Family',   createdAt: '2024-05-20' },
]

const seedTenants: Tenant[] = [
  { id: 'TEN-0001', fullName: 'Ahmad Al-Rashidi',   email: 'ahmad.rashidi@email.com',   phoneNumber: '0501112233', nationalId: '1023456789', address: '12 King Fahd Road, Riyadh',     employmentInfo: 'Software Engineer at SABIC',       createdAt: '2024-02-01' },
  { id: 'TEN-0002', fullName: 'Fatimah Al-Zahrani', email: 'fatimah.zahrani@email.com', phoneNumber: '0502223344', nationalId: '1034567890', address: '45 Prince Sultan St, Jeddah',   employmentInfo: 'Teacher at Al-Noor School',        createdAt: '2024-02-15' },
  { id: 'TEN-0003', fullName: 'Khalid Al-Otaibi',   email: 'khalid.otaibi@email.com',   phoneNumber: '0503334455', nationalId: '1045678901', address: '8 Al-Malaz District, Riyadh',   employmentInfo: 'Manager at Al-Rajhi Bank',         createdAt: '2024-03-10' },
  { id: 'TEN-0004', fullName: 'Nora Al-Qahtani',    email: 'nora.qahtani@email.com',    phoneNumber: '0504445566', nationalId: '1056789012', address: '22 Al-Haram Road, Madinah',     employmentInfo: 'Doctor at King Fahd Hospital',     createdAt: '2024-04-05' },
  { id: 'TEN-0005', fullName: 'Saad Al-Ghamdi',     email: 'saad.ghamdi@email.com',     phoneNumber: '0505556677', nationalId: '1067890123', address: '99 Olaya Street, Riyadh',       employmentInfo: 'Accountant at PetroRabigh',        createdAt: '2024-05-01' },
  { id: 'TEN-0006', fullName: 'Maryam Al-Shehri',   email: 'maryam.shehri@email.com',   phoneNumber: '0506667788', nationalId: '1078901234', address: '5 Al-Andalus District, Jeddah', employmentInfo: 'Architect at SaudiOger Projects',  createdAt: '2024-06-10' },
]

const seedRentals: Rental[] = [
  {
    id: 'RENT-0001',
    tenantId: 'TEN-0001',
    propertyId: 'PROP-0001',
    roomId: 'ROOM-0001',
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    rentalTermMonths: 11,
    billingCycle: 'Monthly',
    rentAmount: 1500,
    createdAt: '2024-02-01',
  },
  {
    id: 'RENT-0002',
    tenantId: 'TEN-0002',
    propertyId: 'PROP-0002',
    roomId: 'ROOM-0005',
    startDate: '2024-06-01',
    endDate: '2026-12-31',
    rentalTermMonths: 30,
    billingCycle: 'Quarterly',
    rentAmount: 4500,
    createdAt: '2024-06-01',
  },
  {
    id: 'RENT-0003',
    tenantId: 'TEN-0003',
    propertyId: 'PROP-0003',
    startDate: '2025-04-01',
    endDate: '2027-03-31',
    rentalTermMonths: 23,
    billingCycle: 'Yearly',
    rentAmount: 60000,
    createdAt: '2025-04-01',
  },
]

async function seedCollection<T extends { id: string }>(
  service: { exists: () => Promise<boolean>; setDoc: (id: string, data: T) => Promise<void> },
  records: T[],
): Promise<void> {
  if (await service.exists()) return
  for (const record of records) {
    await service.setDoc(record.id, record)
  }
}

export async function seedFirestore(): Promise<void> {
  await Promise.all([
    seedCollection(propertyService, seedProperties),
    seedCollection(roomService, seedRooms),
    seedCollection(tenantService, seedTenants),
    seedCollection(rentalService, seedRentals),
  ])
}
