// ============================================================================
// BATCH CONTROL MODULE
// Toll-to-Batch Assignment Rule:
//   - If toll exceeds remaining capacity AND batch ≥ 75% full → add to existing
//   - If toll exceeds remaining capacity AND batch < 75% full → close batch,
//     create new batch with toll as starter
// ============================================================================

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { BagLabeling } from './BagLabeling';
import {
  Package, Plus, AlertTriangle, CheckCircle, Settings,
  TrendingDown, Scale, Shield, AlertOctagon, ChevronRight,
  Lock, Unlock, BarChart3, ArrowRightLeft
} from 'lucide-react';

// ============================================================================
// MOCK DATA
// ============================================================================

const MATERIAL_BATCH_SIZES: Record<string, number> = {
  'PET Clear': 5000,
  'PET Green': 5000,
  'HDPE': 3000,
  'PP': 4000,
  'LDPE': 2500,
};

const MOCK_BATCHES = [
  {
    id: 'batch-001',
    batchNumber: 'B-PET-2025-001',
    materialType: 'PET Green',
    targetKg: 5000,
    currentKg: 4730,
    status: 'open',
    createdDate: '2025-07-01',
    tollCount: 4,
    stage: 'receiving',
    completedDate: null,
  },
  {
    id: 'batch-002',
    batchNumber: 'B-PET-2025-002',
    materialType: 'PET Green',
    targetKg: 5000,
    currentKg: 0,
    status: 'awaiting',
    createdDate: '2025-07-08',
    tollCount: 0,
    stage: 'awaiting',
    completedDate: null,
  },
  {
    id: 'batch-003',
    batchNumber: 'B-HDPE-2025-001',
    materialType: 'HDPE',
    targetKg: 3000,
    currentKg: 3150,
    status: 'closed',
    createdDate: '2025-07-03',
    tollCount: 3,
    stage: 'bagging',
    completedDate: '2025-07-07',
  },
  {
    id: 'batch-004',
    batchNumber: 'B-PETC-2025-001',
    materialType: 'PET Clear',
    targetKg: 5000,
    currentKg: 5000,
    status: 'closed',
    createdDate: '2025-07-02',
    tollCount: 6,
    stage: 'grinding',
    completedDate: '2025-07-06',
  },
];

const MOCK_TOLLS = [
  { id: 't1', tollNumber: 'T-001', batchId: 'batch-001', vendorName: 'Adebayo Musa', netWeight: 1950, grossWeight: 2100, tareWeight: 150, moisture: 2.1, contamination: 0.5, date: '2025-07-01' },
  { id: 't2', tollNumber: 'T-002', batchId: 'batch-001', vendorName: 'Olaoluwa Plastics', netWeight: 1280, grossWeight: 1380, tareWeight: 100, moisture: 1.8, contamination: 0.3, date: '2025-07-03' },
  { id: 't3', tollNumber: 'T-003', batchId: 'batch-001', vendorName: 'Iya Kemi', netWeight: 850, grossWeight: 920, tareWeight: 70, moisture: 3.2, contamination: 1.1, date: '2025-07-05' },
  { id: 't4', tollNumber: 'T-004', batchId: 'batch-001', vendorName: 'Adebayo Musa', netWeight: 650, grossWeight: 700, tareWeight: 50, moisture: 1.5, contamination: 0.2, date: '2025-07-07' },
  { id: 't5', tollNumber: 'T-005', batchId: 'batch-003', vendorName: 'RecycleHub', netWeight: 1200, grossWeight: 1290, tareWeight: 90, moisture: 2.0, contamination: 0.4, date: '2025-07-04' },
  { id: 't6', tollNumber: 'T-006', batchId: 'batch-003', vendorName: 'Olaoluwa Plastics', netWeight: 1100, grossWeight: 1180, tareWeight: 80, moisture: 1.5, contamination: 0.6, date: '2025-07-05' },
  { id: 't7', tollNumber: 'T-007', batchId: 'batch-003', vendorName: 'Iya Kemi', netWeight: 850, grossWeight: 920, tareWeight: 70, moisture: 2.8, contamination: 0.9, date: '2025-07-06' },
];

