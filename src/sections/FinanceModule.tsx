// ============================================================================
// FINANCE MODULE — Batch-Linked Cost/Income Analysis
// Every cost and revenue is tied to a specific batch for true P&L per production run
// ============================================================================

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Receipt, TrendingUp, TrendingDown, DollarSign, Truck,
  Plus, AlertTriangle, FileText, Package, CheckCircle,
  Landmark, ArrowRightLeft, Wallet, Banknote, User
} from 'lucide-react';

// ============================================================================
// MOCK DATA — Linked to actual batch production
// Batch 001: B-PET-2025-001 — 5,000kg → 3,890kg bagged (complete)
// Batch 002: B-PET-2025-002 — 5,200kg → in progress (washing)
// Batch 003: B-HDPE-2025-001 — 3,000kg → sorting only
// Batch 004: B-HDPE-2025-002 — 3,150kg → 2,340kg bagged (complete, drying failed QC)
// ============================================================================

interface BatchCostRecord {
  id: string;
  batchId: string;
  batchNumber: string;
  materialType: string;
  inputKg: number;
  outputKg: number;        // bagged dry weight
  status: 'in_progress' | 'completed' | 'dispatched';
}

const BATCH_RECORDS: BatchCostRecord[] = [
  { id: 'b1', batchId: 'batch-001', batchNumber: 'B-PET-2025-001', materialType: 'PET Green', inputKg: 5000, outputKg: 3859, status: 'dispatched' },
  { id: 'b2', batchId: 'batch-002', batchNumber: 'B-PET-2025-002', materialType: 'PET Clear', inputKg: 5200, outputKg: 0, status: 'in_progress' },
  { id: 'b3', batchId: 'batch-003', batchNumber: 'B-HDPE-2025-001', materialType: 'HDPE', inputKg: 3000, outputKg: 0, status: 'in_progress' },
  { id: 'b4', batchId: 'batch-004', batchNumber: 'B-HDPE-2025-002', materialType: 'HDPE', inputKg: 3150, outputKg: 2148, status: 'completed' },
];

// EXPENSES — All linked to specific batches with account & payment tracking
interface FinExpense {
  id: string;
  category: 'materials' | 'labour' | 'logistics' | 'utilities' | 'fuel' | 'maintenance' | 'rent' | 'other';
  amount: number;
  description: string;
  date: string;
  batchId: string;
  batchNumber: string;
  // Payment tracking (we paid someone)
  accountName: string;
  paymentMethod: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  amountPaid: number;
  paidDate?: string;
  vendorName?: string;
}

