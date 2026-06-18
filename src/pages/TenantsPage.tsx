import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Search } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { formatDate } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import TablePagination from '@/components/shared/TablePagination'
import AddTenantDialog from '@/components/tenants/AddTenantDialog'

const PAGE_SIZE = 50

export default function TenantsPage() {
  const { t } = useTranslation()
  const { tenants } = useData()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)

  const filtered = tenants.filter(ten => {
    const q = search.toLowerCase()
    return (
      ten.fullName.toLowerCase().includes(q) ||
      ten.email.toLowerCase().includes(q) ||
      ten.nationalId.toLowerCase().includes(q) ||
      ten.id.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('tenants.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('tenants.subtitle', { count: tenants.length })}
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 me-2" />
          {t('tenants.addTenant')}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">{t('tenants.allTenants')}</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="ps-9"
              placeholder={t('tenants.searchPlaceholder')}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
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
                <TableHead>{t('table.created')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {t('tenants.noFound')}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(ten => (
                  <TableRow key={ten.id}>
                    <TableCell className="font-mono text-sm">
                      <Link to={`/tenants/${ten.id}`} className="text-amber-600 hover:underline">
                        {ten.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/tenants/${ten.id}`} className="font-medium hover:underline">
                        {ten.fullName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{ten.email || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{ten.phoneNumber}</TableCell>
                    <TableCell className="font-mono text-sm">{ten.nationalId}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(ten.createdAt)}</TableCell>
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

      <AddTenantDialog open={showAdd} onOpenChange={setShowAdd} />
    </div>
  )
}
