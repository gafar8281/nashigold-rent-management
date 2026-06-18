import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useData } from '@/context/DataContext'
import { formatDate } from '@/lib/formatters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import TablePagination from '@/components/shared/TablePagination'

const PAGE_SIZE = 50

const TYPE_COLORS: Record<string, string> = {
  Apartment: 'bg-blue-100 text-blue-700',
  Building:  'bg-purple-100 text-purple-700',
  Villa:     'bg-green-100 text-green-700',
  Office:    'bg-orange-100 text-orange-700',
}

type Tab = 'properties' | 'rooms' | 'tenants'

export default function ReportsPage() {
  const { t } = useTranslation()
  const { properties, rooms, tenants } = useData()
  const [activeTab, setActiveTab] = useState<Tab>('properties')
  const [propPage, setPropPage] = useState(1)
  const [roomPage, setRoomPage] = useState(1)
  const [tenantPage, setTenantPage] = useState(1)

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'properties', label: t('reports.properties'), count: properties.length },
    { id: 'rooms',      label: t('reports.rooms'),      count: rooms.length },
    { id: 'tenants',    label: t('reports.tenants'),     count: tenants.length },
  ]

  // Properties tab
  const propPages = Math.max(1, Math.ceil(properties.length / PAGE_SIZE))
  const propRows = properties.slice((propPage - 1) * PAGE_SIZE, propPage * PAGE_SIZE)
  function roomCount(pid: string) { return rooms.filter(r => r.propertyId === pid).length }

  // Rooms tab
  const roomPages = Math.max(1, Math.ceil(rooms.length / PAGE_SIZE))
  const roomRows = rooms.slice((roomPage - 1) * PAGE_SIZE, roomPage * PAGE_SIZE)
  function propertyName(pid: string) {
    return properties.find(p => p.id === pid)?.propertyName ?? pid
  }

  // Tenants tab
  const tenantPages = Math.max(1, Math.ceil(tenants.length / PAGE_SIZE))
  const tenantRows = tenants.slice((tenantPage - 1) * PAGE_SIZE, tenantPage * PAGE_SIZE)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('reports.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('reports.subtitle')}</p>
      </div>

      {/* Tab bar */}
      <div className="overflow-x-auto border-b">
        <div className="flex gap-0 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              <span className="ms-2 rounded-full bg-muted px-2 py-0.5 text-xs">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Properties tab */}
      {activeTab === 'properties' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('reports.properties')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.propertyId')}</TableHead>
                  <TableHead>{t('table.propertyName')}</TableHead>
                  <TableHead>{t('table.propertyType')}</TableHead>
                  <TableHead>{t('table.address')}</TableHead>
                  <TableHead>{t('table.rooms')}</TableHead>
                  <TableHead>{t('table.created')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {propRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">{t('reports.noProperties')}</TableCell>
                  </TableRow>
                ) : (
                  propRows.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">
                        <Link to={`/properties/${p.id}`} className="text-amber-600 hover:underline">{p.id}</Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/properties/${p.id}`} className="font-medium hover:underline">{p.propertyName}</Link>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[p.propertyType] ?? ''}`}>
                          {t(`properties.types.${p.propertyType}`)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">{p.address}</TableCell>
                      <TableCell className="text-sm">
                        {(p.propertyType === 'Apartment' || p.propertyType === 'Building') ? roomCount(p.id) : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(p.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              page={propPage} totalPages={propPages}
              totalItems={properties.length}
              pageSize={PAGE_SIZE}
              onPrev={() => setPropPage(p => Math.max(1, p - 1))}
              onNext={() => setPropPage(p => Math.min(propPages, p + 1))}
            />
          </CardContent>
        </Card>
      )}

      {/* Rooms tab */}
      {activeTab === 'rooms' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('reports.rooms')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.roomId')}</TableHead>
                  <TableHead>{t('table.propertyName')}</TableHead>
                  <TableHead>{t('table.roomType')}</TableHead>
                  <TableHead>{t('table.created')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">{t('reports.noRooms')}</TableCell>
                  </TableRow>
                ) : (
                  roomRows.map(room => (
                    <TableRow key={room.id}>
                      <TableCell className="font-mono text-sm">{room.id}</TableCell>
                      <TableCell>
                        <Link to={`/properties/${room.propertyId}`} className="hover:underline text-sm">
                          {propertyName(room.propertyId)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${room.roomType === 'Family' ? 'bg-green-100 text-green-700' : 'bg-sky-100 text-sky-700'}`}>
                          {t(`rooms.types.${room.roomType}`)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(room.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              page={roomPage} totalPages={roomPages}
              totalItems={rooms.length}
              pageSize={PAGE_SIZE}
              onPrev={() => setRoomPage(p => Math.max(1, p - 1))}
              onNext={() => setRoomPage(p => Math.min(roomPages, p + 1))}
            />
          </CardContent>
        </Card>
      )}

      {/* Tenants tab */}
      {activeTab === 'tenants' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('reports.tenants')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.tenantId')}</TableHead>
                  <TableHead>{t('table.fullName')}</TableHead>
                  <TableHead>{t('table.email')}</TableHead>
                  <TableHead>{t('table.phoneNumber')}</TableHead>
                  <TableHead>{t('table.nationalId')}</TableHead>
                  <TableHead>{t('table.address')}</TableHead>
                  <TableHead>{t('table.created')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenantRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-6">{t('reports.noTenants')}</TableCell>
                  </TableRow>
                ) : (
                  tenantRows.map(ten => (
                    <TableRow key={ten.id}>
                      <TableCell className="font-mono text-sm">
                        <Link to={`/tenants/${ten.id}`} className="text-amber-600 hover:underline">{ten.id}</Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/tenants/${ten.id}`} className="font-medium hover:underline">{ten.fullName}</Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{ten.email || '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{ten.phoneNumber}</TableCell>
                      <TableCell className="font-mono text-sm">{ten.nationalId}</TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[180px] truncate">{ten.address}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(ten.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              page={tenantPage} totalPages={tenantPages}
              totalItems={tenants.length}
              pageSize={PAGE_SIZE}
              onPrev={() => setTenantPage(p => Math.max(1, p - 1))}
              onNext={() => setTenantPage(p => Math.min(tenantPages, p + 1))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