const MOCK_EXPENSES: FinExpense[] = [
  // === BATCH 001: B-PET-2025-001 (PET Green) ===
  { id: 'e1', category: 'materials', amount: 380000, description: 'GRN-2025-001 — Adebayo Musa (4,000kg @ ₦95/kg)', date: '2025-07-01', batchId: 'batch-001', batchNumber: 'B-PET-2025-001', accountName: 'EcoBank Current', paymentMethod: 'bank_transfer', paymentStatus: 'paid', amountPaid: 380000, paidDate: '2025-07-02', vendorName: 'Adebayo Musa' },
  { id: 'e2', category: 'labour', amount: 18000, description: 'Sorting wages (6 workers × ₦3,000)', date: '2025-07-01', batchId: 'batch-001', batchNumber: 'B-PET-2025-001', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 18000, paidDate: '2025-07-01', vendorName: 'Sorting Team' },
  { id: 'e3', category: 'labour', amount: 12000, description: 'Grinding operator shift (2 shifts)', date: '2025-07-01', batchId: 'batch-001', batchNumber: 'B-PET-2025-001', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 12000, paidDate: '2025-07-01', vendorName: 'Oluwaseun K.' },
  { id: 'e4', category: 'utilities', amount: 45000, description: 'Electricity — grinding & washing', date: '2025-07-02', batchId: 'batch-001', batchNumber: 'B-PET-2025-001', accountName: 'EcoBank Current', paymentMethod: 'bank_transfer', paymentStatus: 'paid', amountPaid: 45000, paidDate: '2025-07-05', vendorName: 'IBEDC' },
  { id: 'e5', category: 'fuel', amount: 28000, description: 'Diesel for dryer generator', date: '2025-07-02', batchId: 'batch-001', batchNumber: 'B-PET-2025-001', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 28000, paidDate: '2025-07-02', vendorName: 'Oando Filling Station' },
  { id: 'e6', category: 'labour', amount: 10000, description: 'Washing & drying shifts', date: '2025-07-02', batchId: 'batch-001', batchNumber: 'B-PET-2025-001', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 10000, paidDate: '2025-07-02', vendorName: 'Chioma N. / Emmanuel T.' },
  { id: 'e7', category: 'labour', amount: 8000, description: 'Bagging & weighing labour', date: '2025-07-02', batchId: 'batch-001', batchNumber: 'B-PET-2025-001', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 8000, paidDate: '2025-07-02', vendorName: 'Fatima A.' },
  { id: 'e8', category: 'utilities', amount: 8000, description: 'Water for wet grinding', date: '2025-07-01', batchId: 'batch-001', batchNumber: 'B-PET-2025-001', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 8000, paidDate: '2025-07-01', vendorName: 'Osun Water Corp' },
  { id: 'e9', category: 'logistics', amount: 25000, description: 'Transport from Adebayo Musa collection point', date: '2025-07-01', batchId: 'batch-001', batchNumber: 'B-PET-2025-001', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 25000, paidDate: '2025-07-01', vendorName: 'Adebayo Musa (incl. transport)' },

  // === BATCH 002: B-PET-2025-002 (PET Clear) — IN PROGRESS ===
  { id: 'e10', category: 'materials', amount: 275000, description: 'GRN-2025-002 — Olaoluwa Plastics (2,500kg @ ₦110/kg)', date: '2025-07-03', batchId: 'batch-002', batchNumber: 'B-PET-2025-002', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'partial', amountPaid: 150000, paidDate: '2025-07-04', vendorName: 'Olaoluwa Plastics' },
  { id: 'e11', category: 'labour', amount: 19000, description: 'Sorting wages (6.5 workers)', date: '2025-07-03', batchId: 'batch-002', batchNumber: 'B-PET-2025-002', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 19000, paidDate: '2025-07-03', vendorName: 'Sorting Team' },
  { id: 'e12', category: 'labour', amount: 12000, description: 'Grinding operator shift', date: '2025-07-03', batchId: 'batch-002', batchNumber: 'B-PET-2025-002', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 12000, paidDate: '2025-07-03', vendorName: 'Oluwaseun K.' },
  { id: 'e13', category: 'utilities', amount: 35000, description: 'Electricity — grinding', date: '2025-07-03', batchId: 'batch-002', batchNumber: 'B-PET-2025-002', accountName: 'EcoBank Current', paymentMethod: 'bank_transfer', paymentStatus: 'unpaid', amountPaid: 0, vendorName: 'IBEDC' },
  { id: 'e14', category: 'utilities', amount: 6000, description: 'Water for wet grinding', date: '2025-07-03', batchId: 'batch-002', batchNumber: 'B-PET-2025-002', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 6000, paidDate: '2025-07-03', vendorName: 'Osun Water Corp' },
  { id: 'e15', category: 'labour', amount: 11000, description: 'Washing shift', date: '2025-07-04', batchId: 'batch-002', batchNumber: 'B-PET-2025-002', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 11000, paidDate: '2025-07-04', vendorName: 'Chioma N.' },

  // === BATCH 003: B-HDPE-2025-001 — SORTING ONLY ===
  { id: 'e16', category: 'materials', amount: 117000, description: 'GRN-2025-004 — RecycleHub (1,300kg @ ₦90/kg)', date: '2025-07-06', batchId: 'batch-003', batchNumber: 'B-HDPE-2025-001', accountName: 'FirstBank Business', paymentMethod: 'bank_transfer', paymentStatus: 'paid', amountPaid: 117000, paidDate: '2025-07-07', vendorName: 'RecycleHub' },
  { id: 'e17', category: 'labour', amount: 15000, description: 'Sorting wages (5 workers)', date: '2025-07-05', batchId: 'batch-003', batchNumber: 'B-HDPE-2025-001', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 15000, paidDate: '2025-07-05', vendorName: 'Sorting Team' },

  // === BATCH 004: B-HDPE-2025-002 — COMPLETE ===
  { id: 'e18', category: 'materials', amount: 132000, description: 'GRN-2025-003 — Iya Kemi (1,500kg @ ₦88/kg)', date: '2025-07-05', batchId: 'batch-004', batchNumber: 'B-HDPE-2025-002', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'unpaid', amountPaid: 0, vendorName: 'Iya Kemi' },
  { id: 'e19', category: 'labour', amount: 14000, description: 'Sorting wages', date: '2025-07-02', batchId: 'batch-004', batchNumber: 'B-HDPE-2025-002', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 14000, paidDate: '2025-07-02', vendorName: 'Sorting Team' },
  { id: 'e20', category: 'labour', amount: 10000, description: 'Grinding operator', date: '2025-07-02', batchId: 'batch-004', batchNumber: 'B-HDPE-2025-002', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 10000, paidDate: '2025-07-02', vendorName: 'Oluwaseun K.' },
  { id: 'e21', category: 'utilities', amount: 30000, description: 'Electricity — all stages', date: '2025-07-02', batchId: 'batch-004', batchNumber: 'B-HDPE-2025-002', accountName: 'EcoBank Current', paymentMethod: 'bank_transfer', paymentStatus: 'paid', amountPaid: 30000, paidDate: '2025-07-05', vendorName: 'IBEDC' },
  { id: 'e22', category: 'fuel', amount: 22000, description: 'Diesel — dryer ran longer due to high moisture', date: '2025-07-03', batchId: 'batch-004', batchNumber: 'B-HDPE-2025-002', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 22000, paidDate: '2025-07-03', vendorName: 'Oando Filling Station' },
  { id: 'e23', category: 'labour', amount: 9000, description: 'Washing shift', date: '2025-07-03', batchId: 'batch-004', batchNumber: 'B-HDPE-2025-002', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 9000, paidDate: '2025-07-03', vendorName: 'Chioma N.' },
  { id: 'e24', category: 'labour', amount: 8000, description: 'Drying & bagging', date: '2025-07-03', batchId: 'batch-004', batchNumber: 'B-HDPE-2025-002', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 8000, paidDate: '2025-07-03', vendorName: 'Emmanuel T. / Fatima A.' },
  { id: 'e25', category: 'maintenance', amount: 15000, description: 'Dryer repair — DRY-02 overheated', date: '2025-07-03', batchId: 'batch-004', batchNumber: 'B-HDPE-2025-002', accountName: 'Cash Box', paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 15000, paidDate: '2025-07-03', vendorName: 'Tunde Mechanic' },

  // === OVERHEAD (not batch-specific) ===
  { id: 'e26', category: 'rent', amount: 150000, description: 'Factory rent — July', date: '2025-07-01', batchId: '', batchNumber: 'Overhead', accountName: 'EcoBank Current', paymentMethod: 'bank_transfer', paymentStatus: 'paid', amountPaid: 150000, paidDate: '2025-07-01', vendorName: 'Landlord' },
  { id: 'e27', category: 'other', amount: 25000, description: 'SOP compliance audit', date: '2025-07-05', batchId: '', batchNumber: 'Overhead', accountName: 'FirstBank Business', paymentMethod: 'bank_transfer', paymentStatus: 'paid', amountPaid: 25000, paidDate: '2025-07-05', vendorName: 'Compliance Consultant' },
];

