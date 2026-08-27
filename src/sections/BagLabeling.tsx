// ============================================================================
// BAG LABELLING — Individual weigh-print cycle
// Fill, weigh, print, one at a time. No printing in advance.
// ============================================================================

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import {
  Printer, QrCode, AlertTriangle, CheckCircle, RotateCcw,
  Lock, Hash, Weight, Package
} from 'lucide-react';

interface BagLabelingProps {
  batches: any[];
}

interface BagRecord {
  id: string;
  bagNumber: number;
  batchId: string;
  batchNumber: string;
  tollId?: string;
  tollNumber?: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  grade: string;
  materialType: string;
  productionDate: string;
  weighedBy: string;
  isReprint: boolean;
  originalBagId?: string;
  reprintAuthorizedBy?: string;
  reprintReason?: string;
  qrData: string;
  createdAt: string;
}

// ============================================================================
// MOCK PRINTED BAGS
// ============================================================================

const MOCK_BAGS: BagRecord[] = [
  { id: 'bag-001', bagNumber: 1, batchId: 'batch-003', batchNumber: 'B-HDPE-2025-001', tollId: 't5', tollNumber: 'T-005', grossWeight: 52.3, tareWeight: 0.15, netWeight: 52.15, grade: 'A', materialType: 'HDPE', productionDate: '2025-07-07', weighedBy: 'Operator A', isReprint: false, qrData: 'B-HDPE-2025-001|1|T-005|52.15|A|2025-07-07', createdAt: '2025-07-07T08:30:00Z' },
  { id: 'bag-002', bagNumber: 2, batchId: 'batch-003', batchNumber: 'B-HDPE-2025-001', tollId: 't5', tollNumber: 'T-005', grossWeight: 51.8, tareWeight: 0.15, netWeight: 51.65, grade: 'A', materialType: 'HDPE', productionDate: '2025-07-07', weighedBy: 'Operator A', isReprint: false, qrData: 'B-HDPE-2025-001|2|T-005|51.65|A|2025-07-07', createdAt: '2025-07-07T08:35:00Z' },
  { id: 'bag-003', bagNumber: 3, batchId: 'batch-003', batchNumber: 'B-HDPE-2025-001', tollId: 't6', tollNumber: 'T-006', grossWeight: 53.1, tareWeight: 0.15, netWeight: 52.95, grade: 'A', materialType: 'HDPE', productionDate: '2025-07-07', weighedBy: 'Operator A', isReprint: false, qrData: 'B-HDPE-2025-001|3|T-006|52.95|A|2025-07-07', createdAt: '2025-07-07T08:42:00Z' },
];

