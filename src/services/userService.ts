import type { AppUser } from '@/types'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { createCollectionService, db } from './firestore'

export type UserDoc = AppUser & { id: string; password: string }

export const userService = createCollectionService<UserDoc>('users')

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  const snap = await getDocs(query(collection(db, 'users'), where('email', '==', email)))
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as UserDoc
}
