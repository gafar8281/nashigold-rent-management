import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { formatCurrency, formatDate, todayISO } from '@/lib/formatters'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import TablePagination from '@/components/shared/TablePagination'

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const PAGE_SIZE = 50

export default function OverdueRentalsPage() {
  const { t } = useTranslation()
  const { rentalTerms, rentals, tenants, properties, rooms, updateRentalTerm } = useData()
  const [page, setPage] = useState(1)
  const [pendingTermId, setPendingTermId] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [whatsappTarget, setWhatsappTarget] = useState<typeof overdueTerms[number] | null>(null)
  const [whatsappMsg, setWhatsappMsg] = useState('')

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

  async function handleConfirmPaid() {
    if (!pendingTermId) return
    await updateRentalTerm(pendingTermId, { status: 'Paid' })
    setPendingTermId(null)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 4000)
  }

  // function buildMessage(target: typeof overdueTerms[number]): string {
  //   const { tenant, property, term } = target
  //   return `Dear ${tenant?.fullName ?? 'Tenant'}, this is a reminder that your rental payment for ${property?.propertyName ?? 'the property'} is overdue. The rent amount is ${formatCurrency(term.amount)} (Term: ${term.termLabel}), which was due on ${formatDate(term.dueDate)}. Please make the payment at your earliest convenience. Thank you.`
  // }
  function buildMessage(target: typeof overdueTerms[number]): string {
    const { tenant, property, term } = target;
    
    const tenantName = tenant?.fullName ?? 'عزيزي المستأجر';
    const propertyName = property?.propertyName ?? 'العقار';
    const greeting = tenant?.fullName ? `عزيزي ${tenantName}` : tenantName;
  
    return `${greeting}، نود تذكيركم بأن دفعة الإيجار الخاصة بـ ${propertyName} متأخرة. قيمة الإيجار هي ${formatCurrency(term.amount)} (${term.termLabel})، والتي كان تاريخ استحقاقها في ${formatDate(term.dueDate)}. يرجى سداد المبلغ في أقرب وقت ممكن. شكراً لكم.`;
  }

  function handleOpenWhatsapp() {
    if (!whatsappTarget?.tenant?.phoneNumber) return
    const phone = whatsappTarget.tenant.phoneNumber.replace(/[^\d]/g, '')
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMsg)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setWhatsappTarget(null)
  }

  function openWhatsappDialog(target: typeof overdueTerms[number]) {
    setWhatsappTarget(target)
    setWhatsappMsg(buildMessage(target))
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('overdueRentals.title')}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t('overdueRentals.subtitle', { count: overdueTerms.length })}
        </p>
      </div>

      {showSuccess && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{t('overdueRentals.successMsg')}</AlertDescription>
        </Alert>
      )}

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
              <TableHead className="text-right">{t('overdueRentals.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
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
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Menu className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setPendingTermId(term.id)}>
                          {t('overdueRentals.markAsPaid')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openWhatsappDialog({ term, rental, tenant, property, room, daysOverdue })}
                          className="text-green-700 focus:text-green-700"
                        >
                          <span className="flex items-center gap-2">
                            <WhatsAppIcon />
                            {t('overdueRentals.sendWhatsapp')}
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* Mark as Paid confirmation */}
      <AlertDialog open={!!pendingTermId} onOpenChange={open => { if (!open) setPendingTermId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('overdueRentals.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('overdueRentals.confirmMessage')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPaid}>{t('overdueRentals.confirmBtn')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* WhatsApp reminder dialog */}
      <Dialog open={!!whatsappTarget} onOpenChange={open => { if (!open) setWhatsappTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-green-600"><WhatsAppIcon /></span>
              {t('overdueRentals.whatsappTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('overdueRentals.whatsappPhone')}:{' '}
              <span className="font-medium text-foreground">
                {whatsappTarget?.tenant?.phoneNumber ?? '—'}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{t('overdueRentals.whatsappMessageLabel')}</Label>
            <Textarea
              rows={6}
              value={whatsappMsg}
              onChange={e => setWhatsappMsg(e.target.value)}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWhatsappTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
              onClick={handleOpenWhatsapp}
            >
              <WhatsAppIcon />
              {t('overdueRentals.whatsappSend')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