// DISPATCHES — Revenue from sales, linked to batches (BUYER PAYS US)
interface FinDispatch {
  id: string;
  dispatchNumber: string;
  batchIds: string[];
  batchNumbers: string[];
  buyerName: string;
  totalWeight: number;
  pricePerKg: number;
  totalValue: number;
  handlingCost: number;
  deliveryCost: number;
  status: 'dispatched' | 'delivered' | 'confirmed';
  // Incoming payment (buyer pays US)
  paymentStatus: 'pending' | 'partial' | 'paid';
  amountPaid: number;
  amountOutstanding: number;
  paymentReceivedDate?: string;
  receivedIntoAccount?: string;
  profit: number;
  dispatchDate: string;
}

const MOCK_DISPATCHES: FinDispatch[] = [
  {
    id: 'd1', dispatchNumber: 'DSP-2025-001', batchIds: ['batch-001'], batchNumbers: ['B-PET-2025-001'],
    buyerName: 'GreenBuy Industries', totalWeight: 3859, pricePerKg: 450, totalValue: 1736550,
    handlingCost: 15000, deliveryCost: 35000, status: 'confirmed',
    paymentStatus: 'paid', amountPaid: 1736550, amountOutstanding: 0,
    paymentReceivedDate: '2025-07-10', receivedIntoAccount: 'EcoBank Current (0123456789)',
    profit: 0, dispatchDate: '2025-07-08',
  },
  {
    id: 'd2', dispatchNumber: 'DSP-2025-002', batchIds: ['batch-004'], batchNumbers: ['B-HDPE-2025-002'],
    buyerName: 'RecycleCorp International', totalWeight: 2148, pricePerKg: 430, totalValue: 923640,
    handlingCost: 12000, deliveryCost: 28000, status: 'delivered',
    paymentStatus: 'partial', amountPaid: 400000, amountOutstanding: 523640,
    paymentReceivedDate: '2025-07-12', receivedIntoAccount: 'FirstBank Business (9876543210)',
    profit: 0, dispatchDate: '2025-07-10',
  },
  {
    id: 'd3', dispatchNumber: 'DSP-2025-003', batchIds: ['batch-001'], batchNumbers: ['B-PET-2025-001'],
    buyerName: 'Plastics Nigeria Ltd', totalWeight: 0, pricePerKg: 0, totalValue: 0,
    handlingCost: 0, deliveryCost: 0, status: 'dispatched',
    paymentStatus: 'pending', amountPaid: 0, amountOutstanding: 0,
    profit: 0, dispatchDate: '2025-07-15',
  },
];

