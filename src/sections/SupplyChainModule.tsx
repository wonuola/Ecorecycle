// ============================================================================
// SUPPLY CHAIN MODULE — Procurement + Sourcing Merged
// ============================================================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { SOP_SECTIONS, CATCHMENTS, TIERS } from '@/services/sop-data';
import {
  ShoppingCart, Users, DollarSign, HandCoins, Building2,
  Plus, Search, MapPin, TrendingUp, Phone, BookOpen, ChevronDown, ChevronRight
} from 'lucide-react';

// Mock data
const MOCK_LOTS = [
  { id: '1', lotNumber: 'LOT-2025-001', vendorName: 'Adebayo Musa', purchaseDate: '2025-07-01', expectedKg: 2000, actualKg: 1950, pricePerKg: 220, totalCost: 429000, status: 'received' },
  { id: '2', lotNumber: 'LOT-2025-002', vendorName: 'Olaoluwa Plastics', purchaseDate: '2025-07-05', expectedKg: 5000, actualKg: 0, pricePerKg: 200, totalCost: 1000000, status: 'pending' },
  { id: '3', lotNumber: 'LOT-2025-003', vendorName: 'Iya Kemi Collection', purchaseDate: '2025-07-08', expectedKg: 800, actualKg: 780, pricePerKg: 240, totalCost: 187200, status: 'received' },
];

const MOCK_COLLECTORS = [
  { id: '1', name: 'Adebayo Musa', phone: '08012345678', catchment: 'Osogbo metro', tier: 'small_aggregator', reliabilityScore: 85, totalKg: 8400, isActive: true },
  { id: '2', name: 'Iya Kemi Collection', phone: '08023456789', catchment: 'Ede', tier: 'small_aggregator', reliabilityScore: 72, totalKg: 5200, isActive: true },
  { id: '3', name: 'Olaoluwa Plastics', phone: '08034567890', catchment: 'Ilesa', tier: 'large_aggregator', reliabilityScore: 91, totalKg: 28000, isActive: true },
  { id: '4', name: 'Femi Street Picker', phone: '08045678901', catchment: 'Osogbo metro', tier: 'picker', reliabilityScore: 60, totalKg: 1200, isActive: true },
  { id: '5', name: 'St. Charles Hospital', phone: '08056789012', catchment: 'Osogbo metro', tier: 'institutional', reliabilityScore: 95, totalKg: 3600, isActive: true },
];

const MOCK_PRICING = [
  { id: '1', material: 'PET', qualityTier: 'Clean & Dry', floorPrice: 220, ceilingPrice: 280, effectiveDate: '2025-07-01' },
  { id: '2', material: 'PET', qualityTier: 'Standard', floorPrice: 180, ceilingPrice: 220, effectiveDate: '2025-07-01' },
  { id: '3', material: 'PET', qualityTier: 'Wet/Dirty', floorPrice: 120, ceilingPrice: 180, effectiveDate: '2025-07-01' },
];

const MOCK_FLOATS = [
  { id: '1', collectorName: 'Adebayo Musa', amount: 50000, balance: 15000, status: 'active' },
  { id: '2', collectorName: 'Olaoluwa Plastics', amount: 150000, balance: 50000, status: 'active' },
  { id: '3', collectorName: 'Iya Kemi Collection', amount: 30000, balance: 30000, status: 'overdue' },
];

const MOCK_INSTITUTIONS = [
  { id: '1', name: 'St. Charles Hospital', type: 'Hospital', status: 'active', monthlyKg: 300, frequency: 'Weekly' },
  { id: '2', name: 'Grand Hotel Osogbo', type: 'Hotel', status: 'active', monthlyKg: 210, frequency: 'Bi-weekly' },
  { id: '3', name: 'Osun State University', type: 'School', status: 'negotiating', monthlyKg: 0, frequency: 'Monthly' },
  { id: '4', name: 'Nigeria Bottling Company', type: 'Bottler', status: 'prospect', monthlyKg: 0, frequency: 'Weekly' },
];

