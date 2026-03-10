// ============================================================================
// DASHBOARD - KPIs, Alerts & Overview
// ============================================================================

import { useEffect, useState } from 'react';
import { db } from '@/services/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  Truck, 
  Banknote,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Factory,
  Scale,
  AlertOctagon,
  Download,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Alert } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DashboardData {
  totalInputKg: number;
  totalOutputKg: number;
  overallYield: number;
  revenue: number;
  totalCosts: number;
  grossProfit: number;
  avgCostPerKg: number;
  stockOnHand: Record<string, number>;
  activeWorkers: number;
  totalWagesToday: number;
  avgProductivity: number;
  alerts: Alert[];
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const kpis = await db.getDashboardKPIs();
    setData(kpis);
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG')}`;
  };

  const formatWeight = (kg: number) => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)}t`;
    }
    return `${kg.toFixed(0)}kg`;
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'loss_threshold':
        return <Scale className="w-4 h-4" />;
      case 'margin_compression':
        return <TrendingDown className="w-4 h-4" />;
      case 'low_stock':
        return <Package className="w-4 h-4" />;
      case 'missing_checkpoint':
        return <Clock className="w-4 h-4" />;
      case 'negative_stock':
        return <AlertOctagon className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const profitMargin = data.revenue > 0 ? (data.grossProfit / data.revenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Factory Overview</h2>
            <p className="text-green-100">Real-time visibility into your recycling operations</p>
          </div>
          <div className="hidden sm:block">
            <Factory className="w-16 h-16 text-green-200 opacity-50" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Input"
          value={formatWeight(data.totalInputKg)}
          subtitle={`${formatWeight(data.totalInputKg - data.totalOutputKg)} in process`}
          icon={Package}
          color="blue"
        />
        <KPICard
          title="Total Output"
          value={formatWeight(data.totalOutputKg)}
          subtitle={`${data.overallYield.toFixed(1)}% yield`}
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          title="Revenue"
          value={formatCurrency(data.revenue)}
          subtitle={`${profitMargin.toFixed(1)}% margin`}
          icon={Banknote}
          color="emerald"
        />
        <KPICard
          title="Active Workers"
          value={data.activeWorkers.toString()}
          subtitle={`₦${(data.totalWagesToday / 1000).toFixed(0)}k wages today`}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Alerts Section */}
      {data.alerts.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Active Alerts ({data.alerts.length})
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={loadDashboardData}>
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border",
                    getAlertColor(alert.severity)
                  )}
                >
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs opacity-75">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Production & Financial Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Production Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Factory className="w-5 h-5 text-blue-500" />
              Production Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Overall Yield</span>
                <span className="font-medium">{data.overallYield.toFixed(1)}%</span>
              </div>
              <Progress value={data.overallYield} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Avg Cost/kg</p>
                <p className="text-lg font-semibold">{formatCurrency(data.avgCostPerKg)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Gross Profit</p>
                <p className={cn(
                  "text-lg font-semibold",
                  data.grossProfit >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(data.grossProfit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-500" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.stockOnHand)
                .filter(([_, value]) => value > 0)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([state, quantity]) => (
                  <div key={state} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {state.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ 
                            width: `${Math.min((quantity / data.totalInputKg) * 100 * 3, 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">
                        {formatWeight(quantity)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <QuickActionButton
              label="New Purchase"
              icon={Package}
              href="#procurement"
            />
            <QuickActionButton
              label="Record Sorting"
              icon={Factory}
              href="#sorting"
            />
            <QuickActionButton
              label="Create Dispatch"
              icon={Truck}
              href="#sales"
            />
            <QuickActionButton
              label="View Reports"
              icon={TrendingUp}
              href="#reports"
            />
            <DownloadReportButton data={data} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'emerald' | 'purple' | 'orange' | 'red';
}

function KPICard({ title, value, subtitle, icon: Icon, color }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={cn("p-2 rounded-lg", colorClasses[color])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ label, icon: Icon, href }: { label: string; icon: React.ElementType; href: string }) {
  return (
    <button
      onClick={() => {
        const module = href.replace('#', '');
        // Dispatch custom event to navigate
        window.dispatchEvent(new CustomEvent('navigate', { detail: module }));
      }}
      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
    >
      <Icon className="w-6 h-6 text-gray-600" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <ArrowRight className="w-4 h-4 text-gray-400" />
    </button>
  );
}

function DownloadReportButton({ data }: { data: DashboardData }) {
  const downloadReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('EcoRecycle Factory', 14, 20);
    doc.setFontSize(16);
    doc.text('Dashboard Summary Report', 14, 32);
    
    // Report info
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 50);
    
    // KPI Summary
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.text('Key Performance Indicators', 14, 65);
    
    const formatCurrency = (amount: number) => `₦${amount.toLocaleString('en-NG')}`;
    const formatWeight = (kg: number) => kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${kg.toFixed(0)}kg`;
    const profitMargin = data.revenue > 0 ? (data.grossProfit / data.revenue) * 100 : 0;
    
    const kpiData = [
      ['Total Input', formatWeight(data.totalInputKg)],
      ['Total Output', formatWeight(data.totalOutputKg)],
      ['Overall Yield', `${data.overallYield.toFixed(1)}%`],
      ['Revenue', formatCurrency(data.revenue)],
      ['Gross Profit', formatCurrency(data.grossProfit)],
      ['Profit Margin', `${profitMargin.toFixed(1)}%`],
      ['Active Workers', data.activeWorkers.toString()],
      ['Avg Cost/kg', formatCurrency(data.avgCostPerKg)],
    ];
    
    autoTable(doc, {
      startY: 70,
      head: [['Metric', 'Value']],
      body: kpiData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' },
      },
    });
    
    // Inventory Summary
    let currentY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.text('Current Inventory', 14, currentY + 15);
    
    const inventoryData = Object.entries(data.stockOnHand)
      .filter(([_, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([state, quantity]) => [
        state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        formatWeight(quantity),
      ]);
    
    autoTable(doc, {
      startY: currentY + 20,
      head: [['Material', 'Quantity']],
      body: inventoryData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' },
      },
    });
    
    // Alerts Section
    if (data.alerts.length > 0) {
      currentY = (doc as any).lastAutoTable?.finalY || 150;
      if (currentY > 220) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text(`Active Alerts (${data.alerts.length})`, 14, currentY + 15);
      
      const alertData = data.alerts.slice(0, 10).map(alert => [
        alert.severity.toUpperCase(),
        alert.message,
        new Date(alert.createdAt).toLocaleDateString(),
      ]);
      
      autoTable(doc, {
        startY: currentY + 20,
        head: [['Severity', 'Message', 'Date']],
        body: alertData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { halign: 'center', fontStyle: 'bold' },
          2: { halign: 'center' },
        },
      });
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount} - EcoRecycle Factory Management System`, 14, 287);
      doc.text('Confidential', 180, 287);
    }
    
    doc.save(`dashboard-summary-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <button
      onClick={downloadReport}
      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-green-200 bg-green-50 hover:border-green-500 hover:bg-green-100 transition-colors"
    >
      <Download className="w-6 h-6 text-green-600" />
      <span className="text-sm font-medium text-green-700">Download Report</span>
      <FileText className="w-4 h-4 text-green-400" />
    </button>
  );
}
