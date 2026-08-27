// ============================================================================
// OPERATIONS MODULE — Sorting → Logistics + Handling + Warehouse
// Physical flow: RECEIVE → SORT → STORE → MOVE
// ============================================================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/services/database';
import { useAuth } from '@/hooks/useAuth';
import {
  SortAsc, Truck, Hand, Warehouse, Plus, Search,
  ArrowRight, Scale, Package, Droplets, Banknote, Landmark
} from 'lucide-react';

const STATE_LABELS: Record<string, string> = {
  unsorted_pet: 'Unsorted PET',
  sorted_pet: 'Sorted PET',
  caps: 'Caps',
  labels: 'Labels',
  ground_flakes: 'Ground Flakes',
  washed_flakes: 'Washed Flakes',
  final_dry_flakes: 'Final Dry Flakes',
  rejects: 'Rejects',
};

const STATE_COLORS: Record<string, string> = {
  unsorted_pet: 'bg-gray-100 text-gray-800',
  sorted_pet: 'bg-blue-100 text-blue-800',
  caps: 'bg-yellow-100 text-yellow-800',
  labels: 'bg-orange-100 text-orange-800',
  ground_flakes: 'bg-purple-100 text-purple-800',
  washed_flakes: 'bg-cyan-100 text-cyan-800',
  final_dry_flakes: 'bg-green-100 text-green-800',
  rejects: 'bg-red-100 text-red-800',
};

