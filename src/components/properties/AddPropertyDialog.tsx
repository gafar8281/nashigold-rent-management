import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useData } from '@/context/DataContext'
import type { PropertyType } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PROPERTY_TYPES: PropertyType[] = ['Apartment', 'Building', 'Villa', 'Office']

export default function AddPropertyDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation()
  const { addProperty } = useData()

  const [propertyName, setPropertyName] = useState('')
  const [propertyType, setPropertyType] = useState<PropertyType>('Apartment')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setPropertyName('')
    setPropertyType('Apartment')
    setAddress('')
    setError(null)
  }

  function handleClose(v: boolean) {
    if (!v) reset()
    onOpenChange(v)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!propertyName.trim() || !address.trim()) {
      setError(t('properties.errorRequired'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      await addProperty({ propertyName: propertyName.trim(), propertyType, address: address.trim() })
      reset()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('properties.addNew')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="prop-name">{t('properties.propertyName')}</Label>
              <Input
                id="prop-name"
                value={propertyName}
                onChange={e => setPropertyName(e.target.value)}
                placeholder={t('properties.propertyNamePlaceholder')}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prop-type">{t('properties.propertyType')}</Label>
              <select
                id="prop-type"
                value={propertyType}
                onChange={e => setPropertyType(e.target.value as PropertyType)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {PROPERTY_TYPES.map(pt => (
                  <option key={pt} value={pt}>{t(`properties.types.${pt}`)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prop-address">{t('properties.address')}</Label>
              <Input
                id="prop-address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder={t('properties.addressPlaceholder')}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
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
