import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { calcRentalTermMonths, splitRentalTerm } from '@/lib/calculations'
import { formatDate, formatCurrency, todayISO } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BillingCycle } from '@/types'

const ROOM_PROPERTY_TYPES = ['Apartment', 'Building']
const BILLING_CYCLES: BillingCycle[] = ['Monthly', 'Quarterly', 'Yearly']

function formatDuration(totalMonths: number, t: (k: string) => string): string {
  if (totalMonths <= 0) return `0 ${t('common.months')}`
  const { years, months } = splitRentalTerm(totalMonths)
  const parts: string[] = []
  if (years > 0) parts.push(`${years} ${t(years === 1 ? 'common.year' : 'common.years')}`)
  if (months > 0) parts.push(`${months} ${t(months === 1 ? 'common.month' : 'common.months')}`)
  return parts.join(' ')
}

export default function RentalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    getRentalById, updateRental, deleteRental,
    tenants, properties, rooms, getRoomsByPropertyId,
  } = useData()

  const rental = getRentalById(id ?? '')
  const today = todayISO()

  // Edit state
  const [showEdit, setShowEdit] = useState(false)
  const [editTenantId, setEditTenantId] = useState('')
  const [editPropertyId, setEditPropertyId] = useState('')
  const [editRoomId, setEditRoomId] = useState('')
  const [editStartDate, setEditStartDate] = useState('')
  const [editEndDate, setEditEndDate] = useState('')
  const [editBillingCycle, setEditBillingCycle] = useState<BillingCycle>('Monthly')
  const [editRentAmount, setEditRentAmount] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Delete state
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const selectedEditProperty = properties.find(p => p.id === editPropertyId)
  const needsRoom = selectedEditProperty ? ROOM_PROPERTY_TYPES.includes(selectedEditProperty.propertyType) : false
  const availableRooms = needsRoom ? getRoomsByPropertyId(editPropertyId) : []

  const durationPreview = useMemo(() => {
    if (!editStartDate || !editEndDate || editEndDate <= editStartDate) return null
    const total = calcRentalTermMonths(editStartDate, editEndDate)
    if (total <= 0) return null
    return formatDuration(total, t)
  }, [editStartDate, editEndDate, t])

  if (!rental) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">{t('rentals.notFound')}</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/rentals')}>
          <ArrowLeft className="h-4 w-4 me-2" />
          {t('rentals.backToRentals')}
        </Button>
      </div>
    )
  }

  const tenant = tenants.find(t => t.id === rental.tenantId)
  const property = properties.find(p => p.id === rental.propertyId)
  const room = rental.roomId ? rooms.find(r => r.id === rental.roomId) : null
  const isExpired = today > rental.endDate

  function openEdit() {
    setEditTenantId(rental!.tenantId)
    setEditPropertyId(rental!.propertyId)
    setEditRoomId(rental!.roomId ?? '')
    setEditStartDate(rental!.startDate)
    setEditEndDate(rental!.endDate)
    setEditBillingCycle(rental!.billingCycle)
    setEditRentAmount(String(rental!.rentAmount))
    setEditError(null)
    setShowEdit(true)
  }

  function handlePropertyChange(newId: string) {
    setEditPropertyId(newId)
    setEditRoomId('')
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault()
    setEditError(null)

    if (!editTenantId || !editPropertyId || !editStartDate || !editEndDate || !editRentAmount) {
      setEditError(t('rentals.errorRequired'))
      return
    }
    if (editEndDate <= editStartDate) {
      setEditError(t('rentals.errorDateOrder'))
      return
    }
    if (needsRoom && !editRoomId) {
      setEditError(t('rentals.errorRoomRequired'))
      return
    }

    setEditSaving(true)
    try {
      await updateRental(rental!.id, {
        tenantId: editTenantId,
        propertyId: editPropertyId,
        roomId: needsRoom ? editRoomId : undefined,
        startDate: editStartDate,
        endDate: editEndDate,
        rentalTermMonths: calcRentalTermMonths(editStartDate, editEndDate),
        billingCycle: editBillingCycle,
        rentAmount: parseFloat(editRentAmount),
      })
      setShowEdit(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : String(err))
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteRental(rental!.id)
      navigate('/rentals')
    } finally {
      setDeleting(false)
    }
  }

  const fieldClass = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/rentals')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-mono">{rental.id}</h1>
            <p className="text-muted-foreground text-sm">{tenant?.fullName ?? rental.tenantId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openEdit}>
            <Pencil className="h-4 w-4 me-2" />
            {t('common.edit')}
          </Button>
          <Button variant="destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4 me-2" />
            {t('rentals.deleteRental')}
          </Button>
        </div>
      </div>

      {/* Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('rentals.rentalDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('rentals.tenant')}</dt>
              <dd className="mt-1 font-medium">{tenant?.fullName ?? rental.tenantId}</dd>
              <dd className="text-xs text-muted-foreground font-mono">{rental.tenantId}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('rentals.property')}</dt>
              <dd className="mt-1 font-medium">{property?.propertyName ?? rental.propertyId}</dd>
              <dd className="text-xs text-muted-foreground">{property?.propertyType}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('table.room')}</dt>
              <dd className="mt-1 text-sm">
                {room ? `${room.id} (${room.roomType})` : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('table.startDate')}</dt>
              <dd className="mt-1 text-sm">{formatDate(rental.startDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('table.endDate')}</dt>
              <dd className="mt-1 text-sm">{formatDate(rental.endDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('table.duration')}</dt>
              <dd className="mt-1 text-sm">{formatDuration(rental.rentalTermMonths, t)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('table.billingCycle')}</dt>
              <dd className="mt-1 text-sm">{t(`rentals.billingCycles.${rental.billingCycle}`)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('table.rentAmount')}</dt>
              <dd className="mt-1 font-medium">{formatCurrency(rental.rentAmount)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('table.status')}</dt>
              <dd className="mt-1">
                <Badge
                  className={
                    isExpired
                      ? 'bg-red-100 text-red-700 hover:bg-red-100'
                      : 'bg-green-100 text-green-700 hover:bg-green-100'
                  }
                >
                  {isExpired ? t('rentals.statusExpired') : t('rentals.statusActive')}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('rentals.createdOn')}</dt>
              <dd className="mt-1 text-sm">{formatDate(rental.createdAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={v => { if (!v) setShowEdit(false) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('rentals.editRental')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave}>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>{t('rentals.tenant')}</Label>
                <select value={editTenantId} onChange={e => setEditTenantId(e.target.value)} className={fieldClass}>
                  <option value="">{t('rentals.selectTenant')}</option>
                  {tenants.map(ten => (
                    <option key={ten.id} value={ten.id}>{ten.id} — {ten.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>{t('rentals.property')}</Label>
                <select value={editPropertyId} onChange={e => handlePropertyChange(e.target.value)} className={fieldClass}>
                  <option value="">{t('rentals.selectProperty')}</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.id} — {p.propertyName} ({p.propertyType})</option>
                  ))}
                </select>
              </div>

              {needsRoom && (
                <div className="space-y-1.5">
                  <Label>{t('rentals.room')}</Label>
                  <select value={editRoomId} onChange={e => setEditRoomId(e.target.value)} className={fieldClass}>
                    <option value="">{t('rentals.selectRoom')}</option>
                    {availableRooms.map(r => (
                      <option key={r.id} value={r.id}>{r.id} ({r.roomType})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t('rentals.startDate')}</Label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={e => setEditStartDate(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('rentals.endDate')}</Label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={e => setEditEndDate(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              {durationPreview && (
                <p className="text-xs text-muted-foreground">
                  {t('rentals.durationPreview', { duration: durationPreview })}
                </p>
              )}

              <div className="space-y-1.5">
                <Label>{t('rentals.billingCycle')}</Label>
                <select
                  value={editBillingCycle}
                  onChange={e => setEditBillingCycle(e.target.value as BillingCycle)}
                  className={fieldClass}
                >
                  {BILLING_CYCLES.map(c => (
                    <option key={c} value={c}>{t(`rentals.billingCycles.${c}`)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>{t('rentals.rentAmount')}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editRentAmount}
                  onChange={e => setEditRentAmount(e.target.value)}
                />
              </div>

              {editError && <p className="text-sm text-destructive">{editError}</p>}
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowEdit(false)} disabled={editSaving}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={editSaving}>
                {editSaving ? t('common.saving') : t('common.saveChanges')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('rentals.deleteConfirmTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">{t('rentals.deleteConfirmDesc')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? t('common.saving') : t('rentals.deleteRental')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
