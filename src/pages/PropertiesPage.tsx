import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Search } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { formatDate } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import TablePagination from '@/components/shared/TablePagination'
import AddPropertyDialog from '@/components/properties/AddPropertyDialog'

const PAGE_SIZE = 50

const TYPE_COLORS: Record<string, string> = {
  Apartment: 'bg-blue-100 text-blue-700',
  Building:  'bg-purple-100 text-purple-700',
  Villa:     'bg-green-100 text-green-700',
  Office:    'bg-orange-100 text-orange-700',
  Store:     'bg-yellow-100 text-yellow-700',
}

export default function PropertiesPage() {
  const { t } = useTranslation()
  const { properties, rooms } = useData()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)

  const filtered = properties.filter(p => {
    const q = search.toLowerCase()
    return (
      p.propertyName.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.propertyType.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function roomCount(propertyId: string): number {
    return rooms.filter(r => r.propertyId === propertyId).length
  }

  const hasRooms = (type: string) => type === 'Apartment' || type === 'Building'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('properties.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('properties.subtitle', { count: properties.length })}
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 me-2" />
          {t('properties.addProperty')}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">{t('properties.allProperties')}</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="ps-9"
              placeholder={t('properties.searchPlaceholder')}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
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
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {t('properties.noFound')}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">
                      <Link to={`/properties/${p.id}`} className="text-amber-600 hover:underline">
                        {p.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/properties/${p.id}`} className="font-medium hover:underline">
                        {p.propertyName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[p.propertyType] ?? ''}`}>
                        {t(`properties.types.${p.propertyType}`)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                      {p.address}
                    </TableCell>
                    <TableCell>
                      {hasRooms(p.propertyType) ? (
                        <Badge variant="secondary">{roomCount(p.id)}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(p.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
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
        </CardContent>
      </Card>

      <AddPropertyDialog open={showAdd} onOpenChange={setShowAdd} />
    </div>
  )
}
