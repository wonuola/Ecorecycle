// ============================================================================
// ECORECYCLE FACTORY MANAGEMENT SYSTEM — APP WITH REACT ROUTER
// ============================================================================

import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/hooks/useAuth'

import { LoginPage } from '@/sections/LoginPage'
import { Dashboard } from '@/sections/Dashboard'
import { VendorModule } from '@/sections/VendorModule'
import { SupplyChainModule } from '@/sections/SupplyChainModule'
import { OperationsModule } from '@/sections/OperationsModule'
import { ProductionModule } from '@/sections/ProductionModule'
import { BatchControlModule } from '@/sections/BatchControlModule'
import { ProductionMonitor } from '@/sections/ProductionMonitor'
import { ShiftScheduling } from '@/sections/ShiftScheduling'
import { PurchaseReceipt } from '@/sections/PurchaseReceipt'
import { FinanceModule } from '@/sections/FinanceModule'
import { AnalyticsDashboard } from '@/sections/AnalyticsDashboard'
import { AlertSystem } from '@/sections/AlertSystem'
import { ReportsModule } from '@/sections/ReportsModule'
import { AuditTrail } from '@/sections/AuditTrail'
import { UserManagement } from '@/sections/UserManagement'
import { TicketsModule } from '@/sections/TicketsModule'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { db } from '@/services/database'
import {
  LayoutDashboard, Users, ShoppingCart, Factory, TrendingUp,
  LogOut, Menu, Bell, Shield, Ticket, History,
  Check, Activity, Clock, Truck, BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

interface Notification {
  id: string
  type: string
  message: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  createdAt: string
  read: boolean
}

// ============================================================================
// ROUTE CONFIG
// ============================================================================

interface RouteConfig {
  path: string
  label: string
  icon: React.ElementType
  element: React.ReactNode
  permission: string
  adminOnly?: boolean
  group: string
}

const ROUTES: RouteConfig[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, element: <Dashboard />, permission: 'view_dashboard', group: '' },
  { path: '/procurement', label: 'Procurement', icon: ShoppingCart, element: <SupplyChainModule />, permission: 'view_supply_chain', group: 'Operations' },
  { path: '/goods-receipt', label: 'Goods Receipt', icon: Truck, element: <PurchaseReceipt />, permission: 'view_supply_chain', group: 'Operations' },
  { path: '/warehouse', label: 'Warehouse & Processing', icon: Factory, element: <OperationsModule />, permission: 'view_operations', group: 'Operations' },
  { path: '/production', label: 'Production Line', icon: Factory, element: <ProductionModule />, permission: 'view_production', group: 'Operations' },
  { path: '/batch-control', label: 'Batch Control', icon: Shield, element: <BatchControlModule />, permission: 'view_production', group: 'Operations' },
  { path: '/monitor', label: 'Live Operations', icon: Activity, element: <ProductionMonitor />, permission: 'view_production', group: 'Operations' },
  { path: '/shifts', label: 'Shift Management', icon: Clock, element: <ShiftScheduling />, permission: 'view_operations', group: 'Operations' },
  { path: '/vendors', label: 'Vendors & Buyers', icon: Users, element: <VendorModule />, permission: 'view_vendors', group: 'Finance & Partners' },
  { path: '/finance', label: 'Finance & Accounting', icon: TrendingUp, element: <FinanceModule />, permission: 'view_finance', group: 'Finance & Partners' },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, element: <AnalyticsDashboard />, permission: 'view_reports', group: 'Intelligence & Support' },
  { path: '/reports', label: 'Reports & Exports', icon: TrendingUp, element: <ReportsModule />, permission: 'view_reports', group: 'Intelligence & Support' },
  { path: '/alerts', label: 'Alerts & Notifications', icon: Bell, element: <AlertSystem />, permission: 'view_dashboard', group: 'Intelligence & Support' },
  { path: '/tickets', label: 'Support Tickets', icon: Ticket, element: <TicketsModule />, permission: 'view_tickets', group: 'Intelligence & Support' },
  { path: '/audit', label: 'Audit Trail', icon: History, element: <AuditTrail />, permission: 'view_audit_logs', adminOnly: true, group: 'Administration' },
  { path: '/users', label: 'User Management', icon: Shield, element: <UserManagement />, permission: 'manage_users', adminOnly: true, group: 'Administration' },
]

const GROUP_ORDER = ['', 'Operations', 'Finance & Partners', 'Intelligence & Support', 'Administration']