const CLOSED_BAG_TARGET = 50; // 50kg target
const WEIGHT_TOLERANCE = 2.0; // ±2kg tolerance

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BagLabeling({ batches }: BagLabelingProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<'weigh' | 'reprint' | 'history'>('weigh');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [tareWeight, setTareWeight] = useState('0.15');
  const [grade, setGrade] = useState('A');
  const [printedBags, setPrintedBags] = useState<BagRecord[]>(MOCK_BAGS);
  const [lastPrinted, setLastPrinted] = useState<BagRecord | null>(null);
  const [reprintBagNum, setReprintBagNum] = useState('');
  const [reprintReason, setReprintReason] = useState('');
  const [authName, setAuthName] = useState('');
  const [showReprintForm, setShowReprintForm] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const selectedBatch = batches.find(b => b.id === selectedBatchId);
  const nextBagNumber = printedBags.filter(b => b.batchId === selectedBatchId).length + 1;
  const calcNet = (parseFloat(grossWeight) || 0) - (parseFloat(tareWeight) || 0);

  // Plausibility check: compare to cycle average
  const batchBags = printedBags.filter(b => b.batchId === selectedBatchId);
  const avgWeight = batchBags.length > 0
    ? batchBags.reduce((s, b) => s + b.netWeight, 0) / batchBags.length
    : CLOSED_BAG_TARGET;
  const isAnomalous = calcNet > 0 && (Math.abs(calcNet - avgWeight) > WEIGHT_TOLERANCE || Math.abs(calcNet - CLOSED_BAG_TARGET) > WEIGHT_TOLERANCE);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleWeighAndPrint = () => {
    if (!selectedBatchId || !grossWeight || calcNet <= 0) return;

    // Anomaly check
    if (isAnomalous) {
      setAlert(`Weight anomaly: ${calcNet.toFixed(2)}kg vs cycle average ${avgWeight.toFixed(2)}kg. Verify before printing.`);
      return;
    }

    const bag: BagRecord = {
      id: `bag-${Date.now()}`,
      bagNumber: nextBagNumber,
      batchId: selectedBatchId,
      batchNumber: selectedBatch?.batchNumber || '',
      grossWeight: parseFloat(grossWeight),
      tareWeight: parseFloat(tareWeight) || 0.15,
      netWeight: calcNet,
      grade,
      materialType: selectedBatch?.materialType || '',
      productionDate: new Date().toISOString().split('T')[0],
      weighedBy: user?.name || 'Unknown',
      isReprint: false,
      qrData: `${selectedBatch?.batchNumber || ''}|${nextBagNumber}|${calcNet.toFixed(2)}|${grade}|${new Date().toISOString().split('T')[0]}`,
      createdAt: new Date().toISOString(),
    };

    setPrintedBags(prev => [...prev, bag]);
    setLastPrinted(bag);
    setGrossWeight('');
  };

  const handleReprint = () => {
    if (!reprintBagNum || !reprintReason || !authName || !selectedBatchId) return;
    const originalBag = printedBags.find(
      b => b.batchId === selectedBatchId && b.bagNumber === parseInt(reprintBagNum)
    );
    if (!originalBag) {
      setAlert(`Bag #${reprintBagNum} not found in this batch`);
      return;
    }

    const reprintBag: BagRecord = {
      ...originalBag,
      id: `bag-reprint-${Date.now()}`,
      isReprint: true,
      originalBagId: originalBag.id,
      reprintAuthorizedBy: authName,
      reprintReason,
      createdAt: new Date().toISOString(),
    };

    setPrintedBags(prev => [...prev, reprintBag]);
    setLastPrinted(reprintBag);
    setShowReprintForm(false);
    setReprintBagNum('');
    setReprintReason('');
    setAuthName('');
    setAlert(`Bag #${reprintBagNum} reprinted. Original label voided.`);
  };

  const printLabel = (bag: BagRecord) => {
    const w = window.open('', '_blank', 'width=380,height=280');
    if (!w) return;

    w.document.write(`
      <html><head><title>Bag Label - ${bag.batchNumber} #${bag.bagNumber}</title>
      <style>
        @media print { body { margin:0; padding:0; } .label { border:2px solid #000!important; } }
        body { font-family: Arial, sans-serif; margin: 10px; }
        .label { width: 340px; border: 2px solid #16a34a; border-radius: 6px; padding: 12px; }
        .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 6px; margin-bottom: 8px; }
        .batch { font-size: 16px; font-weight: bold; }
        .bag-num { font-size: 28px; font-weight: bold; margin: 4px 0; }
        .qr { text-align: center; margin: 6px 0; }
        .row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 12px; border-bottom: 1px dotted #ddd; }
        .label-text { color: #666; } .value { font-weight: bold; }
        .reprint { color: #dc2626; font-weight: bold; font-size: 11px; }
        .footer { text-align: center; margin-top: 6px; font-size: 10px; color: #999; }
      </style></head><body>
      <div class="label">
        <div class="header">
          <div style="font-size:13px;font-weight:bold;color:#16a34a;">EcoRecycle FMS</div>
          <div class="batch">${bag.batchNumber}</div>
          <div class="bag-num">#${bag.bagNumber}${bag.isReprint ? ' (REPRINT)' : ''}</div>
          ${bag.isReprint ? `<div class="reprint">VOID ORIGINAL • Auth: ${bag.reprintAuthorizedBy}</div>` : ''}
        </div>
        <div class="qr">
          <svg width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="#fff"/>
            <rect x="8" y="8" width="20" height="20" fill="#000"/><rect x="12" y="12" width="12" height="12" fill="#fff"/><rect x="16" y="16" width="4" height="4" fill="#000"/>
            <rect x="52" y="8" width="20" height="20" fill="#000"/><rect x="56" y="12" width="12" height="12" fill="#fff"/><rect x="60" y="16" width="4" height="4" fill="#000"/>
            <rect x="8" y="52" width="20" height="20" fill="#000"/><rect x="12" y="56" width="12" height="12" fill="#fff"/><rect x="16" y="60" width="4" height="4" fill="#000"/>
            <rect x="38" y="8" width="4" height="4" fill="#000"/><rect x="38" y="38" width="4" height="4" fill="#000"/>
            <rect x="52" y="52" width="4" height="4" fill="#000"/><rect x="60" y="60" width="4" height="4" fill="#000"/>
            <rect x="8" y="38" width="4" height="4" fill="#000"/><rect x="52" y="38" width="4" height="4" fill="#000"/>
            <text x="40" y="76" text-anchor="middle" font-size="6" fill="#999">${bag.batchNumber}#${bag.bagNumber}</text>
          </svg>
        </div>
        <div class="row"><span class="label-text">Material</span><span class="value">${bag.materialType}</span></div>
        <div class="row"><span class="label-text">Net Weight</span><span class="value">${bag.netWeight.toFixed(2)} kg</span></div>
        <div class="row"><span class="label-text">Grade</span><span class="value">${bag.grade}</span></div>
        <div class="row"><span class="label-text">Production Date</span><span class="value">${bag.productionDate}</span></div>
        <div class="row"><span class="label-text">Weighed By</span><span class="value">${bag.weighedBy}</span></div>
        ${bag.tollNumber ? `<div class="row"><span class="label-text">Toll</span><span class="value">${bag.tollNumber}</span></div>` : ''}
        <div class="footer">Scan QR for full traceability</div>
      </div>
      <script>window.onload=()=>{window.print();};</script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <div className="space-y-4">
      {/* Alert */}
      {alert && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-800">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{alert}</span>
          <Button variant="ghost" size="sm" className="ml-auto h-6" onClick={() => setAlert(null)}>Dismiss</Button>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button variant={mode === 'weigh' ? 'default' : 'outline'} size="sm" onClick={() => setMode('weigh')}>
          <Weight className="w-4 h-4 mr-1" /> Weigh & Print
        </Button>
        <Button variant={mode === 'reprint' ? 'default' : 'outline'} size="sm" onClick={() => { setMode('reprint'); setShowReprintForm(true); }}>
          <RotateCcw className="w-4 h-4 mr-1" /> Reprint
        </Button>
        <Button variant={mode === 'history' ? 'default' : 'outline'} size="sm" onClick={() => setMode('history')}>
          <Package className="w-4 h-4 mr-1" /> History
        </Button>
      </div>

      {mode === 'weigh' && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Weigh Form */}
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Weight className="w-5 h-5" /> Weigh New Bag</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Batch *</Label>
                <select className="w-full mt-1 p-2 border rounded-md text-sm" value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)}>
                  <option value="">Select batch...</option>
                  {batches.filter((b: any) => b.status !== 'closed').map((b: any) => (
                    <option key={b.id} value={b.id}>{b.batchNumber} — {b.materialType}</option>
                  ))}
                </select>
              </div>

              {selectedBatch && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <Hash className="w-4 h-4" /> Next bag number: <strong className="text-lg">#{nextBagNumber}</strong>
                  <span className="ml-auto">Cycle avg: {avgWeight.toFixed(2)}kg</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Gross Weight (kg) *</Label>
                  <Input type="number" step="0.01" value={grossWeight} onChange={e => setGrossWeight(e.target.value)} placeholder="0.00" className="mt-1 text-lg" />
                </div>
                <div>
                  <Label>Tare Weight (kg)</Label>
                  <Input type="number" step="0.01" value={tareWeight} onChange={e => setTareWeight(e.target.value)} placeholder="0.15" className="mt-1" />
                </div>
              </div>

              {calcNet > 0 && (
                <div className={`p-3 rounded-lg text-center ${isAnomalous ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                  <p className="text-sm text-gray-500">Calculated Net Weight</p>
                  <p className={`text-3xl font-bold ${isAnomalous ? 'text-yellow-700' : 'text-green-700'}`}>{calcNet.toFixed(2)} kg</p>
                  {isAnomalous && <p className="text-xs text-yellow-600 mt-1">Outside typical range — verify before printing</p>}
                </div>
              )}

              <div>
                <Label>Grade</Label>
                <select className="w-full mt-1 p-2 border rounded-md text-sm" value={grade} onChange={e => setGrade(e.target.value)}>
                  <option value="A">A — Premium</option>
                  <option value="B">B — Standard</option>
                  <option value="C">C — Substandard</option>
                </select>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!selectedBatchId || !grossWeight || calcNet <= 0}
                onClick={handleWeighAndPrint}
              >
                <Printer className="w-4 h-4 mr-2" /> Weigh & Print Label
              </Button>
            </CardContent>
          </Card>

          {/* Last Printed */}
          <div className="space-y-4">
            {lastPrinted && (
              <Card className="border-green-200">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" /> Last Printed</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-gray-500">Bag #</span><span className="font-bold text-xl">{lastPrinted.bagNumber}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Batch</span><span className="font-medium">{lastPrinted.batchNumber}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Net Weight</span><span className="font-bold">{lastPrinted.netWeight.toFixed(2)} kg</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Grade</span><Badge>{lastPrinted.grade}</Badge></div>
                    <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{lastPrinted.productionDate}</span></div>
                    {lastPrinted.isReprint && (
                      <Badge className="bg-red-100 text-red-800 w-full justify-center mt-2">REPRINT — Original Voided</Badge>
                    )}
                    <Button variant="outline" className="w-full mt-3" onClick={() => printLabel(lastPrinted)}>
                      <Printer className="w-4 h-4 mr-2" /> Print Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            {selectedBatchId && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Batch Progress</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Bags printed:</span><strong>{batchBags.length}</strong></div>
                    <div className="flex justify-between"><span>Average weight:</span><strong>{avgWeight.toFixed(2)} kg</strong></div>
                    <div className="flex justify-between"><span>Target per bag:</span><strong>{CLOSED_BAG_TARGET} kg</strong></div>
                    <div className="flex justify-between"><span>Reprints:</span><strong>{batchBags.filter(b => b.isReprint).length}</strong></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {mode === 'reprint' && showReprintForm && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg text-orange-700 flex items-center gap-2">
              <Lock className="w-5 h-5" /> Supervisor Authorization Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Batch</Label>
              <select className="w-full mt-1 p-2 border rounded-md text-sm" value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)}>
                <option value="">Select batch...</option>
                {batches.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.batchNumber}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Bag Number to Reprint *</Label>
              <Input type="number" value={reprintBagNum} onChange={e => setReprintBagNum(e.target.value)} placeholder="e.g. 5" className="mt-1" />
            </div>
            <div>
              <Label>Reason for Reprint *</Label>
              <Input value={reprintReason} onChange={e => setReprintReason(e.target.value)} placeholder="Label damaged, illegible, etc." className="mt-1" />
            </div>
            <div>
              <Label>Authorizing Supervisor Name *</Label>
              <Input value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Supervisor name" className="mt-1" />
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700" disabled={!reprintBagNum || !reprintReason || !authName || !selectedBatchId} onClick={handleReprint}>
              <RotateCcw className="w-4 h-4 mr-2" /> Authorize & Reprint
            </Button>
            <p className="text-xs text-gray-500">The original label will be voided. This action is logged.</p>
          </CardContent>
        </Card>
      )}

      {mode === 'history' && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Printed Bags History</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-2">#</th><th className="text-left">Batch</th><th className="text-right">Net (kg)</th><th>Grade</th><th className="text-left">Date</th><th className="text-left">By</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {[...printedBags].reverse().map(bag => (
                    <tr key={bag.id} className={`border-b hover:bg-gray-50 ${bag.isReprint ? 'bg-orange-50' : ''}`}>
                      <td className="py-2 font-medium">{bag.bagNumber}</td>
                      <td>{bag.batchNumber}</td>
                      <td className="text-right font-medium">{bag.netWeight.toFixed(2)}</td>
                      <td><Badge variant="outline">{bag.grade}</Badge></td>
                      <td className="text-xs">{bag.productionDate}</td>
                      <td className="text-xs">{bag.weighedBy}</td>
                      <td>{bag.isReprint ? <Badge className="bg-orange-100 text-orange-800">Reprint</Badge> : <Badge className="bg-green-100 text-green-800">Original</Badge>}</td>
                      <td><Button variant="ghost" size="sm" onClick={() => printLabel(bag)}><Printer className="w-4 h-4" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