export function SupplyChainModule() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('procurement');
  const [showNewLot, setShowNewLot] = useState(false);
  const [showSopSection, setShowSopSection] = useState<string | null>(null);

  const totalProcurement = MOCK_LOTS.reduce((s, l) => s + l.totalCost, 0);
  const receivedKg = MOCK_LOTS.filter(l => l.status === 'received').reduce((s, l) => s + (l.actualKg || 0), 0);
  const pendingLots = MOCK_LOTS.filter(l => l.status === 'pending').length;
  const activeCollectors = MOCK_COLLECTORS.filter(c => c.isActive).length;
  const totalFloat = MOCK_FLOATS.reduce((s, f) => s + f.balance, 0);
  const overdueFloat = MOCK_FLOATS.filter(f => f.status === 'overdue').reduce((s, f) => s + f.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Procurement</h2>
          <p className="text-sm text-gray-500">Material sourcing, vendor management, pricing, and collector network</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowNewLot(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Purchase
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Procurement MTD</p>
            <p className="text-2xl font-bold">₦{(totalProcurement / 1000).toFixed(0)}k</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Received (kg)</p>
            <p className="text-2xl font-bold text-green-600">{receivedKg.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Pending Lots</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingLots}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Active Collectors</p>
            <p className="text-2xl font-bold text-blue-600">{activeCollectors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Float Outstanding</p>
            <p className="text-2xl font-bold text-red-600">₦{totalFloat.toLocaleString()}</p>
            {overdueFloat > 0 && <p className="text-xs text-red-500">₦{overdueFloat.toLocaleString()} overdue</p>}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="procurement"><ShoppingCart className="w-4 h-4 mr-1" /> Procurement</TabsTrigger>
          <TabsTrigger value="collectors"><Users className="w-4 h-4 mr-1" /> Collectors</TabsTrigger>
          <TabsTrigger value="pricing"><DollarSign className="w-4 h-4 mr-1" /> Pricing</TabsTrigger>
          <TabsTrigger value="float"><HandCoins className="w-4 h-4 mr-1" /> Float</TabsTrigger>
          <TabsTrigger value="institutional"><Building2 className="w-4 h-4 mr-1" /> Institutional</TabsTrigger>
        </TabsList>

        <TabsContent value="procurement">
          <ProcurementTab lots={MOCK_LOTS} />
        </TabsContent>
        <TabsContent value="collectors">
          <CollectorsTab collectors={MOCK_COLLECTORS} />
        </TabsContent>
        <TabsContent value="pricing">
          <PricingTab pricing={MOCK_PRICING} />
        </TabsContent>
        <TabsContent value="float">
          <FloatTab floats={MOCK_FLOATS} />
        </TabsContent>
        <TabsContent value="institutional">
          <InstitutionalTab institutions={MOCK_INSTITUTIONS} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProcurementTab({ lots }: { lots: typeof MOCK_LOTS }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">Purchase Lots</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b"><th className="text-left py-2">Lot #</th><th className="text-left py-2">Vendor</th><th className="text-left py-2">Date</th><th className="text-right py-2">Expected</th><th className="text-right py-2">Received</th><th className="text-right py-2">Price/kg</th><th className="text-right py-2">Total</th><th className="text-center py-2">Status</th></tr></thead>
              <tbody>
                {lots.map(lot => (
                  <tr key={lot.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{lot.lotNumber}</td>
                    <td className="py-2">{lot.vendorName}</td>
                    <td className="py-2 text-sm">{lot.purchaseDate}</td>
                    <td className="text-right py-2">{lot.expectedKg.toLocaleString()} kg</td>
                    <td className="text-right py-2">{lot.actualKg > 0 ? `${lot.actualKg.toLocaleString()} kg` : '-'}</td>
                    <td className="text-right py-2">₦{lot.pricePerKg}</td>
                    <td className="text-right py-2 font-medium">₦{lot.totalCost.toLocaleString()}</td>
                    <td className="text-center py-2">
                      <Badge className={lot.status === 'received' ? 'bg-green-100 text-green-800' : lot.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                        {lot.status}
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

function CollectorsTab({ collectors }: { collectors: typeof MOCK_COLLECTORS }) {
  const [search, setSearch] = useState('');
  const filtered = collectors.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search collectors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* Catchment grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATCHMENTS.map(c => {
          const kg = collectors.filter(col => col.catchment === c.name).reduce((s, col) => s + col.totalKg, 0);
          return (
            <div key={c.name} className="p-3 rounded-lg border bg-gray-50">
              <p className="text-xs text-gray-500">{c.name}</p>
              <p className="text-lg font-bold">{(kg / 1000).toFixed(1)}t</p>
              <Badge className={c.priority === 'Core' ? 'bg-red-100 text-red-800' : c.priority === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}>{c.priority}</Badge>
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Collector Network ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b"><th className="text-left py-2">Name</th><th className="text-left py-2">Tier</th><th className="text-left py-2">Catchment</th><th className="text-right py-2">Total KG</th><th className="text-right py-2">Reliability</th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="py-2"><p className="font-medium">{c.name}</p><p className="text-xs text-gray-500">{c.phone}</p></td>
                    <td className="py-2"><Badge className={c.tier === 'picker' ? 'bg-gray-100' : c.tier === 'small_aggregator' ? 'bg-blue-100 text-blue-800' : c.tier === 'large_aggregator' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}>{TIERS.find(t => t.key === c.tier)?.label || c.tier}</Badge></td>
                    <td className="py-2 text-sm">{c.catchment}</td>
                    <td className="text-right py-2 font-medium">{c.totalKg.toLocaleString()}</td>
                    <td className="text-right py-2"><span className={c.reliabilityScore >= 80 ? 'text-green-600' : c.reliabilityScore >= 60 ? 'text-yellow-600' : 'text-red-600'}>{c.reliabilityScore}%</span></td>
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

function PricingTab({ pricing }: { pricing: typeof MOCK_PRICING }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {pricing.map(p => (
          <Card key={p.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{p.material} — {p.qualityTier}</h4>
                <p className="text-xs text-gray-400">Effective: {p.effectiveDate}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center"><p className="text-xs text-gray-500">Floor</p><p className="text-xl font-bold text-red-600">₦{p.floorPrice}</p></div>
                <div className="text-2xl text-gray-300">—</div>
                <div className="text-center"><p className="text-xs text-gray-500">Ceiling</p><p className="text-xl font-bold text-green-600">₦{p.ceilingPrice}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4 space-y-1 text-sm">
          <p className="font-medium">Pricing Discipline:</p>
          <p>1. Buy <strong>within the band</strong> without further approval.</p>
          <p>2. Above ceiling → Factory Manager approval. In the field, the answer is <strong>no</strong>.</p>
          <p>3. Price by <strong>quality, not relationship</strong>. Clean, dry material earns top of band.</p>
          <p className="text-red-600 font-medium mt-2">Never cut price after a collector has loaded.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function FloatTab({ floats }: { floats: typeof MOCK_FLOATS }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">Float Balances</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b"><th className="text-left py-2">Collector</th><th className="text-right py-2">Advanced</th><th className="text-right py-2">Balance</th><th className="text-center py-2">Status</th></tr></thead>
              <tbody>
                {floats.map(f => (
                  <tr key={f.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{f.collectorName}</td>
                    <td className="text-right py-2">₦{f.amount.toLocaleString()}</td>
                    <td className="text-right py-2 font-bold">₦{f.balance.toLocaleString()}</td>
                    <td className="text-center py-2"><Badge className={f.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{f.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 space-y-1 text-sm">
          <p className="font-medium">Float Rules:</p>
          <p>1. Only to collectors with <strong>3+ months history</strong> and positive reliability.</p>
          <p>2. Repaid <strong>in material</strong>, offset against deliveries — not cash.</p>
          <p>3. Overdue float <strong>blocks further advance</strong>. No exceptions.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function InstitutionalTab({ institutions }: { institutions: typeof MOCK_INSTITUTIONS }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {['prospect', 'negotiating', 'active', 'dormant'].map(status => (
          <Card key={status}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 capitalize">{status}</p>
              <p className="text-2xl font-bold">{institutions.filter(i => i.status === status).length}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">Agreements</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b"><th className="text-left py-2">Institution</th><th className="text-left py-2">Type</th><th className="text-left py-2">Frequency</th><th className="text-right py-2">Monthly KG</th><th className="text-center py-2">Status</th></tr></thead>
              <tbody>
                {institutions.map(i => (
                  <tr key={i.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{i.name}</td>
                    <td className="py-2"><Badge variant="outline">{i.type}</Badge></td>
                    <td className="py-2 text-sm">{i.frequency}</td>
                    <td className="text-right py-2">{i.monthlyKg > 0 ? `${i.monthlyKg} kg` : '-'}</td>
                    <td className="text-center py-2"><Badge className={i.status === 'active' ? 'bg-green-100' : i.status === 'negotiating' ? 'bg-yellow-100' : 'bg-blue-100'}>{i.status}</Badge></td>
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
