import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useData } from '@/context/DataContext'
import type { RoomType } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  propertyId: string
}

const ROOM_TYPES: RoomType[] = ['Bachelor', 'Family']

export default function AddRoomDialog({ open, onOpenChange, propertyId }: Props) {
  const { t } = useTranslation()
  const { addRoom } = useData()

  const [roomType, setRoomType] = useState<RoomType>('Bachelor')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setRoomType('Bachelor')
    setError(null)
  }

  function handleClose(v: boolean) {
    if (!v) reset()
    onOpenChange(v)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await addRoom({ propertyId, roomType })
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('rooms.addNew')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="room-type">{t('rooms.roomType')}</Label>
              <select
                id="room-type"
                value={roomType}
                onChange={e => setRoomType(e.target.value as RoomType)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {ROOM_TYPES.map(rt => (
                  <option key={rt} value={rt}>{t(`rooms.types.${rt}`)}</option>
                ))}
              </select>
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
