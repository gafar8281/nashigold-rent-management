export type PropertyType = 'Apartment' | 'Building' | 'Villa' | 'Office'
export type RoomType = 'Bachelor' | 'Family'

export interface Property {
  id: string
  propertyType: PropertyType
  propertyName: string
  address: string
  createdAt: string
}

export interface Room {
  id: string
  propertyId: string
  roomType: RoomType
  createdAt: string
}

export interface Tenant {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  nationalId: string
  address: string
  employmentInfo: string
  createdAt: string
}

export type BillingCycle = 'Monthly' | 'Quarterly' | 'Yearly'

export interface Rental {
  id: string
  tenantId: string
  propertyId: string
  roomId?: string
  startDate: string
  endDate: string
  rentalTermMonths: number
  billingCycle: BillingCycle
  rentAmount: number
  createdAt: string
}

export type UserRole = 'admin'

export interface AppUser {
  uid: string
  username: string
  email: string
  role: UserRole
  isActive: boolean
}
