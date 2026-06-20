import type { Property, Room, Tenant, Rental, RentalTerm } from '@/types'

export function nextPropertyId(properties: Property[]): string {
  if (properties.length === 0) return 'PROP-0001'
  const nums = properties.map(p => parseInt(p.id.replace('PROP-', ''), 10))
  const next = Math.max(...nums) + 1
  return 'PROP-' + String(next).padStart(4, '0')
}

export function nextRoomId(rooms: Room[]): string {
  if (rooms.length === 0) return 'ROOM-0001'
  const nums = rooms.map(r => parseInt(r.id.replace('ROOM-', ''), 10))
  const next = Math.max(...nums) + 1
  return 'ROOM-' + String(next).padStart(4, '0')
}

export function nextTenantId(tenants: Tenant[]): string {
  if (tenants.length === 0) return 'TEN-0001'
  const nums = tenants.map(t => parseInt(t.id.replace('TEN-', ''), 10))
  const next = Math.max(...nums) + 1
  return 'TEN-' + String(next).padStart(4, '0')
}

export function nextRentalId(rentals: Rental[]): string {
  if (rentals.length === 0) return 'RENT-0001'
  const nums = rentals.map(r => parseInt(r.id.replace('RENT-', ''), 10))
  return 'RENT-' + String(Math.max(...nums) + 1).padStart(4, '0')
}

export function nextRentalTermIds(terms: RentalTerm[], count: number): string[] {
  const base = terms.length === 0
    ? 1
    : Math.max(...terms.map(t => parseInt(t.id.replace('TERM-', ''), 10))) + 1
  return Array.from({ length: count }, (_, i) => 'TERM-' + String(base + i).padStart(4, '0'))
}