// Build NAV_GROUPS from ROUTES for the sidebar
const NAV_GROUPS = GROUP_ORDER.map(g => ({
  label: g,
  items: ROUTES.filter(r => r.group === g),
}))

// ============================================================================
// 404 NOT FOUND
// ============================================================================

function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="text-6xl font-bold text-gray-200">404</div>
      <h2 className="text-xl font-semibold text-gray-700">Page Not Found</h2>
      <p className="text-gray-500">The page you are looking for does not exist.</p>
      <Button onClick={() => navigate('/dashboard')} className="bg-green-600 hover:bg-green-700">
        Go to Dashboard
      </Button>
    </div>
  )
}

// ============================================================================
// LAYOUT — Sidebar + Top Bar + Content
// ============================================================================

function Layout() {
  const { user, logout, hasPermission, canDelete } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    try {
      const kpis = await db.getDashboardKPIs()
      const alerts = kpis?.alerts || []
      setNotifications(alerts.map((alert: any) => ({
        id: alert.id || String(Date.now()),
        type: alert.type || 'info',
        message: alert.message || '',
        severity: alert.severity || 'medium',
        createdAt: alert.createdAt || new Date().toISOString(),
        read: false,
      })))
    } catch {
      setNotifications([])
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getSeverityColor = (severity: Notification['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  // Listen for custom navigate events from Dashboard quick actions
  useEffect(() => {
    const handleNavigate = (event: CustomEvent<string>) => {
      const path = event.detail
      if (ROUTES.some(r => r.path === path)) {
        navigate(path)
      }
    }
    window.addEventListener('navigate', handleNavigate as EventListener)
    return () => window.removeEventListener('navigate', handleNavigate as EventListener)
  }, [navigate])

  const getModuleTitle = () => {
    const route = ROUTES.find(r => r.path === location.pathname)
    return route?.label || 'Dashboard'
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-tight">EcoRecycle</h1>
              <p className="text-xs text-gray-500">Factory Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-3 space-y-1">
            {NAV_GROUPS.map((group, gi) => (
              <div key={gi} className="mb-3">
                {group.label && (
                  <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items
                    .filter(item => {
                      if (item.adminOnly && !canDelete()) return false
                      return hasPermission(item.permission as any)
                    })
                    .map(item => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-green-50 text-green-700"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon className={cn(
                              "w-5 h-5 shrink-0",
                              isActive ? "text-green-600" : "text-gray-400"
                            )} />
                            <span className="truncate">{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-sm font-bold text-green-700">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize truncate">{user?.role?.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" size="sm" onClick={() => { logout(); setSidebarOpen(false) }}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900">{getModuleTitle()}</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="flex items-center justify-between p-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={markAllAsRead}>
                        <Check className="w-3 h-3 mr-1" /> Mark all read
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="max-h-80">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map(n => (
                          <div key={n.id} className={cn("p-3 hover:bg-gray-50 transition-colors cursor-pointer", !n.read && "bg-blue-50/50")} onClick={() => markAsRead(n.id)}>
                            <div className="flex items-start gap-3">
                              <div className={cn("p-2 rounded-lg shrink-0", getSeverityColor(n.severity))}>
                                <Bell className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-sm", !n.read ? "font-medium text-gray-900" : "text-gray-700")}>{n.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                              </div>
                              {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vendors" element={<VendorModule />} />
            <Route path="/procurement" element={<SupplyChainModule />} />
            <Route path="/warehouse" element={<OperationsModule />} />
            <Route path="/production" element={<ProductionModule />} />
            <Route path="/batch-control" element={<BatchControlModule />} />
            <Route path="/monitor" element={<ProductionMonitor />} />
            <Route path="/shifts" element={<ShiftScheduling />} />
            <Route path="/goods-receipt" element={<PurchaseReceipt />} />
            <Route path="/finance" element={<FinanceModule />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/alerts" element={<AlertSystem />} />
            <Route path="/tickets" element={<TicketsModule />} />
            <Route path="/reports" element={<ReportsModule />} />
            <Route path="/audit" element={<AuditTrail />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

// ============================================================================
// APP — Entry Point with Auth Routing
// ============================================================================

function AppContent() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // If not authenticated, show login (at /login or any route)
  if (!isAuthenticated) {
    // Allow the login page at /login, redirect all other routes to /login
    if (location.pathname === '/login') {
      return <LoginPage />
    }
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Authenticated: /login should redirect to dashboard
  if (location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />
  }

  // Root path redirects to dashboard
  if (location.pathname === '/') {
    return <Navigate to="/dashboard" replace />
  }

  return <Layout />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
