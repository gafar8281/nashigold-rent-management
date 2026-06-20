import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useData } from '@/context/DataContext'
import { calcRentalTermMonths, splitRentalTerm, generateRentalTerms } from '@/lib/calculations'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BillingCycle } from '@/types'

const ROOM_PROPERTY_TYPES = ['Apartment', 'Building']
const BILLING_CYCLES: BillingCycle[] = ['Monthly', 'Quarterly', 'Yearly']

interface Props {
  open: boolean
  onClose: () => void
}

export default function AddRentalDialog({ open, onClose }: Props) {
  const { t } = useTranslation()
  const { tenants, properties, getRoomsByPropertyId, addRental, addRentalTermsBatch } = useData()

  const [tenantId, setTenantId] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('Monthly')
  const [rentAmount, setRentAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedProperty = properties.find(p => p.id === propertyId)
  const needsRoom = selectedProperty ? ROOM_PROPERTY_TYPES.includes(selectedProperty.propertyType) : false
  const availableRooms = needsRoom ? getRoomsByPropertyId(propertyId) : []

  const durationText = useMemo(() => {
    if (!startDate || !endDate || endDate <= startDate) return null
    const total = calcRentalTermMonths(startDate, endDate)
    if (total <= 0) return null
    const { years, months } = splitRentalTerm(total)
    const parts: string[] = []
    if (years > 0) parts.push(`${years} ${t(years === 1 ? 'common.year' : 'common.years')}`)
    if (months > 0) parts.push(`${months} ${t(months === 1 ? 'common.month' : 'common.months')}`)
    return parts.join(' ') || null
  }, [startDate, endDate, t])

  function handlePropertyChange(newId: string) {
    setPropertyId(newId)
    setRoomId('')
  }

  function reset() {
    setTenantId('')
    setPropertyId('')
    setRoomId('')
    setStartDate('')
    setEndDate('')
    setBillingCycle('Monthly')
    setRentAmount('')
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!tenantId || !propertyId || !startDate || !endDate || !rentAmount) {
      setError(t('rentals.errorRequired'))
      return
    }
    if (endDate <= startDate) {
      setError(t('rentals.errorDateOrder'))
      return
    }
    if (needsRoom && !roomId) {
      setError(t('rentals.errorRoomRequired'))
      return
    }

    const parsedAmount = parseFloat(rentAmount)
    setSaving(true)
    try {
      const newRental = await addRental({
        tenantId,
        propertyId,
        ...(needsRoom && roomId ? { roomId } : {}),
        startDate,
        endDate,
        rentalTermMonths: calcRentalTermMonths(startDate, endDate),
        billingCycle,
        rentAmount: parsedAmount,
      })
      const terms = generateRentalTerms(startDate, endDate, billingCycle, parsedAmount)
      await addRentalTermsBatch(newRental.id, terms)
      reset()
      onClose()
    } catch {
      setError('Failed to save rental. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const fieldClass = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

  return (
    <Dialog open={open} onOpenChange={open ? handleClose : undefined}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('rentals.addNew')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rental-tenant">{t('rentals.tenant')}</Label>
            <select
              id="rental-tenant"
              value={tenantId}
              onChange={e => setTenantId(e.target.value)}
              className={fieldClass}
            >
              <option value="">{t('rentals.selectTenant')}</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.id} — {t.fullName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rental-property">{t('rentals.property')}</Label>
            <select
              id="rental-property"
              value={propertyId}
              onChange={e => handlePropertyChange(e.target.value)}
              className={fieldClass}
            >
              <option value="">{t('rentals.selectProperty')}</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.id} — {p.propertyName} ({p.propertyType})</option>
              ))}
            </select>
          </div>

          {needsRoom && (
            <div className="space-y-1.5">
              <Label htmlFor="rental-room">{t('rentals.room')}</Label>
              <select
                id="rental-room"
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                className={fieldClass}
              >
                <option value="">{t('rentals.selectRoom')}</option>
                {availableRooms.map(r => (
                  <option key={r.id} value={r.id}>{r.id} ({r.roomType})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rental-start">{t('rentals.startDate')}</Label>
              <input
                id="rental-start"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rental-end">{t('rentals.endDate')}</Label>
              <input
                id="rental-end"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          {durationText && (
            <p className="text-xs text-muted-foreground">
              {t('rentals.durationPreview', { duration: durationText })}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="rental-cycle">{t('rentals.billingCycle')}</Label>
            <select
              id="rental-cycle"
              value={billingCycle}
              onChange={e => setBillingCycle(e.target.value as BillingCycle)}
              className={fieldClass}
            >
              {BILLING_CYCLES.map(c => (
                <option key={c} value={c}>{t(`rentals.billingCycles.${c}`)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rental-amount">{t('rentals.rentAmount')}</Label>
            <Input
              id="rental-amount"
              type="number"
              min="0"
              step="0.01"
              value={rentAmount}
              onChange={e => setRentAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
