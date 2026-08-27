// ============================================================================
// SOURCING MODULE — Collector Network, Pricing Bands, Float, Institutional
// Integrated from Bamboo Trybe Sourcing SOP
// ============================================================================

import { useState, useEffect } from 'react';
import { db } from '@/services/database';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SOP_SECTIONS, CATCHMENTS, TIERS, QUALITY_TIERS } from '@/services/sop-data';
import {
  Users, MapPin, DollarSign, HandCoins, Building2, BookOpen,
  Plus, Phone, Camera, TrendingUp, AlertTriangle, CheckCircle,
  ChevronDown, ChevronRight, Search, Filter, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface Collector {
  id: string;
  name: string;
  phone: string;
  catchment: string;
  tier: string;
  photo?: string;
  reference?: string;
  reliabilityScore: number;
  totalDeliveries: number;
  totalKg: number;
  isActive: boolean;
  registeredAt: string;
  notes?: string;
}

interface PricingBand {
  id: string;
  material: string;
  qualityTier: string;
  floorPrice: number;
  ceilingPrice: number;
  effectiveDate: string;
  setBy: string;
  isActive: boolean;
}

interface FloatAdvance {
  id: string;
  collectorId: string;
  collectorName: string;
  amount: number;
  date: string;
  expectedDeliveryKg: number;
  repaymentWindow: number; // days
  balance: number;
  status: 'active' | 'repaid' | 'overdue';
  approvedBy: string;
  createdAt: string;
}

interface InstitutionalAgreement {
  id: string;
  institutionName: string;
  type: string;
  catchment: string;
  contactPerson: string;
  phone: string;
  collectionFrequency: string;
  paymentTerms: string;
  status: 'prospect' | 'negotiating' | 'active' | 'dormant';
  monthlyVolumeKg: number;
  startDate: string;
  reviewDate: string;
  notes?: string;
}

// ============================================================================
// MOCK DATA (until Supabase tables are created)
// ============================================================================

const MOCK_COLLECTORS: Collector[] = [
  { id: '1', name: 'Adebayo Musa', phone: '08012345678', catchment: 'Osogbo metro', tier: 'small_aggregator', reliabilityScore: 85, totalDeliveries: 24, totalKg: 8400, isActive: true, registeredAt: '2025-01-15', notes: 'Reliable, prefers cash on delivery' },
  { id: '2', name: 'Iya Kemi Collection', phone: '08023456789', catchment: 'Ede', tier: 'small_aggregator', reliabilityScore: 72, totalDeliveries: 18, totalKg: 5200, isActive: true, registeredAt: '2025-02-01' },
  { id: '3', name: 'Olaoluwa Plastics', phone: '08034567890', catchment: 'Ilesa', tier: 'large_aggregator', reliabilityScore: 91, totalDeliveries: 32, totalKg: 28000, isActive: true, registeredAt: '2024-11-20', notes: 'Has warehouse, can bale' },
  { id: '4', name: 'Femi Street Picker', phone: '08045678901', catchment: 'Osogbo metro', tier: 'picker', reliabilityScore: 60, totalDeliveries: 45, totalKg: 1200, isActive: true, registeredAt: '2025-03-01' },
  { id: '5', name: 'St. Charles Hospital', phone: '08056789012', catchment: 'Osogbo metro', tier: 'institutional', reliabilityScore: 95, totalDeliveries: 12, totalKg: 3600, isActive: true, registeredAt: '2025-01-10', notes: 'Weekly collection, needs certificate' },
  { id: '6', name: 'Grand Hotel Osogbo', phone: '08067890123', catchment: 'Osogbo metro', tier: 'institutional', reliabilityScore: 88, totalDeliveries: 10, totalKg: 2100, isActive: true, registeredAt: '2025-02-15' },
];

const MOCK_PRICING: PricingBand[] = [
  { id: '1', material: 'PET', qualityTier: 'clean_dry', floorPrice: 220, ceilingPrice: 280, effectiveDate: '2025-07-01', setBy: 'owner', isActive: true },
  { id: '2', material: 'PET', qualityTier: 'standard', floorPrice: 180, ceilingPrice: 220, effectiveDate: '2025-07-01', setBy: 'owner', isActive: true },
  { id: '3', material: 'PET', qualityTier: 'wet_dirty', floorPrice: 120, ceilingPrice: 180, effectiveDate: '2025-07-01', setBy: 'owner', isActive: true },
];

const MOCK_FLOATS: FloatAdvance[] = [
  { id: '1', collectorId: '1', collectorName: 'Adebayo Musa', amount: 50000, date: '2025-06-01', expectedDeliveryKg: 500, repaymentWindow: 30, balance: 15000, status: 'active', approvedBy: 'owner', createdAt: '2025-06-01' },
  { id: '2', collectorId: '3', collectorName: 'Olaoluwa Plastics', amount: 150000, date: '2025-05-15', expectedDeliveryKg: 1500, repaymentWindow: 45, balance: 50000, status: 'active', approvedBy: 'owner', createdAt: '2025-05-15' },
  { id: '3', collectorId: '2', collectorName: 'Iya Kemi Collection', amount: 30000, date: '2025-04-01', expectedDeliveryKg: 300, repaymentWindow: 30, balance: 30000, status: 'overdue', approvedBy: 'owner', createdAt: '2025-04-01' },
];

const MOCK_AGREEMENTS: InstitutionalAgreement[] = [
  { id: '1', institutionName: 'St. Charles Hospital', type: 'Hospital', catchment: 'Osogbo metro', contactPerson: 'Pharm. Adeleke', phone: '08056789012', collectionFrequency: 'Weekly', paymentTerms: 'Free collection', status: 'active', monthlyVolumeKg: 300, startDate: '2025-01-10', reviewDate: '2025-10-10', notes: 'Provides certificate of recycling' },
  { id: '2', institutionName: 'Grand Hotel Osogbo', type: 'Hotel', catchment: 'Osogbo metro', contactPerson: 'Manager Tunde', phone: '08067890123', collectionFrequency: 'Bi-weekly', paymentTerms: 'Free collection', status: 'active', monthlyVolumeKg: 210, startDate: '2025-02-15', reviewDate: '2025-11-15' },
  { id: '3', institutionName: 'Osun State University', type: 'School', catchment: 'Osogbo metro', contactPerson: 'Prof. Ogunleye', phone: '08078901234', collectionFrequency: 'Monthly', paymentTerms: 'Negotiating', status: 'negotiating', monthlyVolumeKg: 0, startDate: '', reviewDate: '' },
  { id: '4', institutionName: 'Nigeria Bottling Company', type: 'Bottler', catchment: 'Ede', contactPerson: 'Mr. Ibrahim', phone: '08089012345', collectionFrequency: 'Weekly', paymentTerms: 'Payment per kg', status: 'prospect', monthlyVolumeKg: 0, startDate: '', reviewDate: '' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SourcingModule() {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('collectors');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="collectors">
            <Users className="w-4 h-4 mr-2" />
            Collectors
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing Bands
          </TabsTrigger>
          <TabsTrigger value="float">
            <HandCoins className="w-4 h-4 mr-2" />
            Float
          </TabsTrigger>
          <TabsTrigger value="institutional">
            <Building2 className="w-4 h-4 mr-2" />
            Institutional
          </TabsTrigger>
          <TabsTrigger value="sop">
            <BookOpen className="w-4 h-4 mr-2" />
            SOP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collectors" className="space-y-4">
          <CollectorsTab />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <PricingTab />
        </TabsContent>

        <TabsContent value="float" className="space-y-4">
          <FloatTab />
        </TabsContent>

        <TabsContent value="institutional" className="space-y-4">
          <InstitutionalTab />
        </TabsContent>

        <TabsContent value="sop" className="space-y-4">
          <SOPViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// COLLECTORS TAB
// ============================================================================

function CollectorsTab() {
  const [collectors, setCollectors] = useState<Collector[]>(MOCK_COLLECTORS);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [filterCatchment, setFilterCatchment] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = collectors.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchTier = filterTier === 'all' || c.tier === filterTier;
    const matchCatchment = filterCatchment === 'all' || c.catchment === filterCatchment;
    return matchSearch && matchTier && matchCatchment;
  });

  const totalCollectors = collectors.length;
  const activeCollectors = collectors.filter(c => c.isActive).length;
  const totalKg = collectors.reduce((sum, c) => sum + c.totalKg, 0);

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Collectors</p>
            <p className="text-2xl font-bold">{totalCollectors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Active (30 days)</p>
            <p className="text-2xl font-bold text-green-600">{activeCollectors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total KG Received</p>
            <p className="text-2xl font-bold">{(totalKg / 1000).toFixed(1)}t</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Avg Reliability</p>
            <p className="text-2xl font-bold text-blue-600">
              {collectors.length > 0 ? Math.round(collectors.reduce((s, c) => s + c.reliabilityScore, 0) / collectors.length) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Tiers</option>
              {TIERS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
            <select
              value={filterCatchment}
              onChange={(e) => setFilterCatchment(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Catchments</option>
              {CATCHMENTS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <Button onClick={() => setShowAdd(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-1" />
              Register
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Catchment Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Tonnes by Catchment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATCHMENTS.map(c => {
              const kg = collectors
                .filter(col => col.catchment === c.name)
                .reduce((sum, col) => sum + col.totalKg, 0);
              return (
                <div key={c.name} className="p-3 rounded-lg border bg-gray-50">
                  <p className="text-xs text-gray-500">{c.name}</p>
                  <p className="text-lg font-bold">{(kg / 1000).toFixed(1)}t</p>
                  <Badge className={
                    c.priority === 'Core' ? 'bg-red-100 text-red-800' :
                    c.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    c.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {c.priority}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Collectors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Collector Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Tier</th>
                  <th className="text-left py-2">Catchment</th>
                  <th className="text-right py-2">Deliveries</th>
                  <th className="text-right py-2">Total KG</th>
                  <th className="text-right py-2">Reliability</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(collector => (
                  <tr key={collector.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">
                      <p className="font-medium">{collector.name}</p>
                      <p className="text-xs text-gray-500">{collector.phone}</p>
                    </td>
                    <td className="py-2">
                      <Badge className={
                        collector.tier === 'picker' ? 'bg-gray-100 text-gray-800' :
                        collector.tier === 'small_aggregator' ? 'bg-blue-100 text-blue-800' :
                        collector.tier === 'large_aggregator' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {TIERS.find(t => t.key === collector.tier)?.label || collector.tier}
                      </Badge>
                    </td>
                    <td className="py-2 text-sm">{collector.catchment}</td>
                    <td className="text-right py-2">{collector.totalDeliveries}</td>
                    <td className="text-right py-2 font-medium">{collector.totalKg.toLocaleString()}</td>
                    <td className="text-right py-2">
                      <span className={collector.reliabilityScore >= 80 ? 'text-green-600' : collector.reliabilityScore >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                        {collector.reliabilityScore}%
                      </span>
                    </td>
                    <td className="text-center py-2">
                      {collector.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600 mx-auto" />
                      )}
                    </td>
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
// PRICING TAB
// ============================================================================

function PricingTab() {
  const [bands, setBands] = useState<PricingBand[]>(MOCK_PRICING);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Buying Bands</h3>
          <p className="text-sm text-gray-500">Set monthly. Procurement buys within band without approval.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-1" />
          Set New Band
        </Button>
      </div>

      <div className="grid gap-4">
        {bands.map(band => {
          const quality = QUALITY_TIERS.find(q => q.key === band.qualityTier);
          return (
            <Card key={band.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{band.material} — {quality?.label}</h4>
                      <p className="text-sm text-gray-500">{quality?.description}</p>
                      <p className="text-xs text-gray-400">Effective: {band.effectiveDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Floor</p>
                        <p className="text-xl font-bold text-red-600">₦{band.floorPrice}</p>
                      </div>
                      <div className="text-2xl text-gray-300">—</div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Ceiling</p>
                        <p className="text-xl font-bold text-green-600">₦{band.ceilingPrice}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pricing Rules */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Pricing Discipline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. Procurement buys <strong>within the band</strong> without further approval.</p>
          <p>2. Anything <strong>above the ceiling</strong> requires the Factory Manager. In the field, the answer is no.</p>
          <p>3. Price differentiates by <strong>quality, not by relationship</strong>. Clean, dry, well-sorted material earns the top of the band.</p>
          <p>4. <strong>Publish the band to collectors</strong>. Opacity buys you nothing and costs you trust.</p>
          <p className="text-red-600 font-medium mt-2">Never quietly cut the price after a collector has already loaded.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// FLOAT TAB
// ============================================================================

function FloatTab() {
  const [floats, setFloats] = useState<FloatAdvance[]>(MOCK_FLOATS);

  const totalOutstanding = floats.reduce((sum, f) => sum + f.balance, 0);
  const overdueAmount = floats.filter(f => f.status === 'overdue').reduce((sum, f) => sum + f.balance, 0);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Outstanding</p>
            <p className="text-2xl font-bold">₦{totalOutstanding.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Overdue</p>
            <p className="text-2xl font-bold text-red-600">₦{overdueAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Active Floats</p>
            <p className="text-2xl font-bold text-blue-600">{floats.filter(f => f.status === 'active').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Float Rules */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Float Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>1. Float only to collectors with <strong>3+ months history</strong> and positive reliability.</p>
          <p>2. Factory Manager approves. Finance records. Owner is informed.</p>
          <p>3. Repaid <strong>in material</strong>, offset against deliveries — not cash.</p>
          <p>4. Overdue float <strong>blocks any further advance</strong>. No exceptions.</p>
        </CardContent>
      </Card>

      {/* Floats Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Float Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Collector</th>
                  <th className="text-right py-2">Advanced</th>
                  <th className="text-right py-2">Balance</th>
                  <th className="text-right py-2">Expected KG</th>
                  <th className="text-center py-2">Window</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {floats.map(f => (
                  <tr key={f.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{f.collectorName}</td>
                    <td className="text-right py-2">₦{f.amount.toLocaleString()}</td>
                    <td className="text-right py-2 font-bold">₦{f.balance.toLocaleString()}</td>
                    <td className="text-right py-2">{f.expectedDeliveryKg} kg</td>
                    <td className="text-center py-2">{f.repaymentWindow} days</td>
                    <td className="text-center py-2">
                      <Badge className={
                        f.status === 'active' ? 'bg-green-100 text-green-800' :
                        f.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {f.status}
                      </Badge>
                    </td>
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
// INSTITUTIONAL TAB
// ============================================================================

function InstitutionalTab() {
  const [agreements, setAgreements] = useState<InstitutionalAgreement[]>(MOCK_AGREEMENTS);

  const byStatus = {
    prospect: agreements.filter(a => a.status === 'prospect').length,
    negotiating: agreements.filter(a => a.status === 'negotiating').length,
    active: agreements.filter(a => a.status === 'active').length,
    dormant: agreements.filter(a => a.status === 'dormant').length,
  };

  return (
    <div className="space-y-4">
      {/* Pipeline */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Prospects</p>
            <p className="text-2xl font-bold text-gray-600">{byStatus.prospect}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Negotiating</p>
            <p className="text-2xl font-bold text-yellow-600">{byStatus.negotiating}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">{byStatus.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Monthly from Active</p>
            <p className="text-2xl font-bold text-blue-600">
              {agreements.filter(a => a.status === 'active').reduce((s, a) => s + a.monthlyVolumeKg, 0)} kg
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Target List by Catchment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Institutional Target List by Catchment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATCHMENTS.map(c => (
              <div key={c.name} className="p-3 rounded-lg border">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-gray-500 mb-2">Priority: {c.priority}</p>
                <div className="flex flex-wrap gap-1">
                  {['Bottlers', 'Hotels', 'Restaurants', 'Event Centres', 'Schools', 'Hospitals', 'Filling Stations', 'Religious'].map(target => (
                    <span key={target} className="text-xs px-2 py-1 bg-gray-100 rounded">{target}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agreements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agreements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Institution</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Frequency</th>
                  <th className="text-right py-2">Monthly KG</th>
                  <th className="text-center py-2">Status</th>
                  <th className="text-left py-2">Review</th>
                </tr>
              </thead>
              <tbody>
                {agreements.map(a => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">
                      <p className="font-medium">{a.institutionName}</p>
                      <p className="text-xs text-gray-500">{a.contactPerson}</p>
                    </td>
                    <td className="py-2">
                      <Badge variant="outline">{a.type}</Badge>
                    </td>
                    <td className="py-2 text-sm">{a.collectionFrequency}</td>
                    <td className="text-right py-2">{a.monthlyVolumeKg > 0 ? `${a.monthlyVolumeKg} kg` : '-'}</td>
                    <td className="text-center py-2">
                      <Badge className={
                        a.status === 'active' ? 'bg-green-100 text-green-800' :
                        a.status === 'negotiating' ? 'bg-yellow-100 text-yellow-800' :
                        a.status === 'prospect' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {a.status}
                      </Badge>
                    </td>
                    <td className="py-2 text-sm">{a.reviewDate || '-'}</td>
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
// SOP VIEWER
// ============================================================================

function SOPViewer() {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Sourcing and Collector Network — SOP</h3>
          <p className="text-sm text-gray-500">Bamboo Trybe Limited | Site: Osogbo, Osun State</p>
        </div>
        <Badge className="bg-green-100 text-green-800">Applies: before truck reaches gate</Badge>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-blue-800">
            "The plant is built for 10 tonnes a day and runs 10 tonnes a week. The gap is not machinery, labour, or process — it is feedstock."
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {SOP_SECTIONS.map(section => (
          <Card key={section.id} className="overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <span className="font-medium">{section.title}</span>
              {expandedSection === section.id ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {expandedSection === section.id && (
              <CardContent className="pt-0 pb-4">
                <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed border-t pt-4">
                  {section.content}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