export function OperationsModule() {
  const [activeTab, setActiveTab] = useState('sorting');
  const [batches, setBatches] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [b, w] = await Promise.all([db.getBatches(), db.getWorkers()]);
    setBatches(b);
    setWorkers(w);
  }

  const totalSorted = batches.reduce((s, b) => s + (b.weights?.sortedPet || 0), 0);
  const totalUnsorted = batches.reduce((s, b) => s + (b.currentState === 'unsorted_pet' ? b.initialWeight : 0), 0);
  const activeBatchesCount = batches.filter((b: any) => b.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Warehouse & Processing</h2>
          <p className="text-sm text-gray-500">Material sorting, storage, logistics, and handling operations</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Sorted Today</p>
            <p className="text-2xl font-bold text-green-600">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Unsorted Stock</p>
            <p className="text-2xl font-bold text-gray-600">{totalUnsorted.toLocaleString()} kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Sorted</p>
            <p className="text-2xl font-bold text-blue-600">{totalSorted.toLocaleString()} kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Active Batches</p>
            <p className="text-2xl font-bold">{activeBatchesCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Material Flow Pipeline */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-green-800 mb-3">Material Flow Pipeline</p>
          <div className="flex items-center gap-2 flex-wrap">
            {['Receive', 'Sort', 'Store', 'Move'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-white border border-green-300 text-sm font-medium text-green-800">
                  {step}
                </div>
                {i < 3 && <ArrowRight className="w-4 h-4 text-green-600" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sorting"><SortAsc className="w-4 h-4 mr-1" /> Sorting & Wages</TabsTrigger>
          <TabsTrigger value="warehouse"><Warehouse className="w-4 h-4 mr-1" /> Warehouse</TabsTrigger>
          <TabsTrigger value="logistics"><Truck className="w-4 h-4 mr-1" /> Logistics</TabsTrigger>
          <TabsTrigger value="handling"><Hand className="w-4 h-4 mr-1" /> Handling</TabsTrigger>
        </TabsList>

        <TabsContent value="sorting">
          <SortingTab batches={batches} workers={workers} onRefresh={loadData} />
        </TabsContent>
        <TabsContent value="warehouse">
          <WarehouseTab batches={batches} />
        </TabsContent>
        <TabsContent value="logistics">
          <LogisticsTab onRefresh={loadData} />
        </TabsContent>
        <TabsContent value="handling">
          <HandlingTab onRefresh={loadData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SortingTab({ batches, workers, onRefresh }: { batches: any[]; workers: any[]; onRefresh: () => void }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    batchId: '', workerId: '', kgSorted: '', wasteKg: '', wageAmount: '',
    accountNumber: '', paymentTiming: 'after' as 'before' | 'after' | 'pending',
    paymentStatus: 'unpaid' as 'paid' | 'unpaid' | 'partial',
    notes: '', date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { loadEntries(); }, []);

  async function loadEntries() {
    const data = await db.getSortingEntries();
    setEntries(data);
  }

  async function handleSubmit() {
    if (!form.batchId || !form.workerId || !form.kgSorted) return;
    await db.createSortingEntry({
      batchId: form.batchId,
      workerId: form.workerId,
      kgSorted: parseFloat(form.kgSorted) || 0,
      wasteKg: parseFloat(form.wasteKg) || 0,
      wageAmount: parseFloat(form.wageAmount) || 0,
      date: form.date,
      notes: form.notes,
      accountNumber: form.accountNumber,
      paymentTiming: form.paymentTiming,
      paymentStatus: form.paymentStatus,
    });
    setShowForm(false);
    setForm({ batchId: '', workerId: '', kgSorted: '', wasteKg: '', wageAmount: '', accountNumber: '', paymentTiming: 'after', paymentStatus: 'unpaid', notes: '', date: new Date().toISOString().split('T')[0] });
    loadEntries();
    onRefresh();
  }

  const paymentBadge = (timing: string, status: string) => {
    const color = timing === 'before' ? 'bg-blue-100 text-blue-800' : timing === 'after' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800';
    return <Badge className={color}>{timing === 'before' ? 'Prepaid' : timing === 'after' ? 'Postpaid' : 'Pending'}</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Record Sorting Entry</CardTitle>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4 mr-1" /> {showForm ? 'Cancel' : 'Record Sorting'}</Button>
        </CardHeader>
        {showForm && (
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><Label className="text-xs">Batch</Label><select value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} className="w-full mt-1 rounded-md border px-2 py-2 text-sm"><option value="">Select batch</option>{batches.map(b => <option key={b.id} value={b.id}>{b.batchNumber}</option>)}</select></div>
              <div><Label className="text-xs">Worker</Label><select value={form.workerId} onChange={e => setForm({ ...form, workerId: e.target.value })} className="w-full mt-1 rounded-md border px-2 py-2 text-sm"><option value="">Select worker</option>{workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
              <div><Label className="text-xs">KG Sorted</Label><Input type="number" value={form.kgSorted} onChange={e => setForm({ ...form, kgSorted: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Waste (kg)</Label><Input type="number" value={form.wasteKg} onChange={e => setForm({ ...form, wasteKg: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Wage Amount (₦)</Label><Input type="number" value={form.wageAmount} onChange={e => setForm({ ...form, wageAmount: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label className="text-xs">Account Number</Label><Input value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} placeholder="Bank account for payment" className="mt-1" /></div>
              <div><Label className="text-xs">Payment Timing</Label><select value={form.paymentTiming} onChange={e => setForm({ ...form, paymentTiming: e.target.value as any })} className="w-full mt-1 rounded-md border px-2 py-2 text-sm"><option value="before">Paid Before (Prepaid)</option><option value="after">Paid After (Postpaid)</option><option value="pending">Pending</option></select></div>
              <div><Label className="text-xs">Payment Status</Label><select value={form.paymentStatus} onChange={e => setForm({ ...form, paymentStatus: e.target.value as any })} className="w-full mt-1 rounded-md border px-2 py-2 text-sm"><option value="paid">Paid</option><option value="partial">Partial</option><option value="unpaid">Unpaid</option></select></div>
            </div>
            <div><Label className="text-xs">Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any notes..." className="mt-1" /></div>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>Save Sorting Entry</Button>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Sorting Entries</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left py-2">Worker</th><th className="text-right py-2">KG Sorted</th><th className="text-right py-2">Waste</th><th className="text-right py-2">Wage</th><th className="text-left py-2">Payment</th><th className="text-left py-2">Date</th></tr></thead>
              <tbody>
                {entries.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{s.workerName}</td>
                    <td className="text-right py-2">{s.kgSorted}</td>
                    <td className="text-right py-2 text-red-500">{s.wasteKg} kg</td>
                    <td className="text-right py-2">₦{(s.wageAmount || 0).toLocaleString()}</td>
                    <td className="py-2">{paymentBadge(s.paymentTiming || 'pending', s.paymentStatus || 'unpaid')}</td>
                    <td className="py-2 text-sm">{s.date}</td>
                  </tr>
                ))}
                {entries.length === 0 && <tr><td colSpan={6} className="py-4 text-center text-gray-400">No sorting entries yet</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WarehouseTab({ batches }: { batches: any[] }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Batches in Warehouse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Batch</th>
                  <th className="text-left py-2">Current State</th>
                  <th className="text-right py-2">Input</th>
                  <th className="text-right py-2">Sorted</th>
                  <th className="text-right py-2">Ground</th>
                  <th className="text-right py-2">Final</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(b => (
                  <tr key={b.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{b.batchNumber}</td>
                    <td className="py-2"><Badge className={STATE_COLORS[b.currentState] || 'bg-gray-100'}>{STATE_LABELS[b.currentState] || b.currentState}</Badge></td>
                    <td className="text-right py-2">{b.initialWeight.toLocaleString()}</td>
                    <td className="text-right py-2">{(b.weights?.sortedPet || 0) > 0 ? b.weights.sortedPet.toLocaleString() : '-'}</td>
                    <td className="text-right py-2">{(b.weights?.groundFlakes || 0) > 0 ? b.weights.groundFlakes.toLocaleString() : '-'}</td>
                    <td className="text-right py-2">{(b.weights?.finalDryFlakes || 0) > 0 ? b.weights.finalDryFlakes.toLocaleString() : '-'}</td>
                  </tr>
                ))}
                {batches.length === 0 && <tr><td colSpan={6} className="py-4 text-center text-gray-400">No batches in warehouse</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LogisticsTab({ onRefresh }: { onRefresh: () => void }) {
  const [trips, setTrips] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    tripNumber: '', driverName: '', driverPhone: '', vehicleNumber: '',
    pickupLocation: '', deliveryLocation: '', cost: '', fuelCost: '', driverWage: '', otherCosts: '',
    accountNumber: '', paymentTiming: 'after' as 'before' | 'after' | 'pending',
    paymentStatus: 'unpaid' as 'paid' | 'unpaid' | 'partial',
    scheduledDate: new Date().toISOString().split('T')[0], status: 'scheduled' as any,
    notes: '',
  });

  useEffect(() => { loadTrips(); }, []);

  async function loadTrips() {
    const data = await db.getTrips();
    setTrips(data);
  }

  async function handleSubmit() {
    if (!form.tripNumber || !form.driverName || !form.vehicleNumber) return;
    await db.createTrip({
      tripNumber: form.tripNumber,
      driverName: form.driverName,
      driverPhone: form.driverPhone,
      vehicleNumber: form.vehicleNumber,
      pickupLocation: form.pickupLocation,
      deliveryLocation: form.deliveryLocation,
      cost: parseFloat(form.cost) || 0,
      fuelCost: parseFloat(form.fuelCost) || 0,
      driverWage: parseFloat(form.driverWage) || 0,
      otherCosts: parseFloat(form.otherCosts) || 0,
      scheduledDate: form.scheduledDate,
      status: form.status,
      accountNumber: form.accountNumber,
      paymentTiming: form.paymentTiming,
      paymentStatus: form.paymentStatus,
      notes: form.notes,
    });
    setShowForm(false);
    setForm({ tripNumber: '', driverName: '', driverPhone: '', vehicleNumber: '', pickupLocation: '', deliveryLocation: '', cost: '', fuelCost: '', driverWage: '', otherCosts: '', accountNumber: '', paymentTiming: 'after', paymentStatus: 'unpaid', scheduledDate: new Date().toISOString().split('T')[0], status: 'scheduled', notes: '' });
    loadTrips();
    onRefresh();
  }

  const paymentBadge = (timing: string, status: string) => {
    const color = timing === 'before' ? 'bg-blue-100 text-blue-800' : timing === 'after' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800';
    return <Badge className={color}>{timing === 'before' ? 'Prepaid' : timing === 'after' ? 'Postpaid' : 'Pending'}</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Schedule Trip</CardTitle>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4 mr-1" /> {showForm ? 'Cancel' : 'Schedule Trip'}</Button>
        </CardHeader>
        {showForm && (
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><Label className="text-xs">Trip Number</Label><Input value={form.tripNumber} onChange={e => setForm({ ...form, tripNumber: e.target.value })} placeholder="TRIP-001" className="mt-1" /></div>
              <div><Label className="text-xs">Driver Name</Label><Input value={form.driverName} onChange={e => setForm({ ...form, driverName: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Driver Phone</Label><Input value={form.driverPhone} onChange={e => setForm({ ...form, driverPhone: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Vehicle Number</Label><Input value={form.vehicleNumber} onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Pickup Location</Label><Input value={form.pickupLocation} onChange={e => setForm({ ...form, pickupLocation: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Delivery Location</Label><Input value={form.deliveryLocation} onChange={e => setForm({ ...form, deliveryLocation: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Logistics Cost (₦)</Label><Input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Fuel Cost (₦)</Label><Input type="number" value={form.fuelCost} onChange={e => setForm({ ...form, fuelCost: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Driver Wage (₦)</Label><Input type="number" value={form.driverWage} onChange={e => setForm({ ...form, driverWage: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Other Costs (₦)</Label><Input type="number" value={form.otherCosts} onChange={e => setForm({ ...form, otherCosts: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Scheduled Date</Label><Input type="date" value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label className="text-xs">Account Number</Label><Input value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} placeholder="Bank account" className="mt-1" /></div>
              <div><Label className="text-xs">Payment Timing</Label><select value={form.paymentTiming} onChange={e => setForm({ ...form, paymentTiming: e.target.value as any })} className="w-full mt-1 rounded-md border px-2 py-2 text-sm"><option value="before">Paid Before (Prepaid)</option><option value="after">Paid After (Postpaid)</option><option value="pending">Pending</option></select></div>
              <div><Label className="text-xs">Payment Status</Label><select value={form.paymentStatus} onChange={e => setForm({ ...form, paymentStatus: e.target.value as any })} className="w-full mt-1 rounded-md border px-2 py-2 text-sm"><option value="paid">Paid</option><option value="partial">Partial</option><option value="unpaid">Unpaid</option></select></div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>Save Trip</Button>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Trips</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left py-2">Trip #</th><th className="text-left py-2">Driver</th><th className="text-left py-2">Vehicle</th><th className="text-right py-2">Cost</th><th className="text-left py-2">Payment</th><th className="text-left py-2">Date</th></tr></thead>
              <tbody>
                {trips.map(t => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{t.tripNumber}</td>
                    <td className="py-2">{t.driverName}</td>
                    <td className="py-2">{t.vehicleNumber}</td>
                    <td className="text-right py-2">₦{(t.cost || 0).toLocaleString()}</td>
                    <td className="py-2">{paymentBadge(t.paymentTiming || 'pending', t.paymentStatus || 'unpaid')}</td>
                    <td className="py-2 text-sm">{t.scheduledDate}</td>
                  </tr>
                ))}
                {trips.length === 0 && <tr><td colSpan={6} className="py-4 text-center text-gray-400">No trips scheduled yet</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HandlingTab({ onRefresh }: { onRefresh: () => void }) {
  const [events, setEvents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [lots, setLots] = useState<any[]>([]);
  const [form, setForm] = useState({
    lotId: '', offloaderName: '', handlingCost: '',
    accountNumber: '', paymentTiming: 'after' as 'before' | 'after' | 'pending',
    paymentStatus: 'unpaid' as 'paid' | 'unpaid' | 'partial',
    notes: '', date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { loadData(); loadLots(); }, []);

  async function loadData() {
    const data = await db.getHandlingEvents();
    setEvents(data);
  }

  async function loadLots() {
    const data = await db.getLots();
    setLots(data);
  }

  async function handleSubmit() {
    if (!form.lotId || !form.offloaderName) return;
    await db.createHandlingEvent({
      lotId: form.lotId,
      offloaderName: form.offloaderName,
      handlingCost: parseFloat(form.handlingCost) || 0,
      date: form.date,
      notes: form.notes,
      accountNumber: form.accountNumber,
      paymentTiming: form.paymentTiming,
      paymentStatus: form.paymentStatus,
    });
    setShowForm(false);
    setForm({ lotId: '', offloaderName: '', handlingCost: '', accountNumber: '', paymentTiming: 'after', paymentStatus: 'unpaid', notes: '', date: new Date().toISOString().split('T')[0] });
    loadData();
    onRefresh();
  }

  const paymentBadge = (timing: string, status: string) => {
    const color = timing === 'before' ? 'bg-blue-100 text-blue-800' : timing === 'after' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800';
    return <Badge className={color}>{timing === 'before' ? 'Prepaid' : timing === 'after' ? 'Postpaid' : 'Pending'}</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Record Handling / Offloading</CardTitle>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4 mr-1" /> {showForm ? 'Cancel' : 'Record Handling'}</Button>
        </CardHeader>
        {showForm && (
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><Label className="text-xs">Lot</Label><select value={form.lotId} onChange={e => setForm({ ...form, lotId: e.target.value })} className="w-full mt-1 rounded-md border px-2 py-2 text-sm"><option value="">Select lot</option>{lots.map(l => <option key={l.id} value={l.id}>{l.lotNumber}</option>)}</select></div>
              <div><Label className="text-xs">Offloader Name</Label><Input value={form.offloaderName} onChange={e => setForm({ ...form, offloaderName: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Handling Cost (₦)</Label><Input type="number" value={form.handlingCost} onChange={e => setForm({ ...form, handlingCost: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label className="text-xs">Account Number</Label><Input value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} placeholder="Bank account for payment" className="mt-1" /></div>
              <div><Label className="text-xs">Payment Timing</Label><select value={form.paymentTiming} onChange={e => setForm({ ...form, paymentTiming: e.target.value as any })} className="w-full mt-1 rounded-md border px-2 py-2 text-sm"><option value="before">Paid Before (Prepaid)</option><option value="after">Paid After (Postpaid)</option><option value="pending">Pending</option></select></div>
              <div><Label className="text-xs">Payment Status</Label><select value={form.paymentStatus} onChange={e => setForm({ ...form, paymentStatus: e.target.value as any })} className="w-full mt-1 rounded-md border px-2 py-2 text-sm"><option value="paid">Paid</option><option value="partial">Partial</option><option value="unpaid">Unpaid</option></select></div>
            </div>
            <div><Label className="text-xs">Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any notes..." className="mt-1" /></div>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit}>Save Handling Entry</Button>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Handling Entries</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left py-2">Offloader</th><th className="text-right py-2">Cost</th><th className="text-left py-2">Payment</th><th className="text-left py-2">Notes</th><th className="text-left py-2">Date</th></tr></thead>
              <tbody>
                {events.map(h => (
                  <tr key={h.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{h.offloaderName}</td>
                    <td className="text-right py-2">₦{(h.handlingCost || 0).toLocaleString()}</td>
                    <td className="py-2">{paymentBadge(h.paymentTiming || 'pending', h.paymentStatus || 'unpaid')}</td>
                    <td className="py-2 text-gray-600">{h.notes || '—'}</td>
                    <td className="py-2 text-sm">{h.date}</td>
                  </tr>
                ))}
                {events.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-400">No handling entries yet</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
