import type { AppUser } from '@/types'
import { findWhere } from '@/lib/mockDb'
import { createCollectionService } from './firestore'

/**
 * In-memory `users` collection document. Mirrors `AppUser` plus the credential
 * field needed for custom authentication: `id` (== uid) and the user's
 * `password`. The password is stripped before a user is exposed to the rest of
 * the app (see AuthContext).
 */
export type UserDoc = AppUser & { id: string; password: string }

export const userService = createCollectionService<UserDoc>('users')

/**
 * Look up a single user by email. This is the one place credentials are
 * resolved — used by login to verify credentials.
 * Returns the full document (including `password`) or null if none matches.
 */
export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  return findWhere<UserDoc>('users', 'email', email)
}
