// ============================================================================
// PRODUCTION MODULE (Water-Aware Pipeline)
// ============================================================================
// Critical for wet grinding operations:
// Water is added during grinding & washing, then removed during drying.
// Raw (gross) weight comparisons are meaningless across wet stages.
// We track MOISTURE % at every stage and calculate loss on DRY WEIGHT:
//   dryWeight = grossWeight × (1 − moisturePercent/100)
// ============================================================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowRight, Package, Clock, AlertTriangle,
  TrendingDown, Beaker, Droplets, Scale,
  CheckCircle, Play, ThermometerSun,
} from 'lucide-react';
import type { ProductionStage } from '@/types';

// ============================================================================
// MOISTURE-AWARE MOCK DATA
// Realistic for wet plastic flake recycling:
//   Sorted  : ~3%  moisture (air-dry bales)
//   Grinding: ~18% moisture (wet grind — water added)
//   Washing : ~28% moisture (soaked in water bath)
//   Drying  : ~1%  moisture (fluid bed / hot air dried)
//   Bagging : ~0.8% moisture (fully dry, ready for sale)
// ============================================================================

const MOCK_BATCHES = [
  { id: 'batch-001', batchNumber: 'B-PET-2025-001', materialType: 'PET Green', targetOutputKg: 5000 },
  { id: 'batch-002', batchNumber: 'B-PET-2025-002', materialType: 'PET Clear', targetOutputKg: 5000 },
  { id: 'batch-003', batchNumber: 'B-HDPE-2025-001', materialType: 'HDPE', targetOutputKg: 3000 },
  { id: 'batch-004', batchNumber: 'B-HDPE-2025-002', materialType: 'HDPE', targetOutputKg: 3000 },
];