const MOCK_RECONCILIATIONS = [
  { id: 'r1', batchNumber: 'B-PET-2025-001', fromStage: 'sorted', toStage: 'grinding', expected: 4730, actual: 4580, gapKg: 150, gapPercent: 3.17, status: 'open', severity: 'high', explanation: '' },
  { id: 'r2', batchNumber: 'B-HDPE-2025-001', fromStage: 'sorted', toStage: 'grinding', expected: 3150, actual: 3050, gapKg: 100, gapPercent: 3.17, status: 'explained', severity: 'medium', explanation: 'Moisture loss during extended storage' },
  { id: 'r3', batchNumber: 'B-HDPE-2025-001', fromStage: 'grinding', toStage: 'washing', expected: 3050, actual: 3020, gapKg: 30, gapPercent: 0.98, status: 'open', severity: 'low', explanation: '' },
  { id: 'r4', batchNumber: 'B-PETC-2025-001', fromStage: 'sorted', toStage: 'grinding', expected: 5000, actual: 4850, gapKg: 150, gapPercent: 3.0, status: 'corrected', severity: 'medium', explanation: 'Scale calibration error, re-weighed' },
];

const MOCK_INTEGRITY_SCORES = [
  {
    batchId: 'batch-003', batchNumber: 'B-HDPE-2025-001', totalScore: 87, maxScore: 100, isPassing: true,
    components: [
      { name: 'Weight Reconciliation', score: 18, maxScore: 20, weight: 0.20, details: '2 gaps, 1 unexplained' },
      { name: 'Stage Completeness', score: 20, maxScore: 20, weight: 0.20, details: 'All stages recorded on time' },
      { name: 'Toll Documentation', score: 17, maxScore: 20, weight: 0.20, details: '3/3 tolls fully documented' },
      { name: 'Timeliness', score: 16, maxScore: 20, weight: 0.20, details: '1 entry backdated by 1 day' },
      { name: 'Bag Labelling', score: 16, maxScore: 20, weight: 0.20, details: '63/63 bags labelled, 1 reprint' },
    ],
    blocksDispatch: false,
  },
  {
    batchId: 'batch-004', batchNumber: 'B-PETC-2025-001', totalScore: 62, maxScore: 100, isPassing: false,
    components: [
      { name: 'Weight Reconciliation', score: 12, maxScore: 20, weight: 0.20, details: '3 gaps, 2 unexplained' },
      { name: 'Stage Completeness', score: 15, maxScore: 20, weight: 0.20, details: 'Missing drying checkpoint' },
      { name: 'Toll Documentation', score: 18, maxScore: 20, weight: 0.20, details: '6/6 tolls documented' },
      { name: 'Timeliness', score: 8, maxScore: 20, weight: 0.20, details: '4 entries backdated' },
      { name: 'Bag Labelling', score: 9, maxScore: 20, weight: 0.20, details: '92/96 bags labelled, 3 reprints' },
    ],
    blocksDispatch: true,
  },
];

// ============================================================================
// TOLL-TO-BATCH ASSIGNMENT ENGINE
// ============================================================================

const THRESHOLD_PERCENT = 75;

interface TollAssignmentResult {
  action: 'add_to_existing' | 'close_and_create' | 'fits';
  targetBatchId: string;
  targetBatchNumber: string;
  newBatchNumber?: string;
  message: string;
  willOvershoot: boolean;
}

