import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useData } from '@/context/DataContext'
import { splitRentalTerm } from '@/lib/calculations'
import { formatCurrency, todayISO } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import TablePagination from '@/components/shared/TablePagination'
import AddRentalDialog from '@/components/rentals/AddRentalDialog'

const PAGE_SIZE = 50

function formatDuration(totalMonths: number, t: (k: string) => string): string {
  if (totalMonths <= 0) return `0 ${t('common.months')}`
  const { years, months } = splitRentalTerm(totalMonths)
  const parts: string[] = []
  if (years > 0) parts.push(`${years} ${t(years === 1 ? 'common.year' : 'common.years')}`)
  if (months > 0) parts.push(`${months} ${t(months === 1 ? 'common.month' : 'common.months')}`)
  return parts.join(' ')
}

export default function RentalsPage() {
  const { t } = useTranslation()
  const { rentals, tenants, properties, rooms } = useData()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)

  const today = todayISO()

  const tenantMap = useMemo(() => Object.fromEntries(tenants.map(t => [t.id, t])), [tenants])
  const propertyMap = useMemo(() => Object.fromEntries(properties.map(p => [p.id, p])), [properties])
  const roomMap = useMemo(() => Object.fromEntries(rooms.map(r => [r.id, r])), [rooms])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return rentals.filter(r => {
      if (!q) return true
      const tenant = tenantMap[r.tenantId]
      const property = propertyMap[r.propertyId]
      const status = today > r.endDate ? 'expired' : 'active'
      return (
        r.id.toLowerCase().includes(q) ||
        (tenant?.fullName.toLowerCase().includes(q) ?? false) ||
        (property?.propertyName.toLowerCase().includes(q) ?? false) ||
        r.billingCycle.toLowerCase().includes(q) ||
        status.includes(q)
      )
    })
  }, [rentals, search, tenantMap, propertyMap, today])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('rentals.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('rentals.subtitle', { count: rentals.length })}
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>{t('rentals.addRental')}</Button>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder={t('rentals.searchPlaceholder')}
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <div className="px-4 py-3 border-b">
          <h2 className="font-medium text-sm">{t('rentals.allRentals')}</h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.rentalId')}</TableHead>
              <TableHead>{t('table.tenant')}</TableHead>
              <TableHead>{t('table.property')}</TableHead>
              <TableHead>{t('table.room')}</TableHead>
              <TableHead>{t('table.duration')}</TableHead>
              <TableHead>{t('table.rentAmount')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  {t('rentals.noFound')}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(rental => {
                const tenant = tenantMap[rental.tenantId]
                const property = propertyMap[rental.propertyId]
                const room = rental.roomId ? roomMap[rental.roomId] : null
                const isExpired = today > rental.endDate

                return (
                  <TableRow key={rental.id}>
                    <TableCell>
                      <Link to={`/rentals/${rental.id}`} className="text-amber-600 hover:underline font-mono text-xs">
                        {rental.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{tenant?.fullName ?? rental.tenantId}</div>
                      <div className="text-xs text-muted-foreground">{rental.tenantId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{property?.propertyName ?? rental.propertyId}</div>
                      <div className="text-xs text-muted-foreground">{property?.propertyType}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {room ? (
                        <span>{room.id} <span className="text-muted-foreground text-xs">({room.roomType})</span></span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{formatDuration(rental.rentalTermMonths, t)}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(rental.rentAmount)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          isExpired
                            ? 'bg-red-100 text-red-700 hover:bg-red-100'
                            : 'bg-green-100 text-green-700 hover:bg-green-100'
                        }
                      >
                        {isExpired ? t('rentals.statusExpired') : t('rentals.statusActive')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        <TablePagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPrev={() => setPage(p => Math.max(1, p - 1))}
          onNext={() => setPage(p => Math.min(totalPages, p + 1))}
        />
      </div>

      <AddRentalDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
