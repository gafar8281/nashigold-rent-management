import type { Rental } from '@/types'
import { createCollectionService } from './firestore'

export const rentalService = createCollectionService<Rental>('rentals')
