// ============================================================================
// PURCHASE RECEIPT / GRN — Goods Received Note
// Now with: Account info, Payment tracking, Cost per batch tally
// ============================================================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/services/database';
import {
  Truck, Printer, CheckCircle, AlertTriangle, Scale,
  ClipboardList, Search, X, FileText, CreditCard,
  Banknote, Landmark, Wallet, CircleDollarSign, CalendarCheck,
  Droplets
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface GRNRecord {
  id: string;
  grnNumber: string;
  lotNumber: string;
  vendorName: string;
  materialType: string;
  vehicleNumber: string;
  driverName: string;
  weighbridgeIn: number;
  weighbridgeOut: number;
  netWeight: number;
  tareWeight: number;
  moistureContent: number;
  contaminationPercent: number;
  pricePerKg: number;
  totalCost: number;
  receivedBy: string;
  receivedDate: string;
  receivedTime: string;
  qualityCheck: 'pass' | 'fail' | 'pending';
  storageLocation: string;
  notes: string;
  status: 'draft' | 'verified' | 'rejected' | 'stored';
  batchAssigned?: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  amountPaid: number;
  amountOutstanding: number;
  paidDate?: string;
  paymentMethod?: 'bank_transfer' | 'cash' | 'cheque' | 'mobile_money';
  accountPaidFrom?: string;
  paidBy?: string;
}

const ACCOUNTS = [
  'EcoBank Current (0123456789)',
  'FirstBank Business (9876543210)',
  'Cash Box',
  'GTBank Savings (1122334455)',
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PurchaseReceipt() {
  const { user } = useAuth();
  const [mode, setMode] = useState<'list' | 'create' | 'detail' | 'payment'>('list');
  const [selectedGRN, setSelectedGRN] = useState<GRNRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'partial' | 'paid'>('all');
  const [grns, setGrns] = useState<GRNRecord[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [form, setForm] = useState({
    lotNumber: '', vendorName: '', materialType: '', vehicleNumber: '', driverName: '',
    weighbridgeIn: '', weighbridgeOut: '', tareWeight: '', sampleWetWeight: '', sampleDryWeight: '', contaminationPercent: '',
    pricePerKg: '', storageLocation: '', notes: '',
    accountPaidFrom: '', paymentMethod: '' as GRNRecord['paymentMethod'] | '',
    amountPaid: '', paidDate: '',
  });

  // Auto-calculate moisture % from sample weights
  const calcMoisture = (): number => {
    const wet = parseFloat(form.sampleWetWeight) || 0;
    const dry = parseFloat(form.sampleDryWeight) || 0;
    if (wet > 0 && dry > 0 && dry <= wet) {
      return Math.round(((wet - dry) / wet) * 10000) / 100;
    }
    return 0;
  };

  const [paymentForm, setPaymentForm] = useState({
    amountPaid: '', paymentMethod: 'bank_transfer' as GRNRecord['paymentMethod'],
    accountPaidFrom: '', paidDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadGRNs();
  }, [refreshKey]);

  async function loadGRNs() {
    const data = await db.getGRNs();
    const mapped: GRNRecord[] = data.map(g => ({
      id: g.id,
      grnNumber: g.grnNumber,
      lotNumber: g.lotNumber,
      vendorName: g.vendorName,
      materialType: 'PET Green',
      vehicleNumber: g.vehicleNumber || '',
      driverName: g.driverName || '',
      weighbridgeIn: g.grossWeight || 0,
      weighbridgeOut: g.tareWeight || 0,
      netWeight: g.netWeight || 0,
      tareWeight: g.tareWeight || 0,
      moistureContent: g.moistureContent || 0,
      contaminationPercent: g.foreignParticles || 0,
      pricePerKg: g.pricePerKg || 0,
      totalCost: g.totalAmount || 0,
      receivedBy: user?.name || 'System',
      receivedDate: g.receiptDate ? g.receiptDate.split('T')[0] : new Date().toISOString().split('T')[0],
      receivedTime: new Date().toTimeString().slice(0, 5),
      qualityCheck: (g.notes?.includes('fail') ? 'fail' : g.notes?.includes('pending') ? 'pending' : 'pass') as 'pass' | 'fail' | 'pending',
      storageLocation: '',
      notes: g.notes || '',
      status: 'stored',
      batchAssigned: g.batchNumber || undefined,
      paymentStatus: (g.paymentStatus === 'paid' ? 'paid' : g.paymentStatus === 'partial' ? 'partial' : 'unpaid') as 'unpaid' | 'partial' | 'paid',
      amountPaid: g.amountPaid || 0,
      amountOutstanding: (g.totalAmount || 0) - (g.amountPaid || 0),
      paidDate: g.paymentDate || undefined,
      paymentMethod: (g.paymentMethod || 'bank_transfer') as GRNRecord['paymentMethod'],
      accountPaidFrom: g.paymentMethod || undefined,
      paidBy: user?.name || 'System',
    }));
    setGrns(mapped);
  }

  const filteredGRNs = grns.filter(g => {
    const matchesSearch =
      g.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || g.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const calcNet = (parseFloat(form.weighbridgeIn) || 0) - (parseFloat(form.weighbridgeOut) || 0);
  const calcTotalCost = calcNet * (parseFloat(form.pricePerKg) || 0);

  const totalOutstanding = grns.reduce((s, g) => s + g.amountOutstanding, 0);
  const totalPaid = grns.reduce((s, g) => s + g.amountPaid, 0);
  const totalPayable = grns.reduce((s, g) => s + g.totalCost, 0);

  const handleCreateGRN = async () => {
    const net = calcNet;
    const total = calcTotalCost;
    const amountPaid = parseFloat(form.amountPaid) || 0;
    const paymentStatus: 'unpaid' | 'partial' | 'paid' = amountPaid >= total ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid';
    const moisture = calcMoisture();

    await db.createGRN({
      grnNumber: `GRN-${new Date().getFullYear()}-${String(grns.length + 1).padStart(3, '0')}`,
      lotId: '',
      batchNumber: form.lotNumber,
      vendorId: '',
      receiptDate: new Date().toISOString(),
      totalKg: net,
      pricePerKg: parseFloat(form.pricePerKg) || 0,
      totalAmount: total,
      amountPaid,
      paymentStatus,
      paymentDate: form.paidDate || null,
      paymentMethod: form.paymentMethod || '',
      vehicleNumber: form.vehicleNumber,
      driverName: form.driverName,
      grossWeight: parseFloat(form.weighbridgeIn) || 0,
      tareWeight: parseFloat(form.weighbridgeOut) || 0,
      netWeight: net,
      sampleWetWeight: parseFloat(form.sampleWetWeight) || 0,
      sampleDryWeight: parseFloat(form.sampleDryWeight) || 0,
      moistureContent: moisture,
      foreignParticles: parseFloat(form.contaminationPercent) || 0,
      notes: form.notes,
      createdBy: user?.id || '1',
    });

    setRefreshKey(k => k + 1);
    setMode('list');
    setForm({
      lotNumber: '', vendorName: '', materialType: '', vehicleNumber: '', driverName: '',
      weighbridgeIn: '', weighbridgeOut: '', tareWeight: '', sampleWetWeight: '', sampleDryWeight: '', contaminationPercent: '',
      pricePerKg: '', storageLocation: '', notes: '',
      accountPaidFrom: '', paymentMethod: '', amountPaid: '', paidDate: '',
    });
  };

  const openPayment = (grn: GRNRecord) => {
    setSelectedGRN(grn);
    setPaymentForm({
      amountPaid: grn.amountOutstanding.toString(),
      paymentMethod: grn.paymentMethod || 'bank_transfer',
      accountPaidFrom: grn.accountPaidFrom || '',
      paidDate: new Date().toISOString().split('T')[0],
    });
    setMode('payment');
  };

  const handleRecordPayment = async () => {
    if (!selectedGRN) return;
    const amountPaid = parseFloat(paymentForm.amountPaid) || 0;
    const newTotalPaid = selectedGRN.amountPaid + amountPaid;
    const totalCost = selectedGRN.totalCost;
    const paymentStatus: 'unpaid' | 'partial' | 'paid' = newTotalPaid >= totalCost ? 'paid' : newTotalPaid > 0 ? 'partial' : 'unpaid';

    await db.updateGRN(selectedGRN.id, {
      amountPaid: newTotalPaid,
      paymentStatus,
      paymentDate: paymentForm.paidDate,
      paymentMethod: paymentForm.paymentMethod,
    });

    setRefreshKey(k => k + 1);
    setMode('list');
    setSelectedGRN(null);
  };

  const printGRN = (grn: GRNRecord) => {
    const w = window.open('', '_blank', 'width=600,height=700');
    if (!w) return;
    w.document.write(`
      <html><head><title>GRN - ${grn.grnNumber}</title>
      <style>
        @media print { body { margin:0; } }
        body { font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 3px solid #16a34a; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { font-size: 22px; font-weight: bold; color: #16a34a; }
        .grn-title { font-size: 28px; font-weight: bold; margin: 10px 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #ccc; font-size: 14px; }
        .label { color: #666; font-weight: bold; } .value { font-weight: normal; }
        .section { margin: 15px 0; padding: 10px; background: #f9fafb; border-radius: 6px; }
        .section-title { font-weight: bold; margin-bottom: 8px; color: #374151; }
        .signature { margin-top: 40px; display: flex; justify-content: space-between; }
        .sig-line { border-top: 1px solid #000; width: 200px; padding-top: 5px; text-align: center; font-size: 12px; }
        .qr { text-align: center; margin: 15px 0; }
        .status-pass { color: #16a34a; font-weight: bold; }
        .status-fail { color: #dc2626; font-weight: bold; }
        .status-pending { color: #d97706; font-weight: bold; }
        .payment-paid { color: #16a34a; }
        .payment-partial { color: #d97706; }
        .payment-unpaid { color: #dc2626; }
        .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; }
      </style></head><body>
        <div class="header">
          <div class="logo">EcoRecycle — Bamboo Trybe Limited</div>
          <div class="grn-title">GOODS RECEIVED NOTE</div>
          <div style="font-size:14px;color:#666;">Factory: Osogbo, Osun State, Nigeria</div>
        </div>
        <div class="row"><span class="label">GRN Number:</span><span class="value">${grn.grnNumber}</span></div>
        <div class="row"><span class="label">Date:</span><span class="value">${grn.receivedDate} at ${grn.receivedTime}</span></div>
        <div class="row"><span class="label">Lot Number:</span><span class="value">${grn.lotNumber}</span></div>
        <div class="row"><span class="label">Batch Assigned:</span><span class="value">${grn.batchAssigned || 'Not yet assigned'}</span></div>

        <div class="section">
          <div class="section-title">Vendor & Vehicle</div>
          <div class="row"><span class="label">Vendor:</span><span class="value">${grn.vendorName}</span></div>
          <div class="row"><span class="label">Vehicle Number:</span><span class="value">${grn.vehicleNumber}</span></div>
          <div class="row"><span class="label">Driver:</span><span class="value">${grn.driverName}</span></div>
          <div class="row"><span class="label">Material Type:</span><span class="value">${grn.materialType}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Weight Details</div>
          <div class="row"><span class="label">Weighbridge In:</span><span class="value">${grn.weighbridgeIn.toLocaleString()} kg</span></div>
          <div class="row"><span class="label">Weighbridge Out:</span><span class="value">${grn.weighbridgeOut.toLocaleString()} kg</span></div>
          <div class="row"><span class="label">Net Weight:</span><span class="value" style="font-size:16px;font-weight:bold;">${grn.netWeight.toLocaleString()} kg</span></div>
        </div>

        <div class="section">
          <div class="section-title">Pricing</div>
          <div class="row"><span class="label">Price per kg:</span><span class="value">₦${grn.pricePerKg}</span></div>
          <div class="row"><span class="label">Total Cost:</span><span class="value" style="font-size:16px;font-weight:bold;">₦${grn.totalCost.toLocaleString()}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Quality Check</div>
          <div class="row"><span class="label">Moisture Content:</span><span class="value">${grn.moistureContent}%</span></div>
          <div class="row"><span class="label">Contamination:</span><span class="value">${grn.contaminationPercent}%</span></div>
          <div class="row"><span class="label">Quality Result:</span><span class="status-${grn.qualityCheck}">${grn.qualityCheck.toUpperCase()}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Payment Status</div>
          <div class="row"><span class="label">Status:</span><span class="value payment-${grn.paymentStatus}">${grn.paymentStatus.toUpperCase()}</span></div>
          <div class="row"><span class="label">Amount Paid:</span><span class="value">₦${grn.amountPaid.toLocaleString()}</span></div>
          <div class="row"><span class="label">Outstanding:</span><span class="value">₦${grn.amountOutstanding.toLocaleString()}</span></div>
          ${grn.paidDate ? `<div class="row"><span class="label">Paid Date:</span><span class="value">${grn.paidDate}</span></div>` : ''}
          ${grn.paymentMethod ? `<div class="row"><span class="label">Method:</span><span class="value">${grn.paymentMethod.replace('_', ' ')}</span></div>` : ''}
          ${grn.accountPaidFrom ? `<div class="row"><span class="label">Paid From:</span><span class="value">${grn.accountPaidFrom}</span></div>` : ''}
        </div>

        <div class="row"><span class="label">Storage Location:</span><span class="value">${grn.storageLocation || 'Not assigned'}</span></div>
        <div class="row"><span class="label">Received By:</span><span class="value">${grn.receivedBy}</span></div>
        ${grn.notes ? `<div class="row"><span class="label">Notes:</span><span class="value">${grn.notes}</span></div>` : ''}

        <div class="signature">
          <div class="sig-line">Receiver Signature</div>
          <div class="sig-line">Security Signature</div>
        </div>
        <div class="footer">EcoRecycle FMS — Bamboo Trybe Limited, Osogbo, Osun State<br/>GRN generated on ${new Date().toLocaleString()}</div>
        <script>window.onload=()=>{window.print();}</script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Goods Receipt</h2>
          <p className="text-sm text-gray-500">Inbound material verification, weighbridge, quality control & supplier payments</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setMode('create')}>
          <Truck className="w-4 h-4 mr-2" /> Record New Delivery
        </Button>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-500">Total Payable</p>
            </div>
            <p className="text-2xl font-bold">₦{totalPayable.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-500">Paid to Sellers</p>
            </div>
            <p className="text-2xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-gray-500">Outstanding to Sellers</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">₦{totalOutstanding.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-500">Active Accounts</p>
            </div>
            <p className="text-2xl font-bold">{ACCOUNTS.length}</p>
          </CardContent>
        </Card>
      </div>

      {mode === 'list' && (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by GRN #, vendor, lot, vehicle..."
                className="pl-10"
              />
            </div>
            <select
              className="p-2 border rounded-md text-sm"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">All Receipts</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">GRN #</th>
                      <th className="text-left">Vendor</th>
                      <th className="text-left">Material</th>
                      <th className="text-right">Net (kg)</th>
                      <th className="text-right">₦/kg</th>
                      <th className="text-right">Total</th>
                      <th className="text-center">Quality</th>
                      <th className="text-center">Payment</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGRNs.map(g => (
                      <tr key={g.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 font-medium">{g.grnNumber}</td>
                        <td>{g.vendorName}</td>
                        <td>{g.materialType}</td>
                        <td className="text-right font-medium">{g.netWeight.toLocaleString()}</td>
                        <td className="text-right">₦{g.pricePerKg}</td>
                        <td className="text-right font-medium">₦{g.totalCost.toLocaleString()}</td>
                        <td className="text-center"><QualityBadge status={g.qualityCheck} /></td>
                        <td className="text-center"><PaymentBadge grn={g} /></td>
                        <td className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedGRN(g); setMode('detail'); }}><FileText className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => printGRN(g)}><Printer className="w-4 h-4" /></Button>
                          {g.paymentStatus !== 'paid' && (
                            <Button variant="ghost" size="sm" onClick={() => openPayment(g)} title="Record Payment"><Banknote className="w-4 h-4 text-green-600" /></Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {mode === 'create' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Truck className="w-5 h-5" /> New Delivery Receipt</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Lot Number *</Label><Input value={form.lotNumber} onChange={e => setForm({ ...form, lotNumber: e.target.value })} placeholder="LOT-2025-XXX" className="mt-1" /></div>
                <div><Label>Vendor Name *</Label><Input value={form.vendorName} onChange={e => setForm({ ...form, vendorName: e.target.value })} placeholder="Vendor name" className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Material Type *</Label><Input value={form.materialType} onChange={e => setForm({ ...form, materialType: e.target.value })} placeholder="PET Green, HDPE..." className="mt-1" /></div>
                <div><Label>Vehicle Number *</Label><Input value={form.vehicleNumber} onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} placeholder="LAG-123-AB" className="mt-1" /></div>
              </div>
              <div><Label>Driver Name</Label><Input value={form.driverName} onChange={e => setForm({ ...form, driverName: e.target.value })} placeholder="Driver name" className="mt-1" /></div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1"><Scale className="w-4 h-4" /> Weighbridge Reading</p>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs">Vehicle In (kg)</Label><Input type="number" value={form.weighbridgeIn} onChange={e => setForm({ ...form, weighbridgeIn: e.target.value })} placeholder="0" className="mt-1" /></div>
                  <div><Label className="text-xs">Vehicle Out (kg)</Label><Input type="number" value={form.weighbridgeOut} onChange={e => setForm({ ...form, weighbridgeOut: e.target.value })} placeholder="0" className="mt-1" /></div>
                  <div><Label className="text-xs">Tare (kg)</Label><Input type="number" value={form.tareWeight} onChange={e => setForm({ ...form, tareWeight: e.target.value })} placeholder="0" className="mt-1" /></div>
                </div>
                {calcNet > 0 && (
                  <div className="mt-2 p-2 bg-white rounded text-center">
                    <span className="text-sm text-gray-500">Calculated Net Weight: </span>
                    <span className="text-lg font-bold text-green-600">{calcNet.toLocaleString()} kg</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-2 flex items-center gap-1"><CreditCard className="w-4 h-4" /> Pricing</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Price per kg (₦)</Label><Input type="number" value={form.pricePerKg} onChange={e => setForm({ ...form, pricePerKg: e.target.value })} placeholder="0" className="mt-1" /></div>
                  <div><Label className="text-xs">Total Cost (₦)</Label><Input value={calcTotalCost > 0 ? calcTotalCost.toLocaleString() : ''} disabled className="mt-1 bg-gray-50" /></div>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-1"><Droplets className="w-4 h-4" /> Moisture Test (Auto-Calculated from Sample Weights)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs">Sample Wet Weight (kg)</Label><Input type="number" step="0.01" value={form.sampleWetWeight} onChange={e => setForm({ ...form, sampleWetWeight: e.target.value })} placeholder="0.00" className="mt-1" /></div>
                  <div><Label className="text-xs">Sample Dry Weight (kg)</Label><Input type="number" step="0.01" value={form.sampleDryWeight} onChange={e => setForm({ ...form, sampleDryWeight: e.target.value })} placeholder="0.00" className="mt-1" /></div>
                  <div><Label className="text-xs">Moisture (%)</Label><Input type="number" value={calcMoisture() > 0 ? calcMoisture().toFixed(2) : ''} disabled className="mt-1 bg-gray-50 font-medium text-green-700" placeholder="Auto" /></div>
                </div>
                {calcMoisture() > 0 && (
                  <p className="mt-2 text-xs text-yellow-700">Formula: (({form.sampleWetWeight || 0} - {form.sampleDryWeight || 0}) / {form.sampleWetWeight || 0}) × 100 = <strong>{calcMoisture().toFixed(2)}%</strong></p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>Contamination (%)</Label><Input type="number" step="0.1" value={form.contaminationPercent} onChange={e => setForm({ ...form, contaminationPercent: e.target.value })} placeholder="0.0" className="mt-1" /></div>
              </div>
              <div><Label>Storage Location</Label><Input value={form.storageLocation} onChange={e => setForm({ ...form, storageLocation: e.target.value })} placeholder="e.g. Bay A" className="mt-1" /></div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any observations..." className="mt-1" /></div>

              {/* Payment Section at creation */}
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm font-medium text-purple-800 mb-2 flex items-center gap-1"><Landmark className="w-4 h-4" /> Initial Payment (optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Payment Method</Label>
                    <select className="w-full mt-1 p-2 border rounded-md text-sm" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value as GRNRecord['paymentMethod'] })}>
                      <option value="">Select...</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="mobile_money">Mobile Money</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Paid From Account</Label>
                    <select className="w-full mt-1 p-2 border rounded-md text-sm" value={form.accountPaidFrom} onChange={e => setForm({ ...form, accountPaidFrom: e.target.value })}>
                      <option value="">Select account...</option>
                      {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div><Label className="text-xs">Amount Paid (₦)</Label><Input type="number" value={form.amountPaid} onChange={e => setForm({ ...form, amountPaid: e.target.value })} placeholder="0" className="mt-1" /></div>
                  <div><Label className="text-xs">Payment Date</Label><Input type="date" value={form.paidDate} onChange={e => setForm({ ...form, paidDate: e.target.value })} className="mt-1" /></div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setMode('list')}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleCreateGRN}><CheckCircle className="w-4 h-4 mr-1" /> Save GRN</Button>
              </div>
            </CardContent>
          </Card>

          {/* Rules */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Receipt Checklist</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Vehicle weighed before unloading</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Vehicle weighed after unloading</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Visual quality check completed</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Moisture test done</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Contamination check done</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Price per kg agreed & recorded</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Payment method & account noted</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Active Accounts</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {ACCOUNTS.map(a => (
                    <li key={a} className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-purple-500" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {mode === 'detail' && selectedGRN && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{selectedGRN.grnNumber}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => printGRN(selectedGRN)}><Printer className="w-4 h-4 mr-1" /> Print</Button>
                {selectedGRN.paymentStatus !== 'paid' && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => openPayment(selectedGRN)}><Banknote className="w-4 h-4 mr-1" /> Record Payment</Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setMode('list')}><X className="w-4 h-4 mr-1" /> Close</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div><p className="text-xs text-gray-500">Lot</p><p className="font-medium">{selectedGRN.lotNumber}</p></div>
                <div><p className="text-xs text-gray-500">Vendor</p><p className="font-medium">{selectedGRN.vendorName}</p></div>
                <div><p className="text-xs text-gray-500">Material</p><p className="font-medium">{selectedGRN.materialType}</p></div>
                <div><p className="text-xs text-gray-500">Vehicle</p><p className="font-medium">{selectedGRN.vehicleNumber}</p></div>
                <div><p className="text-xs text-gray-500">Net Weight</p><p className="font-bold text-green-600">{selectedGRN.netWeight.toLocaleString()} kg</p></div>
                <div><p className="text-xs text-gray-500">Price/kg</p><p className="font-medium">₦{selectedGRN.pricePerKg}</p></div>
                <div><p className="text-xs text-gray-500">Total Cost</p><p className="font-bold text-blue-600">₦{selectedGRN.totalCost.toLocaleString()}</p></div>
                <div><p className="text-xs text-gray-500">Batch</p><p className="font-medium">{selectedGRN.batchAssigned || '—'}</p></div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div><p className="text-xs text-gray-500">Moisture</p><p className="font-medium">{selectedGRN.moistureContent}%</p></div>
                <div><p className="text-xs text-gray-500">Contamination</p><p className="font-medium">{selectedGRN.contaminationPercent}%</p></div>
                <div><p className="text-xs text-gray-500">Quality</p><p className="font-medium"><QualityBadge status={selectedGRN.qualityCheck} /></p></div>
                <div><p className="text-xs text-gray-500">Storage</p><p className="font-medium">{selectedGRN.storageLocation || '—'}</p></div>
              </div>

              {/* Payment Details */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment Details</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div><p className="text-xs text-gray-500">Payment Status</p><PaymentBadge grn={selectedGRN} /></div>
                  <div><p className="text-xs text-gray-500">Amount Paid</p><p className="font-medium text-green-600">₦{selectedGRN.amountPaid.toLocaleString()}</p></div>
                  <div><p className="text-xs text-gray-500">Outstanding</p><p className="font-medium text-red-600">₦{selectedGRN.amountOutstanding.toLocaleString()}</p></div>
                  <div><p className="text-xs text-gray-500">Paid Date</p><p className="font-medium">{selectedGRN.paidDate || '—'}</p></div>
                  <div><p className="text-xs text-gray-500">Payment Method</p><p className="font-medium">{selectedGRN.paymentMethod ? selectedGRN.paymentMethod.replace('_', ' ') : '—'}</p></div>
                  <div><p className="text-xs text-gray-500">Paid From Account</p><p className="font-medium">{selectedGRN.accountPaidFrom || '—'}</p></div>
                  <div><p className="text-xs text-gray-500">Recorded By</p><p className="font-medium">{selectedGRN.paidBy || '—'}</p></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {mode === 'payment' && selectedGRN && (
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Banknote className="w-5 h-5" /> Record Payment to {selectedGRN.vendorName}</CardTitle></CardHeader>
          <CardContent className="space-y-4 max-w-lg">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">GRN: <strong>{selectedGRN.grnNumber}</strong> • Total: <strong>₦{selectedGRN.totalCost.toLocaleString()}</strong></p>
              <p className="text-sm text-blue-800">Already Paid: <strong>₦{selectedGRN.amountPaid.toLocaleString()}</strong> • Outstanding: <strong className="text-red-600">₦{selectedGRN.amountOutstanding.toLocaleString()}</strong></p>
            </div>

            <div>
              <Label>Amount Paid (₦) *</Label>
              <Input type="number" value={paymentForm.amountPaid} onChange={e => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })} placeholder={selectedGRN.amountOutstanding.toString()} className="mt-1" />
            </div>
            <div>
              <Label>Payment Method *</Label>
              <select className="w-full mt-1 p-2 border rounded-md text-sm" value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as GRNRecord['paymentMethod'] })}>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>
            <div>
              <Label>Paid From Account *</Label>
              <select className="w-full mt-1 p-2 border rounded-md text-sm" value={paymentForm.accountPaidFrom} onChange={e => setPaymentForm({ ...paymentForm, accountPaidFrom: e.target.value })}>
                <option value="">Select account...</option>
                {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <Label>Payment Date *</Label>
              <Input type="date" value={paymentForm.paidDate} onChange={e => setPaymentForm({ ...paymentForm, paidDate: e.target.value })} className="mt-1" />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setMode('list')}><X className="w-4 h-4 mr-1" /> Cancel</Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleRecordPayment}><CheckCircle className="w-4 h-4 mr-1" /> Confirm Payment</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// BADGES
// ============================================================================

function QualityBadge({ status }: { status: GRNRecord['qualityCheck'] }) {
  const colors = { pass: 'bg-green-100 text-green-800', fail: 'bg-red-100 text-red-800', pending: 'bg-yellow-100 text-yellow-800' };
  const labels = { pass: 'PASS', fail: 'FAIL', pending: 'PENDING' };
  return <Badge className={colors[status]}>{labels[status]}</Badge>;
}

function PaymentBadge({ grn }: { grn: GRNRecord }) {
  const colors = { paid: 'bg-green-100 text-green-800', partial: 'bg-yellow-100 text-yellow-800', unpaid: 'bg-red-100 text-red-800' };
  const labels = {
    paid: `PAID ₦${grn.amountPaid.toLocaleString()}`,
    partial: `PARTIAL ₦${grn.amountPaid.toLocaleString()}`,
    unpaid: 'UNPAID'
  };
  return <Badge className={colors[grn.paymentStatus]}>{labels[grn.paymentStatus]}</Badge>;
}