const MOCK_STAGES: ProductionStage[] = [
  // ── BATCH 001 — Complete run, all stages pass ──
  { id: 's1-001', batchId: 'batch-001', stage: 'sorting',    weightIn: 5000, weightOut: 4850, moistureIn: 3.0, moistureOut: 2.8, dryWeightIn: 4850, dryWeightOut: 4714, lossKg: 136, lossPercent: 2.8, yieldPercent: 97.2, operatorName: 'Adebayo F.', startTime: '2025-07-01T06:00:00', endTime: '2025-07-01T14:00:00', qualityCheck: 'pass', createdAt: '2025-07-01' },
  { id: 's2-001', batchId: 'batch-001', stage: 'grinding',  weightIn: 4850, weightOut: 5100, moistureIn: 2.8, moistureOut: 18.0, dryWeightIn: 4714, dryWeightOut: 4182, lossKg: 532, lossPercent: 11.3, yieldPercent: 88.7, operatorName: 'Oluwaseun K.', startTime: '2025-07-01T14:30:00', endTime: '2025-07-01T20:00:00', qualityCheck: 'pass', machineId: 'GRD-01', createdAt: '2025-07-01' },
  { id: 's3-001', batchId: 'batch-001', stage: 'washing',   weightIn: 5100, weightOut: 5450, moistureIn: 18.0, moistureOut: 28.5, dryWeightIn: 4182, dryWeightOut: 3897, lossKg: 285, lossPercent: 6.8, yieldPercent: 93.2, operatorName: 'Chioma N.', startTime: '2025-07-02T06:00:00', endTime: '2025-07-02T12:00:00', qualityCheck: 'pass', machineId: 'WSH-02', createdAt: '2025-07-02' },
  { id: 's4-001', batchId: 'batch-001', stage: 'drying',    weightIn: 5450, weightOut: 3920, moistureIn: 28.5, moistureOut: 1.0, dryWeightIn: 3897, dryWeightOut: 3881, lossKg: 16, lossPercent: 0.4, yieldPercent: 99.6, operatorName: 'Emmanuel T.', startTime: '2025-07-02T13:00:00', endTime: '2025-07-02T18:00:00', qualityCheck: 'pass', machineId: 'DRY-01', createdAt: '2025-07-02' },
  { id: 's5-001', batchId: 'batch-001', stage: 'bagging',   weightIn: 3920, weightOut: 3890, moistureIn: 1.0, moistureOut: 0.8, dryWeightIn: 3881, dryWeightOut: 3859, lossKg: 22, lossPercent: 0.6, yieldPercent: 99.4, operatorName: 'Fatima A.', startTime: '2025-07-02T19:00:00', endTime: '2025-07-02T22:00:00', qualityCheck: 'pass', machineId: 'BAG-01', createdAt: '2025-07-02' },
  // ── BATCH 002 — In progress, currently at washing ──
  { id: 's1-002', batchId: 'batch-002', stage: 'sorting',    weightIn: 5200, weightOut: 5080, moistureIn: 2.5, moistureOut: 2.3, dryWeightIn: 5070, dryWeightOut: 4963, lossKg: 107, lossPercent: 2.1, yieldPercent: 97.9, operatorName: 'Adebayo F.', startTime: '2025-07-03T06:00:00', endTime: '2025-07-03T13:00:00', qualityCheck: 'pass', createdAt: '2025-07-03' },
  { id: 's2-002', batchId: 'batch-002', stage: 'grinding',  weightIn: 5080, weightOut: 5300, moistureIn: 2.3, moistureOut: 17.5, dryWeightIn: 4963, dryWeightOut: 4372, lossKg: 591, lossPercent: 11.9, yieldPercent: 88.1, operatorName: 'Oluwaseun K.', startTime: '2025-07-03T14:00:00', endTime: '2025-07-03T20:00:00', qualityCheck: 'pass', machineId: 'GRD-01', createdAt: '2025-07-03' },
  { id: 's3-002', batchId: 'batch-002', stage: 'washing',   weightIn: 5300, weightOut: 5620, moistureIn: 17.5, moistureOut: 29.0, dryWeightIn: 4372, dryWeightOut: 3990, lossKg: 382, lossPercent: 8.7, yieldPercent: 91.3, operatorName: 'Chioma N.', startTime: '2025-07-04T06:00:00', endTime: '2025-07-04T12:00:00', qualityCheck: 'pass', machineId: 'WSH-02', createdAt: '2025-07-04' },
  // ── BATCH 003 — Only sorting done ──
  { id: 's1-003', batchId: 'batch-003', stage: 'sorting',    weightIn: 3000, weightOut: 2920, moistureIn: 3.5, moistureOut: 3.2, dryWeightIn: 2895, dryWeightOut: 2827, lossKg: 68, lossPercent: 2.3, yieldPercent: 97.7, operatorName: 'Adebayo F.', startTime: '2025-07-05T06:00:00', endTime: '2025-07-05T14:00:00', qualityCheck: 'pass', createdAt: '2025-07-05' },
  // ── BATCH 004 — Complete, drying flagged ──
  { id: 's1-004', batchId: 'batch-004', stage: 'sorting',    weightIn: 3150, weightOut: 3080, moistureIn: 4.0, moistureOut: 3.5, dryWeightIn: 3024, dryWeightOut: 2972, lossKg: 52, lossPercent: 1.7, yieldPercent: 98.3, operatorName: 'Adebayo F.', startTime: '2025-07-02T06:00:00', endTime: '2025-07-02T14:00:00', qualityCheck: 'pass', createdAt: '2025-07-02' },
  { id: 's2-004', batchId: 'batch-004', stage: 'grinding',  weightIn: 3080, weightOut: 3250, moistureIn: 3.5, moistureOut: 19.0, dryWeightIn: 2972, dryWeightOut: 2633, lossKg: 339, lossPercent: 11.4, yieldPercent: 88.6, operatorName: 'Oluwaseun K.', startTime: '2025-07-02T14:30:00', endTime: '2025-07-02T20:00:00', qualityCheck: 'pass', machineId: 'GRD-02', createdAt: '2025-07-02' },
  { id: 's3-004', batchId: 'batch-004', stage: 'washing',   weightIn: 3250, weightOut: 3480, moistureIn: 19.0, moistureOut: 30.0, dryWeightIn: 2633, dryWeightOut: 2436, lossKg: 197, lossPercent: 7.5, yieldPercent: 92.5, operatorName: 'Chioma N.', startTime: '2025-07-03T06:00:00', endTime: '2025-07-03T12:00:00', qualityCheck: 'pass', machineId: 'WSH-01', createdAt: '2025-07-03' },
  { id: 's4-004', batchId: 'batch-004', stage: 'drying',    weightIn: 3480, weightOut: 2350, moistureIn: 30.0, moistureOut: 8.5, dryWeightIn: 2436, dryWeightOut: 2150, lossKg: 286, lossPercent: 11.7, yieldPercent: 88.3, operatorName: 'Emmanuel T.', startTime: '2025-07-03T13:00:00', endTime: '2025-07-03T18:00:00', qualityCheck: 'fail', machineId: 'DRY-02', createdAt: '2025-07-03' },
  { id: 's5-004', batchId: 'batch-004', stage: 'bagging',   weightIn: 2350, weightOut: 2340, moistureIn: 8.5, moistureOut: 8.2, dryWeightIn: 2150, dryWeightOut: 2148, lossKg: 2, lossPercent: 0.1, yieldPercent: 99.9, operatorName: 'Fatima A.', startTime: '2025-07-03T19:00:00', endTime: '2025-07-03T22:00:00', qualityCheck: 'pending', machineId: 'BAG-01', createdAt: '2025-07-03' },
];

