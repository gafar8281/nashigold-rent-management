import { createCollectionService } from './firestore'
import type { RentalTerm } from '@/types'

export const rentalTermService = createCollectionService<RentalTerm>('rentalTerms')
