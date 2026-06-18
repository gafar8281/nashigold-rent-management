import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { formatDate } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getTenantById, updateTenant, deleteTenant } = useData()

  const tenant = getTenantById(id ?? '')

  // Edit modal
  const [showEdit, setShowEdit] = useState(false)
  const [editFullName, setEditFullName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editNationalId, setEditNationalId] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editEmployment, setEditEmployment] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Delete confirm
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!tenant) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">{t('tenants.notFound')}</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/tenants')}>
          <ArrowLeft className="h-4 w-4 me-2" />
          {t('tenants.backToTenants')}
        </Button>
      </div>
    )
  }

  function openEdit() {
    setEditFullName(tenant!.fullName)
    setEditEmail(tenant!.email)
    setEditPhone(tenant!.phoneNumber)
    setEditNationalId(tenant!.nationalId)
    setEditAddress(tenant!.address)
    setEditEmployment(tenant!.employmentInfo)
    setEditError(null)
    setShowEdit(true)
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editFullName.trim() || !editPhone.trim() || !editNationalId.trim() || !editAddress.trim()) {
      setEditError(t('tenants.errorRequired'))
      return
    }
    setEditSaving(true)
    setEditError(null)
    try {
      await updateTenant(tenant!.id, {
        fullName: editFullName.trim(),
        email: editEmail.trim(),
        phoneNumber: editPhone.trim(),
        nationalId: editNationalId.trim(),
        address: editAddress.trim(),
        employmentInfo: editEmployment.trim(),
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
      await deleteTenant(tenant!.id)
      navigate('/tenants')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tenants')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{tenant.fullName}</h1>
            <p className="text-muted-foreground text-sm">{tenant.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openEdit}>
            <Pencil className="h-4 w-4 me-2" />
            {t('common.edit')}
          </Button>
          <Button variant="destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4 me-2" />
            {t('tenants.deleteTenant')}
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('tenants.profile')}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('tenants.fullName')}</dt>
              <dd className="mt-1 font-medium">{tenant.fullName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('tenants.email')}</dt>
              <dd className="mt-1 text-sm">{tenant.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('tenants.phoneNumber')}</dt>
              <dd className="mt-1 text-sm">{tenant.phoneNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('tenants.nationalId')}</dt>
              <dd className="mt-1 font-mono text-sm">{tenant.nationalId}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('tenants.address')}</dt>
              <dd className="mt-1 text-sm">{tenant.address}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('tenants.employmentInfo')}</dt>
              <dd className="mt-1 text-sm">{tenant.employmentInfo || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('tenants.tenantSince')}</dt>
              <dd className="mt-1 text-sm">{formatDate(tenant.createdAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Edit Tenant Dialog */}
      <Dialog open={showEdit} onOpenChange={v => { if (!v) setShowEdit(false) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('tenants.editTenant')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave}>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>{t('tenants.fullName')}</Label>
                <Input value={editFullName} onChange={e => setEditFullName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>{t('tenants.email')}</Label>
                <Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('tenants.phoneNumber')}</Label>
                <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>{t('tenants.nationalId')}</Label>
                <Input value={editNationalId} onChange={e => setEditNationalId(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>{t('tenants.address')}</Label>
                <Input value={editAddress} onChange={e => setEditAddress(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>{t('tenants.employmentInfo')}</Label>
                <Input value={editEmployment} onChange={e => setEditEmployment(e.target.value)} />
              </div>
              {editError && <p className="text-sm text-destructive">{editError}</p>}
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>
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
            <DialogTitle>{t('tenants.deleteConfirmTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">{t('tenants.deleteConfirmDesc')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? t('common.saving') : t('tenants.deleteTenant')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
