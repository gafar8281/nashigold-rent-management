import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useData } from '@/context/DataContext'
import { formatCurrency, formatDate, todayISO } from '@/lib/formatters'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import TablePagination from '@/components/shared/TablePagination'

const PAGE_SIZE = 50

export default function OverdueRentalsPage() {
  const { t } = useTranslation()
  const { rentalTerms, rentals, tenants, properties, rooms } = useData()
  const [page, setPage] = useState(1)

  const today = todayISO()

  const tenantMap   = useMemo(() => Object.fromEntries(tenants.map(tn => [tn.id, tn])), [tenants])
  const propertyMap = useMemo(() => Object.fromEntries(properties.map(p => [p.id, p])), [properties])
  const roomMap     = useMemo(() => Object.fromEntries(rooms.map(r => [r.id, r])), [rooms])
  const rentalMap   = useMemo(() => Object.fromEntries(rentals.map(r => [r.id, r])), [rentals])

  const overdueTerms = useMemo(() => {
    return rentalTerms
      .filter(term => term.status === 'Pending' && term.dueDate < today)
      .map(term => {
        const rental = rentalMap[term.rentalId]
        return {
          term,
          rental,
          tenant: rental ? tenantMap[rental.tenantId] : undefined,
          property: rental ? propertyMap[rental.propertyId] : undefined,
          room: rental?.roomId ? roomMap[rental.roomId] : null,
          daysOverdue: Math.floor(
            (new Date(today).getTime() - new Date(term.dueDate).getTime()) / 86_400_000
          ),
        }
      })
      .sort((a, b) => a.term.dueDate.localeCompare(b.term.dueDate))
  }, [rentalTerms, rentalMap, tenantMap, propertyMap, roomMap, today])

  const totalPages = Math.max(1, Math.ceil(overdueTerms.length / PAGE_SIZE))
  const paginated = overdueTerms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('overdueRentals.title')}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t('overdueRentals.subtitle', { count: overdueTerms.length })}
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="px-4 py-3 border-b">
          <h2 className="font-medium text-sm">{t('overdueRentals.title')}</h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.tenant')}</TableHead>
              <TableHead>{t('table.property')}</TableHead>
              <TableHead>{t('table.room')}</TableHead>
              <TableHead>{t('table.term')}</TableHead>
              <TableHead>{t('table.dueDate')}</TableHead>
              <TableHead>{t('table.rentAmount')}</TableHead>
              <TableHead>{t('table.daysOverdue')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                  {t('overdueRentals.noFound')}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(({ term, rental, tenant, property, room, daysOverdue }) => (
                <TableRow key={term.id} className="bg-red-50/40">
                  <TableCell>
                    <div className="text-sm">{tenant?.fullName ?? '—'}</div>
                    <div className="text-xs text-muted-foreground">{rental?.tenantId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{property?.propertyName ?? '—'}</div>
                    <div className="text-xs text-muted-foreground">{property?.propertyType}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {room ? (
                      <span>
                        {room.id}{' '}
                        <span className="text-muted-foreground text-xs">({room.roomType})</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{term.termLabel}</TableCell>
                  <TableCell className="text-sm">{formatDate(term.dueDate)}</TableCell>
                  <TableCell className="text-sm">{formatCurrency(term.amount)}</TableCell>
                  <TableCell className="text-sm text-red-600 font-medium">
                    {daysOverdue} {t('common.days')}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                      {t('rentals.termStatus.Overdue')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          page={page}
          totalPages={totalPages}
          totalItems={overdueTerms.length}
          pageSize={PAGE_SIZE}
          onPrev={() => setPage(p => Math.max(1, p - 1))}
          onNext={() => setPage(p => Math.min(totalPages, p + 1))}
        />
      </div>
    </div>
  )
}
