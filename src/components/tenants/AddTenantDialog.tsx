import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useData } from '@/context/DataContext'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddTenantDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation()
  const { addTenant } = useData()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [address, setAddress] = useState('')
  const [employmentInfo, setEmploymentInfo] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setFullName('')
    setEmail('')
    setPhoneNumber('')
    setNationalId('')
    setAddress('')
    setEmploymentInfo('')
    setError(null)
  }

  function handleClose(v: boolean) {
    if (!v) reset()
    onOpenChange(v)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !phoneNumber.trim() || !nationalId.trim() || !address.trim()) {
      setError(t('tenants.errorRequired'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      await addTenant({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        nationalId: nationalId.trim(),
        address: address.trim(),
        employmentInfo: employmentInfo.trim(),
      })
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
          <DialogTitle>{t('tenants.addNew')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ten-name">{t('tenants.fullName')}</Label>
              <Input id="ten-name" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ten-email">{t('tenants.email')}</Label>
              <Input id="ten-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ten-phone">{t('tenants.phoneNumber')}</Label>
              <Input id="ten-phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ten-nid">{t('tenants.nationalId')}</Label>
              <Input id="ten-nid" value={nationalId} onChange={e => setNationalId(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ten-addr">{t('tenants.address')}</Label>
              <Input id="ten-addr" value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ten-emp">{t('tenants.employmentInfo')}</Label>
              <Input id="ten-emp" value={employmentInfo} onChange={e => setEmploymentInfo(e.target.value)} />
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
