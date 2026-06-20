/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react'
import { bootstrapAdmin } from '@/lib/authBootstrap'
import { seedFirestore } from '@/lib/seedFirestore'
import { findUserByEmail, userService } from '@/services/userService'
import type { AppUser } from '@/types'

const SESSION_KEY = 'nashi.auth.uid'

interface AuthContextValue {
  user: AppUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  /** True until both bootstrap and the first auth state check complete. */
  initializing: boolean
  /** Returns an error message on failure, or null on success. */
  login: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchProfile(uid: string): Promise<AppUser | null> {
  const all = await userService.getAll()
  const record = all.find(u => u.uid === uid)
  if (!record) return null
  const { password: _pw, id: _id, ...profile } = record
  void _pw
  void _id
  return profile
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [authReady, setAuthReady] = useState(false)

  // `initializing` tracks whether the stored session has been restored yet. It
  // is used by ProtectedRoute to avoid flashing /login on refresh. Bootstrap
  // runs independently in the background.
  const initializing = !authReady

  // Bootstrap the Super Admin account and seed initial data silently in the background.
  useEffect(() => {
    Promise.all([
      bootstrapAdmin(),
      seedFirestore(),
    ]).catch(err => console.error('[AuthProvider] bootstrap failed:', err))
  }, [])

  // Restore the session on refresh from the persisted uid.
  useEffect(() => {
    let cancelled = false
    async function restore() {
      const uid = localStorage.getItem(SESSION_KEY)
      if (uid) {
        try {
          const profile = await fetchProfile(uid)
          if (cancelled) return
          if (!profile || !profile.isActive) {
            localStorage.removeItem(SESSION_KEY)
            setUser(null)
          } else {
            setUser(profile)
          }
        } catch {
          if (cancelled) return
          localStorage.removeItem(SESSION_KEY)
          setUser(null)
        }
      }
      if (!cancelled) setAuthReady(true)
    }
    restore()
    return () => {
      cancelled = true
    }
  }, [])

  async function login(email: string, password: string): Promise<string | null> {
    try {
      const record = await findUserByEmail(email)
      if (!record || record.password !== password) {
        return 'auth.errors.incorrectCredentials'
      }
      if (!record.isActive) {
        return 'auth.errors.accountDisabled'
      }
      const { password: _omit, id: _id, ...profile } = record
      void _omit
      void _id
      localStorage.setItem(SESSION_KEY, record.uid)
      setUser(profile)
      return null
    } catch (err) {
      console.error('[AuthProvider] login failed:', err)
      return 'auth.errors.signInFailed'
    }
  }

  async function logout(): Promise<void> {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        initializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
