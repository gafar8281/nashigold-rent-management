import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Plus, Trash2, Pencil } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { formatDate } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AddRoomDialog from '@/components/properties/AddRoomDialog'
import type { PropertyType } from '@/types'

const TYPE_COLORS: Record<string, string> = {
  Apartment: 'bg-blue-100 text-blue-700',
  Building:  'bg-purple-100 text-purple-700',
  Villa:     'bg-green-100 text-green-700',
  Office:    'bg-orange-100 text-orange-700',
  Store:     'bg-yellow-100 text-yellow-700',
}

const PROPERTY_TYPES: PropertyType[] = ['Apartment', 'Building', 'Villa', 'Office', 'Store']

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getPropertyById, updateProperty, deleteProperty, getRoomsByPropertyId, deleteRoom } = useData()

  const property = getPropertyById(id ?? '')
  const rooms = property ? getRoomsByPropertyId(property.id) : []

  // Edit modal state
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState<PropertyType>('Apartment')
  const [editAddress, setEditAddress] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Add room dialog
  const [showAddRoom, setShowAddRoom] = useState(false)

  // Delete property confirm
  const [showDeleteProp, setShowDeleteProp] = useState(false)
  const [deletingProp, setDeletingProp] = useState(false)

  // Delete room confirm
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null)
  const [deletingRoom, setDeletingRoom] = useState(false)

  if (!property) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">{t('properties.notFound')}</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/properties')}>
          <ArrowLeft className="h-4 w-4 me-2" />
          {t('properties.backToProperties')}
        </Button>
      </div>
    )
  }

  const hasRooms = property.propertyType === 'Apartment' || property.propertyType === 'Building'

  function openEdit() {
    setEditName(property!.propertyName)
    setEditType(property!.propertyType)
    setEditAddress(property!.address)
    setEditError(null)
    setShowEdit(true)
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editName.trim() || !editAddress.trim()) {
      setEditError(t('properties.errorRequired'))
      return
    }
    setEditSaving(true)
    setEditError(null)
    try {
      await updateProperty(property!.id, {
        propertyName: editName.trim(),
        propertyType: editType,
        address: editAddress.trim(),
      })
      setShowEdit(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : String(err))
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDeleteProperty() {
    setDeletingProp(true)
    try {
      await deleteProperty(property!.id)
      navigate('/properties')
    } finally {
      setDeletingProp(false)
    }
  }

  async function handleDeleteRoom() {
    if (!roomToDelete) return
    setDeletingRoom(true)
    try {
      await deleteRoom(roomToDelete)
      setRoomToDelete(null)
    } finally {
      setDeletingRoom(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/properties')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{property.propertyName}</h1>
            <p className="text-muted-foreground text-sm">{property.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openEdit}>
            <Pencil className="h-4 w-4 me-2" />
            {t('common.edit')}
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteProp(true)}>
            <Trash2 className="h-4 w-4 me-2" />
            {t('properties.deleteProperty')}
          </Button>
        </div>
      </div>

      {/* Property Profile */}
      <Card>
        <CardHeader>
          <CardTitle>{t('properties.profile')}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('properties.propertyType')}</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[property.propertyType] ?? ''}`}>
                  {t(`properties.types.${property.propertyType}`)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('properties.propertyName')}</dt>
              <dd className="mt-1 font-medium">{property.propertyName}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('properties.address')}</dt>
              <dd className="mt-1 text-sm">{property.address}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">{t('properties.addedOn')}</dt>
              <dd className="mt-1 text-sm">{formatDate(property.createdAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Rooms Section (only for Apartment / Building) */}
      {hasRooms && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('rooms.title', { count: rooms.length })}</CardTitle>
            <Button size="sm" onClick={() => setShowAddRoom(true)}>
              <Plus className="h-4 w-4 me-2" />
              {t('rooms.addRoom')}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.roomId')}</TableHead>
                  <TableHead>{t('table.roomType')}</TableHead>
                  <TableHead>{t('table.created')}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      {t('rooms.noRooms')}
                    </TableCell>
                  </TableRow>
                ) : (
                  rooms.map(room => (
                    <TableRow key={room.id}>
                      <TableCell className="font-mono text-sm">{room.id}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${room.roomType === 'Family' ? 'bg-green-100 text-green-700' : 'bg-sky-100 text-sky-700'}`}>
                          {t(`rooms.types.${room.roomType}`)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(room.createdAt)}</TableCell>
                      <TableCell className="text-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setRoomToDelete(room.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Property Dialog */}
      <Dialog open={showEdit} onOpenChange={v => { if (!v) setShowEdit(false) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('properties.editProperty')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave}>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>{t('properties.propertyName')}</Label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>{t('properties.propertyType')}</Label>
                <select
                  value={editType}
                  onChange={e => setEditType(e.target.value as PropertyType)}
                  disabled
                  className="flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 text-sm shadow-sm opacity-60 cursor-not-allowed"
                >
                  {PROPERTY_TYPES.map(pt => (
                    <option key={pt} value={pt}>{t(`properties.types.${pt}`)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('properties.address')}</Label>
                <Input value={editAddress} onChange={e => setEditAddress(e.target.value)} required />
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

      {/* Delete Property Confirm */}
      <Dialog open={showDeleteProp} onOpenChange={setShowDeleteProp}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('properties.deleteConfirmTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">{t('properties.deleteConfirmDesc')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteProp(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" disabled={deletingProp} onClick={handleDeleteProperty}>
              {deletingProp ? t('common.saving') : t('properties.deleteProperty')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Room Confirm */}
      <Dialog open={!!roomToDelete} onOpenChange={v => { if (!v) setRoomToDelete(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('rooms.deleteConfirmTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">{t('rooms.deleteConfirmDesc')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoomToDelete(null)}>{t('common.cancel')}</Button>
            <Button variant="destructive" disabled={deletingRoom} onClick={handleDeleteRoom}>
              {deletingRoom ? t('common.saving') : t('rooms.deleteRoom')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddRoomDialog open={showAddRoom} onOpenChange={setShowAddRoom} propertyId={property.id} />
    </div>
  )
}