// ============================================================================
// HELPERS
// ============================================================================

const STAGE_ORDER: ProductionStage['stage'][] = ['sorting', 'grinding', 'washing', 'drying', 'bagging'];
const STAGE_LABELS: Record<string, string> = { sorting: 'Sorting', grinding: 'Grinding (Wet)', washing: 'Washing', drying: 'Drying', bagging: 'Bagging' };

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

function getBatchStages(batchId: string) {
  return MOCK_STAGES.filter(s => s.batchId === batchId).sort((a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage));
}

// ============================================================================
// MAIN MODULE
// ============================================================================

export function ProductionModule() {
  const { user } = useAuth();
  const [selectedBatch, setSelectedBatch] = useState(MOCK_BATCHES[0]);
  const [activeTab, setActiveTab] = useState('pipeline');

  const stages = getBatchStages(selectedBatch.id);
  const completedStages = stages.filter(s => s.endTime);
  const currentStage = stages.find(s => !s.endTime) || null;

  // Overall batch metrics (on dry weight)
  const firstStage = stages[0];
  const lastCompleted = stages.filter(s => s.endTime).slice(-1)[0];
  const overallInputDry = firstStage?.dryWeightIn ?? 0;
  const overallOutputDry = lastCompleted?.dryWeightOut ?? 0;
  const overallYield = overallInputDry > 0 ? (overallOutputDry / overallInputDry) * 100 : 0;
  const overallLoss = 100 - overallYield;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Production Line</h2>
          <p className="text-sm text-gray-500">Wet grinding pipeline — water weight tracked separately</p>
        </div>
        <div className="flex gap-2">
          {MOCK_BATCHES.map(b => (
            <Button key={b.id} size="sm" variant={selectedBatch.id === b.id ? 'default' : 'outline'} onClick={() => setSelectedBatch(b)}>
              {b.batchNumber}
            </Button>
          ))}
        </div>
      </div>

      {/* Water-Aware Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-500">Input (Gross)</p>
            </div>
            <p className="text-2xl font-bold">{firstStage?.weightIn.toLocaleString() ?? '—'} <span className="text-sm font-normal text-gray-500">kg</span></p>
            <p className="text-xs text-gray-400">Scale reading at intake</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ThermometerSun className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-gray-500">Input (Dry)</p>
            </div>
            <p className="text-2xl font-bold">{firstStage?.dryWeightIn.toLocaleString() ?? '—'} <span className="text-sm font-normal text-gray-500">kg</span></p>
            <p className="text-xs text-gray-400">Water removed from input</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-500">Output (Gross)</p>
            </div>
            <p className="text-2xl font-bold">{lastCompleted?.weightOut.toLocaleString() ?? '—'} <span className="text-sm font-normal text-gray-500">kg</span></p>
            <p className="text-xs text-gray-400">Scale reading at last stage</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-600" />
              <p className="text-sm text-gray-500">Output (Dry)</p>
            </div>
            <p className="text-2xl font-bold">{overallOutputDry.toLocaleString()} <span className="text-sm font-normal text-gray-500">kg</span></p>
            <p className="text-xs text-gray-400">Water removed — true yield</p>
          </CardContent>
        </Card>
      </div>

      {/* Yield vs Loss */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-500">Overall Material Loss</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{overallLoss.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Based on dry weight only (water excluded)</p>
            <p className="text-xs text-gray-400">Sorted dry {overallInputDry.toLocaleString()}kg → Bagged dry {overallOutputDry.toLocaleString()}kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-500">Overall Yield</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{overallYield.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Dry material retained through all stages</p>
            <p className="text-xs text-gray-400">Target: 75%+ for PET, 78%+ for HDPE</p>
          </CardContent>
        </Card>
      </div>

      {/* Educational Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Beaker className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Why Dry Weight Matters for Wet Grinding</p>
              <p className="text-sm text-blue-700">
                Water is <strong>added</strong> during grinding (~18% moisture) and <strong>more</strong> during washing (~28%).
                If you compare gross scale weights, it looks like weight is gained — that is just water.
                We calculate loss on <strong>dry weight</strong> (gross × (1 − moisture%)) so you see true material loss,
                not water weight fluctuations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pipeline">Production Pipeline</TabsTrigger>
          <TabsTrigger value="water">Water Balance</TabsTrigger>
          <TabsTrigger value="start">Start New Stage</TabsTrigger>
        </TabsList>
        <TabsContent value="pipeline">
          <PipelineView stages={stages} selectedBatch={selectedBatch} currentStage={currentStage} />
        </TabsContent>
        <TabsContent value="water">
          <WaterBalanceView stages={stages} selectedBatch={selectedBatch} />
        </TabsContent>
        <TabsContent value="start">
          <StartStageView selectedBatch={selectedBatch} stages={stages} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// PIPELINE VISUALIZATION
// ============================================================================

function PipelineView({ stages, selectedBatch, currentStage }: { stages: ProductionStage[], selectedBatch: typeof MOCK_BATCHES[0], currentStage: ProductionStage | null }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{selectedBatch.batchNumber} — {selectedBatch.materialType}</h3>
        <Badge className={currentStage ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
          {currentStage ? `In Progress: ${STAGE_LABELS[currentStage.stage]}` : 'All Stages Complete'}
        </Badge>
      </div>
      <div className="space-y-3">
        {STAGE_ORDER.map((stageKey, idx) => {
          const stage = stages.find(s => s.stage === stageKey);
          const isCompleted = !!stage?.endTime;
          const isCurrent = currentStage?.stage === stageKey;
          const isPending = !stage;
          const waterAdded = stage ? stage.moistureOut! > stage.moistureIn! : false;
          const waterRemoved = stage ? stage.moistureOut! < stage.moistureIn! : false;
          return (
            <Card key={stageKey} className={isCurrent ? 'ring-2 ring-yellow-400' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isCompleted ? 'bg-green-100 text-green-700' : isCurrent ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold">{STAGE_LABELS[stageKey]}</h4>
                      {isCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {isCurrent && <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> In Progress</Badge>}
                      {isPending && <Badge className="bg-gray-100 text-gray-600">Pending</Badge>}
                      {waterAdded && <Badge className="bg-blue-100 text-blue-800 text-xs"><Droplets className="w-3 h-3 mr-0.5" /> Water Added</Badge>}
                      {waterRemoved && <Badge className="bg-orange-100 text-orange-800 text-xs"><ThermometerSun className="w-3 h-3 mr-0.5" /> Water Removed</Badge>}
                    </div>
                    {stage && (
                      <p className="text-sm text-gray-500">
                        {isCompleted ? `Completed ${formatTime(stage.endTime!)}` : isCurrent ? `Started ${formatTime(stage.startTime)}` : ''}
                        {stage.operatorName && ` • ${stage.operatorName}`}
                        {stage.machineId && ` • ${stage.machineId}`}
                      </p>
                    )}
                  </div>
                  {stage && <QualityBadge check={stage.qualityCheck} />}
                </div>
                {stage && (
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500 mb-1">Gross In</p>
                      <p className="font-bold text-lg">{stage.weightIn.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">kg</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500 mb-1">Moisture In</p>
                      <p className="font-bold text-lg">{stage.moistureIn}%</p>
                      <p className="text-xs text-gray-400">water</p>
                    </div>
                    <div className="p-2 bg-amber-50 rounded border border-amber-100">
                      <p className="text-xs text-amber-700 mb-1 font-medium">Dry In</p>
                      <p className="font-bold text-lg text-amber-800">{stage.dryWeightIn.toLocaleString()}</p>
                      <p className="text-xs text-amber-600">kg (water removed)</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500 mb-1">Gross Out</p>
                      <p className="font-bold text-lg">{stage.weightOut.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">kg</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500 mb-1">Moisture Out</p>
                      <p className="font-bold text-lg">{stage.moistureOut}%</p>
                      <p className="text-xs text-gray-400">water</p>
                    </div>
                  </div>
                )}
                {stage && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="p-2 bg-amber-50 rounded border border-amber-100 text-center">
                      <p className="text-xs text-amber-700 mb-1 font-medium">Dry Out</p>
                      <p className="font-bold text-xl text-amber-800">{stage.dryWeightOut.toLocaleString()}</p>
                      <p className="text-xs text-amber-600">kg</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded border border-red-100 text-center">
                      <p className="text-xs text-red-700 mb-1 font-medium">Material Loss</p>
                      <p className="font-bold text-xl text-red-700">{stage.lossKg.toLocaleString()}</p>
                      <p className="text-xs text-red-600">kg ({stage.lossPercent}%)</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded border border-green-100 text-center">
                      <p className="text-xs text-green-700 mb-1 font-medium">Yield</p>
                      <p className="font-bold text-xl text-green-700">{stage.yieldPercent.toFixed(1)}%</p>
                      <p className="text-xs text-green-600">dry material retained</p>
                    </div>
                  </div>
                )}
                {stage && !isCompleted && !isCurrent && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <ArrowRight className="w-4 h-4" />
                    <span>Waiting for previous stage to complete</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// WATER BALANCE VIEW
// ============================================================================

function WaterBalanceView({ stages, selectedBatch }: { stages: ProductionStage[], selectedBatch: typeof MOCK_BATCHES[0] }) {
  const firstStage = stages[0];
  const sortedDry = firstStage?.dryWeightIn ?? 0;
  const baggedDry = stages.filter(s => s.stage === 'bagging' && s.endTime)[0]?.dryWeightOut ?? 0;
  const totalDryLoss = sortedDry - baggedDry;
  const totalWaterIn = stages.reduce((sum, s) => sum + (s.weightIn - s.dryWeightIn), 0);
  const totalWaterOut = stages.reduce((sum, s) => sum + (s.weightOut - s.dryWeightOut), 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{selectedBatch.batchNumber} — Water & Material Balance</h3>
      {/* Balance Table */}
      <Card>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Stage</th>
                  <th className="text-right">Gross In</th>
                  <th className="text-right">Moisture In</th>
                  <th className="text-right bg-amber-50">Dry In</th>
                  <th className="text-right">Gross Out</th>
                  <th className="text-right">Moisture Out</th>
                  <th className="text-right bg-amber-50">Dry Out</th>
                  <th className="text-right text-red-600">Dry Loss</th>
                  <th className="text-right">Yield</th>
                </tr>
              </thead>
              <tbody>
                {stages.map(stage => {
                  return (
                    <tr key={stage.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-medium">{STAGE_LABELS[stage.stage]}</td>
                      <td className="text-right">{stage.weightIn.toLocaleString()}</td>
                      <td className="text-right">{stage.moistureIn}%</td>
                      <td className="text-right bg-amber-50 font-medium">{stage.dryWeightIn.toLocaleString()}</td>
                      <td className="text-right">{stage.weightOut.toLocaleString()}</td>
                      <td className="text-right">{stage.moistureOut}%</td>
                      <td className="text-right bg-amber-50 font-medium">{stage.dryWeightOut.toLocaleString()}</td>
                      <td className="text-right text-red-600 font-medium">{stage.lossKg.toLocaleString()} ({stage.lossPercent}%)</td>
                      <td className="text-right">{stage.yieldPercent.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td className="py-2">Totals</td>
                  <td className="text-right">—</td>
                  <td className="text-right">—</td>
                  <td className="text-right bg-amber-50">{sortedDry.toLocaleString()}</td>
                  <td className="text-right">—</td>
                  <td className="text-right">—</td>
                  <td className="text-right bg-amber-50">{baggedDry.toLocaleString()}</td>
                  <td className="text-right text-red-600">{totalDryLoss.toLocaleString()} ({sortedDry > 0 ? ((totalDryLoss / sortedDry) * 100).toFixed(1) : 0}%)</td>
                  <td className="text-right">{sortedDry > 0 ? ((baggedDry / sortedDry) * 100).toFixed(1) : 0}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Water Volume Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-500">Total Water in System</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{totalWaterIn.toLocaleString()} <span className="text-sm font-normal text-gray-500">kg</span></p>
            <p className="text-xs text-gray-500">Water content in all incoming materials</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ThermometerSun className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-gray-500">Total Water Evacuated</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">{totalWaterOut.toLocaleString()} <span className="text-sm font-normal text-gray-500">kg</span></p>
            <p className="text-xs text-gray-500">Water removed through drying / drainage</p>
          </CardContent>
        </Card>
      </div>
      {/* Stage-by-stage water chart */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Water Content by Stage</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map(stage => {
              const waterInKg = stage.weightIn - stage.dryWeightIn;
              const waterOutKg = stage.weightOut - stage.dryWeightOut;
              const maxWater = Math.max(waterInKg, waterOutKg, 1);
              return (
                <div key={stage.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{STAGE_LABELS[stage.stage]}</span>
                    <span className="text-sm text-gray-500">{stage.moistureIn}% → {stage.moistureOut}% moisture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16 text-right">{waterInKg.toLocaleString()}kg</span>
                    <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                      <div className="h-full bg-blue-400 flex items-center justify-center text-xs text-white font-medium" style={{ width: `${(waterInKg / maxWater) * 100}%` }}>
                        In
                      </div>
                      <div className="h-full bg-orange-400 flex items-center justify-center text-xs text-white font-medium" style={{ width: `${(Math.abs(waterOutKg - waterInKg) / maxWater) * 100}%` }}>
                        {waterOutKg > waterInKg ? '+' : ''}{(waterOutKg - waterInKg).toLocaleString()}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 w-16">{waterOutKg.toLocaleString()}kg</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// START STAGE FORM
// ============================================================================

function StartStageView({ selectedBatch, stages }: { selectedBatch: typeof MOCK_BATCHES[0], stages: ProductionStage[] }) {
  const [form, setForm] = useState({ stage: '' as ProductionStage['stage'] | '', weightIn: '', moistureIn: '', operatorName: '', machineId: '', notes: '' });
  const completed = stages.filter(s => s.endTime).map(s => s.stage);
  const available = STAGE_ORDER.filter(s => !completed.includes(s));
  const canStart = available.length > 0 && (available[0] === form.stage || stages.some(s => s.stage === form.stage && !s.endTime));

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Start Production Stage</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Batch</Label>
          <Input value={`${selectedBatch.batchNumber} — ${selectedBatch.materialType}`} disabled className="mt-1 bg-gray-50" />
        </div>
        <div>
          <Label>Stage *</Label>
          <select className="w-full mt-1 p-2 border rounded-md text-sm" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value as ProductionStage['stage'] })}>
            <option value="">Select stage...</option>
            {available.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Gross Weight In (kg) *</Label>
            <Input type="number" value={form.weightIn} onChange={e => setForm({ ...form, weightIn: e.target.value })} placeholder="Scale reading" className="mt-1" />
          </div>
          <div>
            <Label>Moisture % *</Label>
            <Input type="number" step="0.1" value={form.moistureIn} onChange={e => setForm({ ...form, moistureIn: e.target.value })} placeholder="e.g. 18 for wet grinding" className="mt-1" />
          </div>
        </div>
        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>Moisture guide:</strong> Sorting ~3% • Wet Grinding ~18% • Washing ~28% • Drying ~1% • Bagging ~0.8%
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Operator Name *</Label>
            <Input value={form.operatorName} onChange={e => setForm({ ...form, operatorName: e.target.value })} placeholder="Who is running this stage?" className="mt-1" />
          </div>
          <div>
            <Label>Machine ID</Label>
            <Input value={form.machineId} onChange={e => setForm({ ...form, machineId: e.target.value })} placeholder="e.g. GRD-01" className="mt-1" />
          </div>
        </div>
        <div>
          <Label>Notes</Label>
          <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any observations..." className="mt-1" />
        </div>
        <Button className="w-full bg-green-600 hover:bg-green-700" disabled={!canStart}>
          <Play className="w-4 h-4 mr-2" /> Start Stage
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function QualityBadge({ check }: { check: string }) {
  if (check === 'pass') return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Pass</Badge>;
  if (check === 'fail') return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" /> Fail</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
}