function determineTollAssignment(
  tollNetWeight: number,
  openBatches: typeof MOCK_BATCHES,
  materialType: string
): TollAssignmentResult {
  // Find the open batch for this material
  const materialBatches = openBatches.filter(b => b.materialType === materialType && (b.status === 'open' || b.status === 'awaiting'));
  const currentBatch = materialBatches.find(b => b.status === 'open') || materialBatches[0];

  if (!currentBatch) {
    return {
      action: 'close_and_create',
      targetBatchId: '',
      targetBatchNumber: '',
      newBatchNumber: `B-${materialType.replace(/\s/g, '').substring(0, 4).toUpperCase()}-${new Date().getFullYear()}-XXX`,
      message: `No open batch for ${materialType}. New batch will be created.`,
      willOvershoot: false,
    };
  }

  const remaining = currentBatch.targetKg - currentBatch.currentKg;
  const fillPercent = (currentBatch.currentKg / currentBatch.targetKg) * 100;
  const willOvershoot = tollNetWeight > remaining;

  // Rule: if toll exceeds capacity...
  if (willOvershoot) {
    if (fillPercent >= THRESHOLD_PERCENT) {
      // Batch is at 75% or more → add to existing (allow overshoot)
      return {
        action: 'add_to_existing',
        targetBatchId: currentBatch.id,
        targetBatchNumber: currentBatch.batchNumber,
        message: `Batch is ${fillPercent.toFixed(0)}% full (≥${THRESHOLD_PERCENT}%). Toll will be added to existing batch ${currentBatch.batchNumber}. Total will be ${(currentBatch.currentKg + tollNetWeight).toLocaleString()} kg.`,
        willOvershoot: true,
      };
    } else {
      // Batch is below 75% → close it, create new batch with this toll
      return {
        action: 'close_and_create',
        targetBatchId: currentBatch.id,
        targetBatchNumber: currentBatch.batchNumber,
        newBatchNumber: `B-${materialType.replace(/\s/g, '').substring(0, 4).toUpperCase()}-${new Date().getFullYear()}-XXX`,
        message: `Batch is only ${fillPercent.toFixed(0)}% full (<${THRESHOLD_PERCENT}%). Current batch will close at ${currentBatch.currentKg.toLocaleString()} kg. New batch will be created with this ${tollNetWeight.toLocaleString()} kg toll.`,
        willOvershoot: false,
      };
    }
  }

  // Toll fits within remaining capacity
  return {
    action: 'fits',
    targetBatchId: currentBatch.id,
    targetBatchNumber: currentBatch.batchNumber,
    message: `Toll fits within ${currentBatch.batchNumber} remaining capacity (${remaining.toLocaleString()} kg).`,
    willOvershoot: false,
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateTollEntry(values: any): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (values.tareWeight >= values.grossWeight) errors.push('Tare weight cannot equal or exceed gross weight');
  if (values.grossWeight <= 0) errors.push('Gross weight must be positive');
  if (values.tareWeight < 0) errors.push('Tare weight cannot be negative');
  if (values.netWeight <= 0) errors.push('Net weight must be positive');
  if ((values.moistureContent ?? 0) < 0 || (values.moistureContent ?? 0) > 100) errors.push('Moisture content must be 0–100%');
  if ((values.contaminationPercent ?? 0) < 0 || (values.contaminationPercent ?? 0) > 100) errors.push('Contamination must be 0–100%');
  if (new Date(values.receivedDate) > new Date()) errors.push('Received date cannot be in the future');

  const calcNet = values.grossWeight - values.tareWeight;
  if (Math.abs(calcNet - values.netWeight) > 0.1) {
    warnings.push(`Net weight should be ${calcNet}kg (gross − tare). Auto-corrected.`);
    values.netWeight = calcNet;
  }

  if (values.netWeight > 5000) warnings.push('Single toll weight exceeds 5,000kg — verify');
  if ((values.contaminationPercent ?? 0) > 5) warnings.push('Contamination above 5% — flag for review');

  return { valid: errors.length === 0, errors, warnings };
}

// ============================================================================
// MAIN MODULE
// ============================================================================

export function BatchControlModule() {
  const [activeTab, setActiveTab] = useState('batches');
  const { user, canDelete } = useAuth();
  const isOwner = canDelete();

  // Auto-close batches that reached target
  const processedBatches = useMemo(() => {
    return MOCK_BATCHES.map(b => {
      if (b.status === 'open' && b.currentKg >= b.targetKg) {
        return { ...b, status: 'ready_to_close' as const };
      }
      return b;
    });
  }, []);

  const openBatches = processedBatches.filter(b => b.status === 'open' || b.status === 'ready_to_close' || b.status === 'awaiting');
  const closedBatches = processedBatches.filter(b => b.status === 'closed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Batch Control</h2>
          <p className="text-sm text-gray-500">Automated batch creation, toll tracking, validation, and reconciliation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
            <Settings className="w-4 h-4 mr-1" /> Settings
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" size="sm" onClick={() => setActiveTab('toll')}>
            <Plus className="w-4 h-4 mr-1" /> Record Toll
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-500">Open Batches</p>
            </div>
            <p className="text-2xl font-bold">{openBatches.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-500">Closed Batches</p>
            </div>
            <p className="text-2xl font-bold">{closedBatches.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-500">Total Tolls</p>
            </div>
            <p className="text-2xl font-bold">{MOCK_TOLLS.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-500">Open Gaps</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{MOCK_RECONCILIATIONS.filter(r => r.status === 'open').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* 75% Rule Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ArrowRightLeft className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Toll-to-Batch Assignment Rule</p>
              <p className="text-sm text-blue-700">
                When a toll exceeds remaining batch capacity: if the batch is <strong>≥ {THRESHOLD_PERCENT}% full</strong>, the toll is added to the existing batch (allowing overshoot). 
                If the batch is <strong>&lt; {THRESHOLD_PERCENT}% full</strong>, the current batch closes and a new batch is created with this toll as the starter.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="batches"><Package className="w-4 h-4 mr-1" /> Active Batches</TabsTrigger>
          <TabsTrigger value="toll"><Plus className="w-4 h-4 mr-1" /> Toll Entry</TabsTrigger>
          <TabsTrigger value="bags"><Scale className="w-4 h-4 mr-1" /> Bag Labelling</TabsTrigger>
          <TabsTrigger value="recon"><BarChart3 className="w-4 h-4 mr-1" /> Reconciliation</TabsTrigger>
          <TabsTrigger value="integrity"><Shield className="w-4 h-4 mr-1" /> Integrity</TabsTrigger>
        </TabsList>

        <TabsContent value="batches">
          <ActiveBatchesTab batches={processedBatches} tolls={MOCK_TOLLS} isOwner={isOwner} />
        </TabsContent>

        <TabsContent value="toll">
          <TollEntryTab batches={openBatches} userName={user?.name || ''} />
        </TabsContent>

        <TabsContent value="bags">
          <BagLabeling batches={MOCK_BATCHES} />
        </TabsContent>

        <TabsContent value="recon">
          <ReconciliationTab reconciliations={MOCK_RECONCILIATIONS} isOwner={isOwner} />
        </TabsContent>

        <TabsContent value="integrity">
          <IntegrityTab scores={MOCK_INTEGRITY_SCORES} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// ACTIVE BATCHES TAB
// ============================================================================

function ActiveBatchesTab({ batches, tolls, isOwner }: { batches: typeof MOCK_BATCHES; tolls: typeof MOCK_TOLLS; isOwner: boolean }) {
  const [filterMaterial, setFilterMaterial] = useState<string>('all');
  const materials = [...new Set(batches.map(b => b.materialType))];
  const filtered = filterMaterial === 'all' ? batches : batches.filter(b => b.materialType === filterMaterial);

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={filterMaterial === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterMaterial('all')}>All</Button>
        {materials.map(m => (
          <Button key={m} variant={filterMaterial === m ? 'default' : 'outline'} size="sm" onClick={() => setFilterMaterial(m)}>{m}</Button>
        ))}
      </div>

      {filtered.map(batch => {
        const batchTolls = tolls.filter(t => t.batchId === batch.id);
        const pct = Math.min((batch.currentKg / batch.targetKg) * 100, 100);
        const isReady = batch.status === 'ready_to_close';
        const aboveThreshold = pct >= THRESHOLD_PERCENT;

        return (
          <Card key={batch.id} className={isReady ? 'ring-2 ring-green-500' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{batch.batchNumber}</h3>
                    <Badge className={batch.status === 'open' ? 'bg-blue-100 text-blue-800' : batch.status === 'ready_to_close' ? 'bg-green-100 text-green-800' : batch.status === 'awaiting' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'}>
                      {batch.status === 'ready_to_close' ? 'Ready to Close' : batch.status === 'awaiting' ? 'Awaiting Tolls' : batch.status}
                    </Badge>
                    {isReady && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {aboveThreshold && batch.status === 'open' && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">≥{THRESHOLD_PERCENT}% — Accepts Overshoot</Badge>
                    )}
                    {!aboveThreshold && batch.status === 'open' && batch.currentKg > 0 && (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">&lt;{THRESHOLD_PERCENT}% — New Batch on Overflow</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{batch.materialType} • Target: {batch.targetKg.toLocaleString()}kg • {batch.tollCount} tolls</p>
                </div>
                <div className="flex gap-2">
                  {isReady && isOwner && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Close Batch
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>{batch.currentKg.toLocaleString()} kg / {batch.targetKg.toLocaleString()} kg</span>
                  <span className={isReady ? 'text-green-600 font-bold' : ''}>{pct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden relative">
                  {/* 75% threshold marker */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-10" style={{ left: `${THRESHOLD_PERCENT}%` }} />
                  <div
                    className={`h-full rounded-full transition-all ${isReady ? 'bg-green-500' : aboveThreshold ? 'bg-blue-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-400">0%</span>
                  <span className="text-blue-500 font-medium">{THRESHOLD_PERCENT}% threshold</span>
                  <span className="text-gray-400">100%</span>
                </div>
                {isReady && (
                  <p className="text-sm text-green-600 mt-1 font-medium">
                    Target reached — close this batch to open the next one
                  </p>
                )}
              </div>

              {/* Tolls in this batch */}
              {batchTolls.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left"><th className="py-1">Toll #</th><th>Vendor</th><th className="text-right">Gross</th><th className="text-right">Tare</th><th className="text-right">Net</th><th className="text-right">Moisture</th><th className="text-right">Contam.</th><th>Date</th></tr></thead>
                    <tbody>
                      {batchTolls.map(t => (
                        <tr key={t.id} className="border-b hover:bg-gray-50">
                          <td className="py-1 font-medium">{t.tollNumber}</td>
                          <td>{t.vendorName}</td>
                          <td className="text-right">{t.grossWeight.toLocaleString()}</td>
                          <td className="text-right">{t.tareWeight.toLocaleString()}</td>
                          <td className="text-right font-medium">{t.netWeight.toLocaleString()}</td>
                          <td className="text-right">{t.moisture}%</td>
                          <td className="text-right">{t.contamination}%</td>
                          <td className="text-xs">{t.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================================
// TOLL ENTRY TAB — with 75% threshold logic
// ============================================================================

function TollEntryTab({ batches, userName }: { batches: typeof MOCK_BATCHES; userName: string }) {
  const [form, setForm] = useState({
    batchId: '', vendorName: '', grossWeight: '', tareWeight: '', netWeight: '',
    moistureContent: '', contaminationPercent: '', pricePerKg: '', receivedDate: new Date().toISOString().split('T')[0], notes: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<TollAssignmentResult | null>(null);

  // Auto-calculate net weight
  const gross = parseFloat(form.grossWeight) || 0;
  const tare = parseFloat(form.tareWeight) || 0;
  const calcNet = gross - tare;

  // Auto-determine material from selected batch
  const selectedBatch = batches.find(b => b.id === form.batchId);
  const materialType = selectedBatch?.materialType || '';

  const handleValidate = () => {
    setErrors([]);
    setWarnings([]);
    setSuccess(false);
    setAssignmentResult(null);

    const values = {
      ...form,
      grossWeight: parseFloat(form.grossWeight) || 0,
      tareWeight: parseFloat(form.tareWeight) || 0,
      netWeight: parseFloat(form.netWeight) || calcNet,
      moistureContent: parseFloat(form.moistureContent) || 0,
      contaminationPercent: parseFloat(form.contaminationPercent) || 0,
    };

    const result = validateTollEntry(values);
    setErrors(result.errors);
    setWarnings(result.warnings);

    if (result.valid && selectedBatch) {
      // Run toll-to-batch assignment engine
      const assignment = determineTollAssignment(values.netWeight, batches, materialType);
      setAssignmentResult(assignment);
      setSuccess(true);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Record New Toll</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Batch Selection */}
          <div>
            <Label>Material / Open Batch *</Label>
            <select
              className="w-full mt-1 p-2 border rounded-md text-sm"
              value={form.batchId}
              onChange={e => { setForm({ ...form, batchId: e.target.value }); setAssignmentResult(null); }}
            >
              <option value="">Select batch...</option>
              {batches.filter(b => b.status !== 'closed').map(b => {
                const fillPct = b.targetKg > 0 ? (b.currentKg / b.targetKg) * 100 : 0;
                return (
                  <option key={b.id} value={b.id}>
                    {b.batchNumber} — {b.materialType} ({b.currentKg}/{b.targetKg}kg, {fillPct.toFixed(0)}%)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <Label>Vendor Name *</Label>
            <Input value={form.vendorName} onChange={e => setForm({ ...form, vendorName: e.target.value })} placeholder="Vendor name" className="mt-1" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Gross Weight (kg) *</Label>
              <Input type="number" value={form.grossWeight} onChange={e => setForm({ ...form, grossWeight: e.target.value })} placeholder="0" className="mt-1" />
            </div>
            <div>
              <Label>Tare Weight (kg) *</Label>
              <Input type="number" value={form.tareWeight} onChange={e => setForm({ ...form, tareWeight: e.target.value })} placeholder="0" className="mt-1" />
            </div>
            <div>
              <Label>Net Weight (kg) *</Label>
              <Input type="number" value={form.netWeight || (calcNet > 0 ? calcNet : '')} onChange={e => setForm({ ...form, netWeight: e.target.value })} placeholder="Auto" className="mt-1" />
              {calcNet > 0 && !form.netWeight && (
                <p className="text-xs text-green-600 mt-1">Auto: {calcNet}kg</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Moisture (%)</Label>
              <Input type="number" step="0.1" value={form.moistureContent} onChange={e => setForm({ ...form, moistureContent: e.target.value })} placeholder="0" className="mt-1" />
            </div>
            <div>
              <Label>Contamination (%)</Label>
              <Input type="number" step="0.1" value={form.contaminationPercent} onChange={e => setForm({ ...form, contaminationPercent: e.target.value })} placeholder="0" className="mt-1" />
            </div>
            <div>
              <Label>Price/kg (₦)</Label>
              <Input type="number" value={form.pricePerKg} onChange={e => setForm({ ...form, pricePerKg: e.target.value })} placeholder="0" className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Received Date *</Label>
            <Input type="date" value={form.receivedDate} onChange={e => setForm({ ...form, receivedDate: e.target.value })} className="mt-1" />
          </div>

          <div>
            <Label>Notes</Label>
            <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any observations..." className="mt-1" />
          </div>

          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleValidate}>
            Validate & Preview Assignment
          </Button>
        </CardContent>
      </Card>

      {/* Validation Results */}
      <div className="space-y-4">
        {errors.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-red-700 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Validation Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {errors.map((e, i) => <li key={i} className="text-sm text-red-700">• {e}</li>)}
              </ul>
            </CardContent>
          </Card>
        )}

        {warnings.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-yellow-700 flex items-center gap-2"><AlertOctagon className="w-5 h-5" /> Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {warnings.map((w, i) => <li key={i} className="text-sm text-yellow-700">• {w}</li>)}
              </ul>
            </CardContent>
          </Card>
        )}

        {success && assignmentResult && (
          <Card className={assignmentResult.action === 'add_to_existing' ? 'border-blue-200 bg-blue-50' : assignmentResult.action === 'close_and_create' ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {assignmentResult.action === 'add_to_existing' ? <ArrowRightLeft className="w-5 h-5 text-blue-600" /> :
                 assignmentResult.action === 'close_and_create' ? <Lock className="w-5 h-5 text-orange-600" /> :
                 <CheckCircle className="w-5 h-5 text-green-600" />}
                <span className={assignmentResult.action === 'add_to_existing' ? 'text-blue-700' : assignmentResult.action === 'close_and_create' ? 'text-orange-700' : 'text-green-700'}>
                  {assignmentResult.action === 'add_to_existing' ? 'Add to Existing Batch' :
                   assignmentResult.action === 'close_and_create' ? 'Close & Create New Batch' :
                   'Fits in Existing Batch'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{assignmentResult.message}</p>
              {assignmentResult.action === 'add_to_existing' && (
                <div className="p-2 bg-white rounded border border-blue-200">
                  <p className="text-xs text-blue-800">Target: <strong>{selectedBatch?.batchNumber}</strong></p>
                  <p className="text-xs text-blue-800">Result: Batch will contain {(selectedBatch?.currentKg || 0) + (parseFloat(form.netWeight) || calcNet)} kg</p>
                </div>
              )}
              {assignmentResult.action === 'close_and_create' && (
                <div className="space-y-2">
                  <div className="p-2 bg-white rounded border border-orange-200">
                    <p className="text-xs text-orange-800">Close: <strong>{assignmentResult.targetBatchNumber}</strong> at {(selectedBatch?.currentKg || 0).toLocaleString()} kg</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-green-200">
                    <p className="text-xs text-green-800">Create: <strong>{assignmentResult.newBatchNumber}</strong> with {(parseFloat(form.netWeight) || calcNet).toLocaleString()} kg starter</p>
                  </div>
                </div>
              )}
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" /> Confirm & Save Toll
              </Button>
            </CardContent>
          </Card>
        )}

        {success && errors.length === 0 && !assignmentResult && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-700 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Validated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700">Toll entry passed all validation checks. Ready to save.</p>
              <Button className="mt-3 w-full bg-green-600 hover:bg-green-700">Save Toll</Button>
            </CardContent>
          </Card>
        )}

        {/* Assignment Rule Reference */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Toll Assignment Rules</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> Toll fits in remaining capacity → added to current batch</li>
              <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> Toll exceeds capacity AND batch ≥ {THRESHOLD_PERCENT}% full → added to existing batch (overshoot allowed)</li>
              <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" /> Toll exceeds capacity AND batch &lt; {THRESHOLD_PERCENT}% full → current batch closes, new batch created with this toll</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// RECONCILIATION TAB
// ============================================================================

function ReconciliationTab({ reconciliations, isOwner }: { reconciliations: typeof MOCK_RECONCILIATIONS; isOwner: boolean }) {
  const [explainId, setExplainId] = useState<string | null>(null);
  const [explanation, setExplanation] = useState('');

  const openGaps = reconciliations.filter(r => r.status === 'open');
  const resolvedGaps = reconciliations.filter(r => r.status !== 'open');

  return (
    <div className="space-y-4">
      {openGaps.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Open Gaps ({openGaps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {openGaps.map(gap => (
              <div key={gap.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium">{gap.batchNumber}</span>
                    <span className="text-sm text-gray-500 ml-2">{gap.fromStage} → {gap.toStage}</span>
                  </div>
                  <Badge className={gap.severity === 'critical' ? 'bg-red-100 text-red-800' : gap.severity === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}>
                    {gap.severity}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm mb-2">
                  <div><span className="text-gray-500">Expected:</span> <strong>{gap.expected.toLocaleString()}kg</strong></div>
                  <div><span className="text-gray-500">Actual:</span> <strong>{gap.actual.toLocaleString()}kg</strong></div>
                  <div className="text-red-600"><span className="text-gray-500">Gap:</span> <strong>{gap.gapKg.toLocaleString()}kg</strong></div>
                  <div className="text-red-600"><strong>{gap.gapPercent}%</strong></div>
                </div>
                {explainId === gap.id ? (
                  <div className="flex gap-2 mt-2">
                    <Input value={explanation} onChange={e => setExplanation(e.target.value)} placeholder="Explain the discrepancy..." className="flex-1" />
                    <Button size="sm" onClick={() => setExplainId(null)}>Submit</Button>
                    <Button size="sm" variant="ghost" onClick={() => setExplainId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => { setExplainId(gap.id); setExplanation(''); }}>
                    Provide Explanation
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Resolved Gaps</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left py-2">Batch</th><th className="text-left">Stages</th><th className="text-right">Gap</th><th className="text-left">Status</th><th className="text-left">Explanation</th></tr></thead>
              <tbody>
                {resolvedGaps.map(gap => (
                  <tr key={gap.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{gap.batchNumber}</td>
                    <td>{gap.fromStage} → {gap.toStage}</td>
                    <td className="text-right text-red-600">{gap.gapKg}kg ({gap.gapPercent}%)</td>
                    <td><Badge className={gap.status === 'explained' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>{gap.status}</Badge></td>
                    <td className="text-gray-600 max-w-xs truncate">{gap.explanation || '-'}</td>
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
// INTEGRITY TAB
// ============================================================================

function IntegrityTab({ scores }: { scores: typeof MOCK_INTEGRITY_SCORES }) {
  return (
    <div className="space-y-4">
      {scores.map(score => (
        <Card key={score.batchId} className={score.blocksDispatch ? 'border-red-200' : 'border-green-200'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${score.isPassing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {score.totalScore}
                </div>
                <div>
                  <CardTitle className="text-lg">{score.batchNumber}</CardTitle>
                  <p className="text-sm text-gray-500">out of {score.maxScore} — {score.isPassing ? 'PASSING' : 'BLOCKS DISPATCH'}</p>
                </div>
              </div>
              {score.blocksDispatch ? (
                <Badge className="bg-red-100 text-red-800 text-sm px-3 py-1"><Lock className="w-4 h-4 mr-1" /> Dispatch Blocked</Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1"><Unlock className="w-4 h-4 mr-1" /> Dispatch OK</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {score.components.map(comp => {
                const pct = (comp.score / comp.maxScore) * 100;
                return (
                  <div key={comp.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{comp.name}</span>
                      <span className="text-sm">{comp.score}/{comp.maxScore} — {comp.details}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div
                        className={`h-2 rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
