import type { Room } from '@/types'
import { createCollectionService } from './firestore'

export const roomService = createCollectionService<Room>('rooms')
