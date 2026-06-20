import { Link } from 'react-router-dom'
import { Building2, Users, BedDouble, LayoutGrid } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useData } from '@/context/DataContext'
import { formatDate } from '@/lib/formatters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function DashboardPage() {
  const { properties, rooms, tenants } = useData()
  const { t } = useTranslation()

  const apartments = properties.filter(p => p.propertyType === 'Apartment').length
  const buildings  = properties.filter(p => p.propertyType === 'Building').length
  const villas     = properties.filter(p => p.propertyType === 'Villa').length
  const offices    = properties.filter(p => p.propertyType === 'Office').length
  const stores     = properties.filter(p => p.propertyType === 'Store').length

  const recentTenants = [...tenants]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  const statCards = [
    {
      title: t('dashboard.totalProperties'),
      value: properties.length,
      sub: t('dashboard.propertyTypeBreakdown', { apartments, buildings, villas, offices, stores }),
      icon: Building2,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950',
    },
    {
      title: t('dashboard.totalRooms'),
      value: rooms.length,
      sub: t('dashboard.acrossProperties', { count: properties.filter(p => p.propertyType === 'Apartment' || p.propertyType === 'Building').length }),
      icon: BedDouble,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: t('dashboard.totalTenants'),
      value: tenants.length,
      sub: t('dashboard.registeredTenants'),
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: t('dashboard.propertyTypes'),
      value: null,
      sub: null,
      icon: LayoutGrid,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950',
      wide: true,
      breakdown: [
        { label: t('properties.types.Apartment'), count: apartments, color: 'bg-blue-500' },
        { label: t('properties.types.Building'),  count: buildings,  color: 'bg-purple-500' },
        { label: t('properties.types.Villa'),      count: villas,     color: 'bg-green-500' },
        { label: t('properties.types.Office'),     count: offices,    color: 'bg-orange-500' },
        { label: t('properties.types.Store'),      count: stores,     color: 'bg-yellow-500' },
      ],
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.filter(c => !c.wide).map(card => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`rounded-md p-1.5 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
        {statCards.filter(c => c.wide).map(card => (
          <Card key={card.title} className="col-span-2 lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`rounded-md p-1.5 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {card.breakdown?.map(b => (
                  <div key={b.label} className="flex items-center gap-3">
                    <div className={`h-8 w-1.5 rounded-full ${b.color}`} />
                    <div>
                      <p className="text-xl font-bold">{b.count}</p>
                      <p className="text-xs text-muted-foreground">{b.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent tenants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t('dashboard.recentTenants')}</CardTitle>
          <Link to="/tenants" className="text-sm text-amber-600 hover:underline">{t('dashboard.viewAll')}</Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.tenantId')}</TableHead>
                <TableHead>{t('table.fullName')}</TableHead>
                <TableHead>{t('table.email')}</TableHead>
                <TableHead>{t('table.phoneNumber')}</TableHead>
                <TableHead>{t('table.created')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted-foreground py-6 text-sm">
                    {t('tenants.noFound')}
                  </td>
                </tr>
              ) : (
                recentTenants.map(ten => (
                  <TableRow key={ten.id}>
                    <TableCell>
                      <Link to={`/tenants/${ten.id}`} className="font-medium text-amber-600 hover:underline">
                        {ten.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/tenants/${ten.id}`} className="hover:underline">{ten.fullName}</Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{ten.email || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{ten.phoneNumber}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(ten.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
