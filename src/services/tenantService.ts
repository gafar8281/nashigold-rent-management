import type { Tenant } from '@/types'
import { createCollectionService } from './firestore'

export const tenantService = createCollectionService<Tenant>('tenants')
