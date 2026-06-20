import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthProvider } from '@/context/AuthContext'
import { DataProvider } from '@/context/DataContext'
import { DirectionProvider } from '@/components/ui/direction'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import PropertiesPage from '@/pages/PropertiesPage'
import PropertyDetailPage from '@/pages/PropertyDetailPage'
import TenantsPage from '@/pages/TenantsPage'
import TenantDetailPage from '@/pages/TenantDetailPage'
import RentalsPage from '@/pages/RentalsPage'
import RentalDetailPage from '@/pages/RentalDetailPage'
import OverdueRentalsPage from '@/pages/OverdueRentalsPage'
import ReportsPage from '@/pages/ReportsPage'

function AppWithDirection() {
  const { i18n } = useTranslation()
  const [dir, setDir] = useState<'ltr' | 'rtl'>(
    i18n.language === 'ar' ? 'rtl' : 'ltr'
  )

  useEffect(() => {
    const d = i18n.language === 'ar' ? ('rtl' as const) : ('ltr' as const)
    setDir(d)
    document.documentElement.dir = d
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return (
    <DirectionProvider dir={dir}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route
                element={
                  <DataProvider>
                    <AppLayout />
                  </DataProvider>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/properties" element={<PropertiesPage />} />
                <Route path="/properties/:id" element={<PropertyDetailPage />} />
                <Route path="/tenants" element={<TenantsPage />} />
                <Route path="/tenants/:id" element={<TenantDetailPage />} />
                <Route path="/rentals" element={<RentalsPage />} />
                <Route path="/rentals/:id" element={<RentalDetailPage />} />
                <Route path="/overdue-rentals" element={<OverdueRentalsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </DirectionProvider>
  )
}

export default function App() {
  return <AppWithDirection />
}
