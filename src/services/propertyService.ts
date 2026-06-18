import type { Property } from '@/types'
import { createCollectionService } from './firestore'

export const propertyService = createCollectionService<Property>('properties')
