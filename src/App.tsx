// ============================================================================
// RECYCLING FACTORY MANAGEMENT SYSTEM - MAIN APP
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/sections/LoginPage';
import { Dashboard } from '@/sections/Dashboard';
import { VendorModule } from '@/sections/VendorModule';
import { ProcurementModule } from '@/sections/ProcurementModule';
import { LogisticsModule } from '@/sections/LogisticsModule';
import { HandlingModule } from '@/sections/HandlingModule';
import { WarehouseModule } from '@/sections/WarehouseModule';
import { SortingModule } from '@/sections/SortingModule';
import { WagesModule } from '@/sections/WagesModule';
import { ProductionModule } from '@/sections/ProductionModule';
import { ExpensesModule } from '@/sections/ExpensesModule';
import { SalesModule } from '@/sections/SalesModule';
import { ReportsModule } from '@/sections/ReportsModule';
import { AuditTrail } from '@/sections/AuditTrail';
import { UserManagement } from '@/sections/UserManagement';
import { TicketsModule } from '@/sections/TicketsModule';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db } from '@/services/database';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Truck, 
  Hand, 
  Warehouse, 
  Filter, 
  Banknote, 
  Factory, 
  Receipt, 
  TrendingUp, 
  LogOut,
  Menu,
  Bell,
  User,
  History,
  Shield,
  Ticket,
  AlertTriangle,
  CheckCircle,
  Clock,
  Scale,
  AlertOctagon,
  TrendingDown,
  X,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'loss_threshold' | 'margin_compression' | 'low_stock' | 'missing_checkpoint' | 'negative_stock' | 'ticket_created' | 'info';
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  read: boolean;
}

type ModuleType = 
  | 'dashboard'
  | 'vendors'
  | 'procurement'
  | 'logistics'
  | 'handling'
  | 'warehouse'
  | 'sorting'
  | 'wages'
  | 'production'
  | 'expenses'
  | 'sales'
  | 'reports'
  | 'audit'
  | 'users'
  | 'tickets';

interface NavItem {
  id: ModuleType;
  label: string;
  icon: React.ElementType;
  permissions: string[];
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permissions: ['view_dashboard'] },
  { id: 'vendors', label: 'Vendors & Buyers', icon: Users, permissions: ['view_vendors'] },
  { id: 'procurement', label: 'Procurement', icon: ShoppingCart, permissions: ['view_lots'] },
  { id: 'logistics', label: 'Logistics', icon: Truck, permissions: ['view_trips'] },
  { id: 'handling', label: 'Handling', icon: Hand, permissions: ['view_handling'] },
  { id: 'warehouse', label: 'Warehouse', icon: Warehouse, permissions: ['view_batches'] },
  { id: 'sorting', label: 'Sorting', icon: Filter, permissions: ['view_sorting'] },
  { id: 'wages', label: 'Wages', icon: Banknote, permissions: ['view_wages'] },
  { id: 'production', label: 'Production', icon: Factory, permissions: ['view_batches'] },
  { id: 'expenses', label: 'Expenses', icon: Receipt, permissions: ['view_expenses'] },
  { id: 'sales', label: 'Sales & Dispatch', icon: TrendingUp, permissions: ['view_dispatches'] },
  { id: 'tickets', label: 'Tickets', icon: Ticket, permissions: ['view_tickets'] },
  { id: 'reports', label: 'Reports', icon: TrendingUp, permissions: ['view_reports'] },
  { id: 'audit', label: 'Audit Trail', icon: History, permissions: ['view_audit_logs'], roles: ['admin', 'owner'] },
  { id: 'users', label: 'User Management', icon: Shield, permissions: ['manage_users'], roles: ['admin', 'owner'] },
];

function AppContent() {
  const { user, isAuthenticated, logout, hasPermission } = useAuth();
  const [currentModule, setCurrentModule] = useState<ModuleType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Load notifications
  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    const kpis = await db.getDashboardKPIs();
    const alerts = kpis.alerts || [];
    const mappedNotifications: Notification[] = alerts.map((alert: any) => ({
      id: alert.id,
      type: alert.type,
      message: alert.message,
      severity: alert.severity,
      createdAt: alert.createdAt,
      read: false,
    }));
    setNotifications(mappedNotifications);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'loss_threshold': return <Scale className="w-4 h-4" />;
      case 'margin_compression': return <TrendingDown className="w-4 h-4" />;
      case 'low_stock': return <Warehouse className="w-4 h-4" />;
      case 'missing_checkpoint': return <Clock className="w-4 h-4" />;
      case 'negative_stock': return <AlertOctagon className="w-4 h-4" />;
      case 'ticket_created': return <Ticket className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: Notification['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  // Listen for navigation events from Dashboard quick actions
  useEffect(() => {
    const handleNavigate = (event: CustomEvent<string>) => {
      const module = event.detail as ModuleType;
      if (NAV_ITEMS.some(item => item.id === module)) {
        setCurrentModule(module);
      }
    };

    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
    };
  }, []);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const filteredNavItems = NAV_ITEMS.filter(item => {
    const hasRequiredPermission = item.permissions.some(p => hasPermission(p as any));
    const hasRequiredRole = !item.roles || item.roles.includes(user?.role || '');
    return hasRequiredPermission && hasRequiredRole;
  });

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'vendors':
        return <VendorModule />;
      case 'procurement':
        return <ProcurementModule />;
      case 'logistics':
        return <LogisticsModule />;
      case 'handling':
        return <HandlingModule />;
      case 'warehouse':
        return <WarehouseModule />;
      case 'sorting':
        return <SortingModule />;
      case 'wages':
        return <WagesModule />;
      case 'production':
        return <ProductionModule />;
      case 'expenses':
        return <ExpensesModule />;
      case 'sales':
        return <SalesModule />;
      case 'reports':
        return <ReportsModule />;
      case 'audit':
        return <AuditTrail />;
      case 'users':
        return <UserManagement />;
      case 'tickets':
        return <TicketsModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">EcoRecycle</h1>
              <p className="text-xs text-slate-400">Factory Management</p>
            </div>
          </div>
        </div>

        <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentModule(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  currentModule === item.id
                    ? "bg-green-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role.replace('_', ' ')}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-900">
                {NAV_ITEMS.find(i => i.id === currentModule)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="flex items-center justify-between p-3 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs"
                            onClick={markAllAsRead}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Mark all read
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs text-red-600 hover:text-red-700"
                          onClick={clearAll}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Clear
                        </Button>
                      </div>
                    </div>
                    
                    <ScrollArea className="max-h-80">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((notification) => (
                            <div 
                              key={notification.id}
                              className={cn(
                                "p-3 hover:bg-gray-50 transition-colors cursor-pointer",
                                !notification.read && "bg-blue-50/50"
                              )}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "p-2 rounded-lg shrink-0",
                                  getSeverityColor(notification.severity)
                                )}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={cn(
                                    "text-sm",
                                    !notification.read ? "font-medium text-gray-900" : "text-gray-700"
                                  )}>
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    
                    <div className="p-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-sm text-green-600 hover:text-green-700"
                        onClick={() => {
                          setShowNotifications(false);
                          setCurrentModule('dashboard');
                        }}
                      >
                        View all alerts in Dashboard
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Module Content */}
        <div className="p-4 lg:p-6">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
