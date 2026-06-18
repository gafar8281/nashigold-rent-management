/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { Property, Room, Tenant, Rental } from '@/types'
import { nextPropertyId, nextRoomId, nextTenantId, nextRentalId } from '@/lib/idGen'
import { todayISO } from '@/lib/formatters'
import { propertyService } from '@/services/propertyService'
import { roomService } from '@/services/roomService'
import { tenantService } from '@/services/tenantService'
import { rentalService } from '@/services/rentalService'

interface DataContextValue {
  properties: Property[]
  rooms: Room[]
  tenants: Tenant[]
  loading: boolean
  error: string | null

  addProperty: (data: Omit<Property, 'id' | 'createdAt'>) => Promise<Property>
  updateProperty: (id: string, data: Partial<Property>) => Promise<void>
  deleteProperty: (id: string) => Promise<void>

  addRoom: (data: Omit<Room, 'id' | 'createdAt'>) => Promise<Room>
  updateRoom: (id: string, data: Partial<Room>) => Promise<void>
  deleteRoom: (id: string) => Promise<void>
  getRoomsByPropertyId: (propertyId: string) => Room[]

  addTenant: (data: Omit<Tenant, 'id' | 'createdAt'>) => Promise<Tenant>
  updateTenant: (id: string, data: Partial<Tenant>) => Promise<void>
  deleteTenant: (id: string) => Promise<void>

  rentals: Rental[]
  addRental: (data: Omit<Rental, 'id' | 'createdAt'>) => Promise<Rental>
  updateRental: (id: string, data: Partial<Rental>) => Promise<void>
  deleteRental: (id: string) => Promise<void>
  getRentalsByTenantId: (tenantId: string) => Rental[]
  getRentalsByPropertyId: (propertyId: string) => Rental[]

  getRentalById: (id: string) => Rental | undefined
  getPropertyById: (id: string) => Property | undefined
  getTenantById: (id: string) => Tenant | undefined
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const propertiesRef = useRef(properties)
  const roomsRef = useRef(rooms)
  const tenantsRef = useRef(tenants)
  const rentalsRef = useRef(rentals)

  useEffect(() => {
    let cancelled = false
    let propertiesLoaded = false
    let roomsLoaded = false
    let tenantsLoaded = false
    let rentalsLoaded = false

    function markLoaded() {
      if (propertiesLoaded && roomsLoaded && tenantsLoaded && rentalsLoaded && !cancelled) setLoading(false)
    }

    function handleError(err: Error) {
      if (cancelled) return
      setError(err.message || 'Failed to load data.')
      setLoading(false)
    }

    const unsubProperties = propertyService.subscribe(items => {
      if (cancelled) return
      propertiesRef.current = items
      setProperties(items)
      propertiesLoaded = true
      markLoaded()
    }, handleError)

    const unsubRooms = roomService.subscribe(items => {
      if (cancelled) return
      roomsRef.current = items
      setRooms(items)
      roomsLoaded = true
      markLoaded()
    }, handleError)

    const unsubTenants = tenantService.subscribe(items => {
      if (cancelled) return
      tenantsRef.current = items
      setTenants(items)
      tenantsLoaded = true
      markLoaded()
    }, handleError)

    const unsubRentals = rentalService.subscribe(items => {
      if (cancelled) return
      rentalsRef.current = items
      setRentals(items)
      rentalsLoaded = true
      markLoaded()
    }, handleError)

    return () => {
      cancelled = true
      unsubProperties()
      unsubRooms()
      unsubTenants()
      unsubRentals()
    }
  }, [])

  async function addProperty(data: Omit<Property, 'id' | 'createdAt'>): Promise<Property> {
    const newProperty: Property = {
      ...data,
      id: nextPropertyId(propertiesRef.current),
      createdAt: todayISO(),
    }
    await propertyService.setDoc(newProperty.id, newProperty)
    return newProperty
  }

  async function updateProperty(id: string, data: Partial<Property>): Promise<void> {
    await propertyService.update(id, data)
  }

  async function deleteProperty(id: string): Promise<void> {
    // Cascade-delete all rooms belonging to this property
    const relatedRooms = roomsRef.current.filter(r => r.propertyId === id)
    for (const room of relatedRooms) {
      await roomService.delete(room.id)
    }
    await propertyService.delete(id)
  }

  async function addRoom(data: Omit<Room, 'id' | 'createdAt'>): Promise<Room> {
    const newRoom: Room = {
      ...data,
      id: nextRoomId(roomsRef.current),
      createdAt: todayISO(),
    }
    await roomService.setDoc(newRoom.id, newRoom)
    return newRoom
  }

  async function updateRoom(id: string, data: Partial<Room>): Promise<void> {
    await roomService.update(id, data)
  }

  async function deleteRoom(id: string): Promise<void> {
    await roomService.delete(id)
  }

  function getRoomsByPropertyId(propertyId: string): Room[] {
    return rooms.filter(r => r.propertyId === propertyId)
  }

  async function addTenant(data: Omit<Tenant, 'id' | 'createdAt'>): Promise<Tenant> {
    const newTenant: Tenant = {
      ...data,
      id: nextTenantId(tenantsRef.current),
      createdAt: todayISO(),
    }
    await tenantService.setDoc(newTenant.id, newTenant)
    return newTenant
  }

  async function updateTenant(id: string, data: Partial<Tenant>): Promise<void> {
    await tenantService.update(id, data)
  }

  async function deleteTenant(id: string): Promise<void> {
    await tenantService.delete(id)
  }

  async function addRental(data: Omit<Rental, 'id' | 'createdAt'>): Promise<Rental> {
    const newRental: Rental = {
      ...data,
      id: nextRentalId(rentalsRef.current),
      createdAt: todayISO(),
    }
    await rentalService.setDoc(newRental.id, newRental)
    return newRental
  }

  async function updateRental(id: string, data: Partial<Rental>): Promise<void> {
    await rentalService.update(id, data)
  }

  async function deleteRental(id: string): Promise<void> {
    await rentalService.delete(id)
  }

  function getRentalsByTenantId(tenantId: string): Rental[] {
    return rentals.filter(r => r.tenantId === tenantId)
  }

  function getRentalsByPropertyId(propertyId: string): Rental[] {
    return rentals.filter(r => r.propertyId === propertyId)
  }

  function getRentalById(id: string): Rental | undefined {
    return rentals.find(r => r.id === id)
  }

  function getPropertyById(id: string): Property | undefined {
    return properties.find(p => p.id === id)
  }

  function getTenantById(id: string): Tenant | undefined {
    return tenants.find(t => t.id === id)
  }

  return (
    <DataContext.Provider value={{
      properties,
      rooms,
      tenants,
      rentals,
      loading,
      error,
      addProperty,
      updateProperty,
      deleteProperty,
      addRoom,
      updateRoom,
      deleteRoom,
      getRoomsByPropertyId,
      addTenant,
      updateTenant,
      deleteTenant,
      addRental,
      updateRental,
      deleteRental,
      getRentalsByTenantId,
      getRentalsByPropertyId,
      getRentalById,
      getPropertyById,
      getTenantById,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