const EXPENSE_CATEGORIES: Record<string, { label: string; color: string; icon: any }> = {
  materials: { label: 'Materials', color: 'bg-blue-100 text-blue-800', icon: Package },
  labour: { label: 'Labour', color: 'bg-green-100 text-green-800', icon: User },
  logistics: { label: 'Logistics', color: 'bg-purple-100 text-purple-800', icon: Truck },
  utilities: { label: 'Utilities', color: 'bg-yellow-100 text-yellow-800', icon: Landmark },
  maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  rent: { label: 'Rent', color: 'bg-pink-100 text-pink-800', icon: Landmark },
  fuel: { label: 'Fuel', color: 'bg-red-100 text-red-800', icon: Truck },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800', icon: FileText },
};

export function FinanceModule() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');

  // Filter expenses by batch
  const filteredExpenses = selectedBatch === 'all'
    ? MOCK_EXPENSES
    : MOCK_EXPENSES.filter(e => e.batchId === selectedBatch || e.batchId === '');

  const filteredDispatches = selectedBatch === 'all'
    ? MOCK_DISPATCHES
    : MOCK_DISPATCHES.filter(d => d.batchIds.includes(selectedBatch));

  // Totals
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalRevenue = filteredDispatches.reduce((s, d) => s + d.totalValue, 0);
  const totalHandlingDelivery = filteredDispatches.reduce((s, d) => s + d.handlingCost + d.deliveryCost, 0);
  const totalOutgoingPaid = filteredExpenses.reduce((s, e) => s + e.amountPaid, 0);
  const totalOutgoingUnpaid = filteredExpenses.reduce((s, e) => s + (e.amount - e.amountPaid), 0);
  const totalIncomingPaid = filteredDispatches.reduce((s, d) => s + d.amountPaid, 0);
  const totalIncomingUnpaid = filteredDispatches.reduce((s, d) => s + d.amountOutstanding, 0);

  // Profit = Revenue - All Costs (including handling/delivery)
  const grossProfit = totalRevenue - totalExpenses - totalHandlingDelivery;

  // Cost breakdown
  const costByCategory: Record<string, number> = {};
  filteredExpenses.forEach(e => {
    costByCategory[e.category] = (costByCategory[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Finance & Accounting</h2>
          <p className="text-sm text-gray-500">Batch-linked cost/income analysis — every naira traced to a production run</p>
        </div>
        <div className="flex gap-2 items-center">
          <Label className="text-sm whitespace-nowrap">Filter by Batch:</Label>
          <select
            className="p-2 border rounded-md text-sm"
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
          >
            <option value="all">All Batches + Overhead</option>
            {BATCH_RECORDS.map(b => (
              <option key={b.id} value={b.batchId}>{b.batchNumber} — {b.materialType}</option>
            ))}
            <option value="">Overhead Only</option>
          </select>
        </div>
      </div>

      {/* P&L Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-500">Revenue</p>
            </div>
            <p className="text-2xl font-bold text-green-600">₦{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-400">{filteredDispatches.length} dispatch{filteredDispatches.length !== 1 ? 'es' : ''}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-500">Total Costs</p>
            </div>
            <p className="text-2xl font-bold text-red-600">₦{totalExpenses.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Material + labour + utilities + fuel + etc.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-500">Gross Profit</p>
            </div>
            <p className={`text-2xl font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₦{grossProfit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">
              Margin: {totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-500">Net Cash Position</p>
            </div>
            <p className={`text-2xl font-bold ${totalIncomingPaid - totalOutgoingPaid >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₦{(totalIncomingPaid - totalOutgoingPaid).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">In: ₦{totalIncomingPaid.toLocaleString()} — Out: ₦{totalOutgoingPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Paid to Sellers</p>
            </div>
            <p className="text-xl font-bold text-green-700">₦{totalOutgoingPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-600">Owed to Sellers</p>
            </div>
            <p className="text-xl font-bold text-red-700">₦{totalOutgoingUnpaid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Received from Buyers</p>
            </div>
            <p className="text-xl font-bold text-green-700">₦{totalIncomingPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-gray-600">Owed by Buyers</p>
            </div>
            <p className="text-xl font-bold text-yellow-700">₦{totalIncomingUnpaid.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview"><FileText className="w-4 h-4 mr-1" /> P&L Overview</TabsTrigger>
          <TabsTrigger value="batches"><Package className="w-4 h-4 mr-1" /> Per-Batch P&L</TabsTrigger>
          <TabsTrigger value="expenses"><Receipt className="w-4 h-4 mr-1" /> Expenses</TabsTrigger>
          <TabsTrigger value="sales"><Truck className="w-4 h-4 mr-1" /> Sales & Dispatch</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab
            costByCategory={costByCategory}
            totalRevenue={totalRevenue}
            totalExpenses={totalExpenses}
            totalHandlingDelivery={totalHandlingDelivery}
            grossProfit={grossProfit}
            filteredExpenses={filteredExpenses}
          />
        </TabsContent>

        <TabsContent value="batches">
          <PerBatchPLTab />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpensesTab expenses={filteredExpenses} />
        </TabsContent>

        <TabsContent value="sales">
          <SalesTab dispatches={filteredDispatches} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// P&L OVERVIEW TAB
// ============================================================================

function OverviewTab({ costByCategory, totalRevenue, totalExpenses, totalHandlingDelivery, grossProfit, filteredExpenses }: any) {
  const maxCost = Math.max(...Object.values(costByCategory) as number[], 1);

  // Calculate cost per kg of output for completed batches
  const completedBatches = BATCH_RECORDS.filter(b => b.outputKg > 0);
  const totalOutput = completedBatches.reduce((s, b) => s + b.outputKg, 0);
  const materialCosts = filteredExpenses.filter((e: FinExpense) => e.category === 'materials').reduce((s: number, e: FinExpense) => s + e.amount, 0);
  const nonMaterialCosts = totalExpenses - materialCosts;

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Cost Breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Cost Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(costByCategory).map(([cat, amount]: [string, any]) => {
              const pct = ((amount / totalExpenses) * 100).toFixed(1);
              const info = EXPENSE_CATEGORIES[cat] || { label: cat, color: 'bg-gray-100' };
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={info.color}>{info.label}</Badge>
                    <span className="text-sm font-medium">₦{amount.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full transition-all" style={{ width: `${(amount / maxCost) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* P&L Summary */}
        <Card>
          <CardHeader><CardTitle className="text-lg">P&L Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-green-600 font-medium">Revenue (Sales)</span>
              <span className="font-bold">₦{totalRevenue.toLocaleString()}</span>
            </div>
            <div className="space-y-1">
              {Object.entries(costByCategory).map(([cat, amount]: [string, any]) => (
                <div key={cat} className="flex justify-between text-sm">
                  <span className="text-gray-600">{EXPENSE_CATEGORIES[cat]?.label || cat}</span>
                  <span>₦{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between py-2 border-t">
              <span className="font-medium">Subtotal Costs</span>
              <span className="font-bold text-red-600">₦{totalExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Handling + Delivery</span>
              <span>₦{totalHandlingDelivery.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className={`font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {grossProfit >= 0 ? 'Gross Profit' : 'Gross Loss'}
              </span>
              <span className={`font-bold text-xl ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₦{grossProfit.toLocaleString()}
              </span>
            </div>
            {totalOutput > 0 && (
              <div className="p-2 bg-blue-50 rounded text-sm">
                <span className="text-blue-700">Cost per kg of output: </span>
                <span className="font-bold text-blue-800">₦{Math.round(totalExpenses / totalOutput)}/kg</span>
                <span className="text-blue-600"> (materials only: ₦{Math.round(materialCosts / totalOutput)}/kg)</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// PER-BATCH P&L TAB
// ============================================================================

function PerBatchPLTab() {
  return (
    <div className="space-y-4">
      {BATCH_RECORDS.map(batch => {
        const expenses = MOCK_EXPENSES.filter(e => e.batchId === batch.batchId);
        const dispatches = MOCK_DISPATCHES.filter(d => d.batchIds.includes(batch.batchId));
        const materialCost = expenses.filter(e => e.category === 'materials').reduce((s, e) => s + e.amount, 0);
        const labourCost = expenses.filter(e => e.category === 'labour').reduce((s, e) => s + e.amount, 0);
        const utilityCost = expenses.filter(e => e.category === 'utilities').reduce((s, e) => s + e.amount, 0);
        const fuelCost = expenses.filter(e => e.category === 'fuel').reduce((s, e) => s + e.amount, 0);
        const logisticsCost = expenses.filter(e => e.category === 'logistics').reduce((s, e) => s + e.amount, 0);
        const maintenanceCost = expenses.filter(e => e.category === 'maintenance').reduce((s, e) => s + e.amount, 0);
        const otherCost = expenses.filter(e => !['materials', 'labour', 'utilities', 'fuel', 'logistics', 'maintenance'].includes(e.category)).reduce((s, e) => s + e.amount, 0);
        const totalCost = expenses.reduce((s, e) => s + e.amount, 0);
        const revenue = dispatches.reduce((s, d) => s + d.totalValue, 0);
        const handlingDelivery = dispatches.reduce((s, d) => s + d.handlingCost + d.deliveryCost, 0);
        const profit = revenue - totalCost - handlingDelivery;
        const materialCostPerKg = batch.inputKg > 0 ? Math.round(materialCost / batch.inputKg) : 0;
        const totalCostPerKg = batch.outputKg > 0 ? Math.round(totalCost / batch.outputKg) : 0;

        return (
          <Card key={batch.id} className={profit >= 0 ? 'border-green-200' : 'border-red-200'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{batch.batchNumber}</CardTitle>
                  <p className="text-sm text-gray-500">{batch.materialType} • {batch.inputKg.toLocaleString()}kg in → {batch.outputKg > 0 ? `${batch.outputKg.toLocaleString()}kg out` : 'In progress'}</p>
                </div>
                <Badge className={batch.status === 'dispatched' ? 'bg-green-100 text-green-800' : batch.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                  {batch.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-3 gap-4">
                {/* Costs */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-700 flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Costs</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Materials</span><span>₦{materialCost.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Labour</span><span>₦{labourCost.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Utilities</span><span>₦{utilityCost.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Fuel</span><span>₦{fuelCost.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Logistics</span><span>₦{logisticsCost.toLocaleString()}</span></div>
                    {maintenanceCost > 0 && <div className="flex justify-between"><span className="text-gray-600">Maintenance</span><span>₦{maintenanceCost.toLocaleString()}</span></div>}
                    {otherCost > 0 && <div className="flex justify-between"><span className="text-gray-600">Other</span><span>₦{otherCost.toLocaleString()}</span></div>}
                    <div className="flex justify-between border-t pt-1 font-bold"><span>Total Cost</span><span>₦{totalCost.toLocaleString()}</span></div>
                  </div>
                  {batch.inputKg > 0 && (
                    <p className="text-xs text-gray-500">Material cost: ₦{materialCostPerKg}/kg input</p>
                  )}
                </div>

                {/* Revenue */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Revenue</h4>
                  {dispatches.length > 0 ? dispatches.map(d => (
                    <div key={d.id} className="text-sm space-y-1">
                      <div className="flex justify-between"><span className="text-gray-600">{d.buyerName}</span><span>{d.totalWeight.toLocaleString()}kg</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">@ ₦{d.pricePerKg}/kg</span><span className="font-bold text-green-600">₦{d.totalValue.toLocaleString()}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-500">Handling + Delivery</span><span>₦{(d.handlingCost + d.deliveryCost).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Payment</span><PaymentInBadge dispatch={d} /></div>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 italic">No dispatches yet</p>
                  )}
                  {dispatches.length > 0 && (
                    <div className="flex justify-between border-t pt-1 font-bold"><span>Total Revenue</span><span>₦{revenue.toLocaleString()}</span></div>
                  )}
                </div>

                {/* Result */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-700 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Result</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between"><span className="text-gray-600">Revenue</span><span>₦{revenue.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Total Costs</span><span className="text-red-600">-₦{totalCost.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">H/D Costs</span><span className="text-red-600">-₦{handlingDelivery.toLocaleString()}</span></div>
                    <div className="flex justify-between border-t pt-1 font-bold text-lg">
                      <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>{profit >= 0 ? 'Profit' : 'Loss'}</span>
                      <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>₦{Math.abs(profit).toLocaleString()}</span>
                    </div>
                    {batch.outputKg > 0 && revenue > 0 && (
                      <p className="text-xs text-gray-500">Profit per kg: ₦{Math.round(profit / batch.outputKg)}/kg</p>
                    )}
                    {batch.outputKg > 0 && (
                      <p className="text-xs text-gray-500">Total cost per kg out: ₦{totalCostPerKg}/kg</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Overhead */}
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader><CardTitle className="text-lg">Overhead (Not Batch-Specific)</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left py-2">Category</th><th className="text-left">Description</th><th className="text-right">Amount</th><th className="text-center">Payment</th></tr></thead>
              <tbody>
                {MOCK_EXPENSES.filter(e => e.batchId === '').map(e => {
                  const info = EXPENSE_CATEGORIES[e.category] || { label: e.category, color: 'bg-gray-100' };
                  return (
                    <tr key={e.id} className="border-b hover:bg-gray-50">
                      <td className="py-2"><Badge className={info.color}>{info.label}</Badge></td>
                      <td>{e.description}</td>
                      <td className="text-right font-medium">₦{e.amount.toLocaleString()}</td>
                      <td className="text-center"><PaymentOutBadge expense={e} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// EXPENSES TAB
// ============================================================================

function ExpensesTab({ expenses }: { expenses: FinExpense[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Expense Records</CardTitle>
        <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="w-4 h-4 mr-1" /> Add Expense</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Category</th>
                <th className="text-left">Description</th>
                <th className="text-left">Batch</th>
                <th className="text-left">Date</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Payment</th>
                <th className="text-left">Paid From</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => {
                const info = EXPENSE_CATEGORIES[e.category] || { label: e.category, color: 'bg-gray-100' };
                return (
                  <tr key={e.id} className="border-b hover:bg-gray-50">
                    <td className="py-2"><Badge className={info.color}>{info.label}</Badge></td>
                    <td className="py-2">{e.description}</td>
                    <td className="py-2 text-xs">{e.batchNumber || 'Overhead'}</td>
                    <td className="py-2 text-xs">{e.date}</td>
                    <td className="text-right py-2 font-medium">₦{e.amount.toLocaleString()}</td>
                    <td className="text-center py-2"><PaymentOutBadge expense={e} /></td>
                    <td className="py-2 text-xs">{e.accountName}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SALES TAB
// ============================================================================

function SalesTab({ dispatches }: { dispatches: FinDispatch[] }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Dispatch & Sales Records</CardTitle>
          <Button size="sm" className="bg-green-600 hover:bg-green-700"><Plus className="w-4 h-4 mr-1" /> Create Dispatch</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Dispatch #</th>
                  <th className="text-left">Buyer</th>
                  <th className="text-left">Batch</th>
                  <th className="text-right">Weight</th>
                  <th className="text-right">Price/kg</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">H/D</th>
                  <th className="text-center">Incoming Payment</th>
                  <th className="text-left">Into Account</th>
                </tr>
              </thead>
              <tbody>
                {dispatches.map(d => (
                  <tr key={d.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{d.dispatchNumber}</td>
                    <td className="py-2">{d.buyerName}</td>
                    <td className="py-2 text-xs">{d.batchNumbers.join(', ')}</td>
                    <td className="text-right py-2">{d.totalWeight.toLocaleString()} kg</td>
                    <td className="text-right py-2">₦{d.pricePerKg}</td>
                    <td className="text-right py-2 font-medium">₦{d.totalValue.toLocaleString()}</td>
                    <td className="text-right py-2 text-gray-500">₦{(d.handlingCost + d.deliveryCost).toLocaleString()}</td>
                    <td className="text-center py-2"><PaymentInBadge dispatch={d} /></td>
                    <td className="py-2 text-xs">{d.receivedIntoAccount || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// BADGES
// ============================================================================

function PaymentOutBadge({ expense }: { expense: FinExpense }) {
  if (expense.paymentStatus === 'paid') {
    return <Badge className="bg-green-100 text-green-800 text-xs"><CheckCircle className="w-3 h-3 mr-0.5" /> Paid ₦{expense.amountPaid.toLocaleString()}</Badge>;
  }
  if (expense.paymentStatus === 'partial') {
    return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Partial ₦{expense.amountPaid.toLocaleString()}</Badge>;
  }
  return <Badge className="bg-red-100 text-red-800 text-xs">Unpaid ₦{expense.amount.toLocaleString()}</Badge>;
}

function PaymentInBadge({ dispatch }: { dispatch: FinDispatch }) {
  if (dispatch.paymentStatus === 'paid') {
    return <Badge className="bg-green-100 text-green-800 text-xs"><CheckCircle className="w-3 h-3 mr-0.5" /> Paid</Badge>;
  }
  if (dispatch.paymentStatus === 'partial') {
    return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Partial ₦{dispatch.amountPaid.toLocaleString()}</Badge>;
  }
  return <Badge className="bg-red-100 text-red-800 text-xs">Pending ₦{dispatch.totalValue.toLocaleString()}</Badge>;
}
