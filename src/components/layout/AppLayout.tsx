import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Building2, BarChart3, LogOut, Home, Settings, Loader2, AlertCircle, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import UserSettingsModal from '@/components/settings/UserSettingsModal'
import LanguageToggle from '@/components/layout/LanguageToggle'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { loading, error } = useData()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [showSettings, setShowSettings] = useState(false)

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
    { to: '/properties', label: t('nav.properties'), icon: Building2, end: false },
    { to: '/tenants', label: t('nav.tenants'), icon: Users, end: false },
    { to: '/rentals', label: t('nav.rentals'), icon: FileText, end: false },
    { to: '/overdue-rentals', label: t('nav.overdueRentals'), icon: AlertCircle, end: false },
    { to: '/reports', label: t('nav.reports'), icon: BarChart3, end: false },
  ]

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-e bg-card">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-sm leading-tight">
            {t('auth.appName')}<br />
            <span className="text-xs font-normal text-muted-foreground">{t('layout.rentalManagement')}</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + actions */}
        <div className="border-t px-3 py-4">
          <div className="mb-1 flex items-center gap-1 px-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground truncate">
                {t('auth.administrator')}
              </p>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <LanguageToggle />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
                onClick={() => setShowSettings(true)}
                title={t('auth.accountSettings')}
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            {t('nav.signOut')}
          </Button>
        </div>
        <UserSettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {error ? (
          <div className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('layout.errorTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : loading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin me-2" />
            {t('layout.loadingData')}
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  )
}
