// ============================================================================
// PRODUCTION MODULE - Grinding & Washing Operations
// ============================================================================

import { useEffect, useState } from 'react';
import { db } from '@/services/database';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Factory, 
  Cog, 
  Droplets, 
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Zap,
  Flame
} from 'lucide-react';
import type { Batch, GrindingOperation, WashingOperation, Worker } from '@/types';

export function ProductionModule() {
  const { hasPermission } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrindingForm, setShowGrindingForm] = useState(false);
  const [showWashingForm, setShowWashingForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [batchesData, workersData] = await Promise.all([
      db.getBatches(),
      db.getWorkers(),
    ]);
    setBatches(batchesData);
    setWorkers(workersData);
    setLoading(false);
  };

  // Filter batches by state
  const sortedBatches = batches.filter(b => b.currentState === 'sorted_pet');
  const groundBatches = batches.filter(b => b.currentState === 'ground_flakes');

  // Calculate stats
  const avgGrindingYield = batches.length > 0
    ? batches.reduce((sum, b) => sum + b.weights.grindingYieldPercent, 0) / batches.length
    : 0;
  const avgWashingLoss = batches.length > 0
    ? batches.reduce((sum, b) => sum + b.weights.washingLossPercent, 0) / batches.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Cog className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ready to Grind</p>
                <p className="text-xl font-bold">{sortedBatches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Droplets className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ready to Wash</p>
                <p className="text-xl font-bold">{groundBatches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Grind Yield</p>
                <p className="text-xl font-bold">{avgGrindingYield.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Wash Loss</p>
                <p className="text-xl font-bold">{avgWashingLoss.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Factory className="w-5 h-5 text-blue-500" />
            Production Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <PipelineStage 
              label="Sorted PET"
              count={sortedBatches.length}
              weight={sortedBatches.reduce((sum, b) => sum + b.weights.sortedPetWeight, 0)}
              color="bg-blue-500"
            />
            <ArrowRight />
            <PipelineStage 
              label="Ground Flakes"
              count={groundBatches.length}
              weight={groundBatches.reduce((sum, b) => sum + b.weights.groundFlakesWeight, 0)}
              color="bg-purple-500"
            />
            <ArrowRight />
            <PipelineStage 
              label="Final Flakes"
              count={batches.filter(b => b.currentState === 'final_flakes').length}
              weight={batches.filter(b => b.currentState === 'final_flakes').reduce((sum, b) => sum + b.weights.finalDryFlakesWeight, 0)}
              color="bg-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="grinding" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grinding">
            <Cog className="w-4 h-4 mr-2" />
            Grinding
          </TabsTrigger>
          <TabsTrigger value="washing">
            <Droplets className="w-4 h-4 mr-2" />
            Washing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grinding" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Batches Ready for Grinding</h3>
            {hasPermission('edit_batch') && (
              <Dialog open={showGrindingForm} onOpenChange={setShowGrindingForm}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Cog className="w-4 h-4 mr-2" />
                    Record Grinding
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Record Grinding Operation</DialogTitle>
                  </DialogHeader>
                  <GrindingForm 
                    batches={sortedBatches}
                    workers={workers.filter(w => w.role === 'operator')}
                    onSubmit={async (data) => {
                      // Update batch weights
                      const batch = batches.find(b => b.id === data.batchId);
                      if (batch) {
                        await db.updateBatchWeights(data.batchId, {
                          groundFlakesWeight: data.outputWeight,
                        });
                        // Update batch state
                        batch.currentState = 'ground_flakes';
                      }
                      setShowGrindingForm(false);
                      loadData();
                    }}
                    onCancel={() => setShowGrindingForm(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {sortedBatches.map(batch => (
              <BatchProductionCard 
                key={batch.id} 
                batch={batch} 
                stage="sorted"
                onClick={() => setSelectedBatch(batch)}
              />
            ))}
          </div>

          {sortedBatches.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No batches ready for grinding</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="washing" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Batches Ready for Washing</h3>
            {hasPermission('edit_batch') && (
              <Dialog open={showWashingForm} onOpenChange={setShowWashingForm}>
                <DialogTrigger asChild>
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    <Droplets className="w-4 h-4 mr-2" />
                    Record Washing
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Record Washing Operation</DialogTitle>
                  </DialogHeader>
                  <WashingForm 
                    batches={groundBatches}
                    workers={workers.filter(w => w.role === 'operator')}
                    onSubmit={async (data) => {
                      // Update batch weights
                      const batch = batches.find(b => b.id === data.batchId);
                      if (batch) {
                        await db.updateBatchWeights(data.batchId, {
                          washedFlakesWeight: data.afterWashWeight,
                          dewateredFlakesWeight: data.afterDewaterWeight,
                          finalDryFlakesWeight: data.finalDryWeight,
                        });
                        // Update batch state
                        batch.currentState = 'final_flakes';
                      }
                      setShowWashingForm(false);
                      loadData();
                    }}
                    onCancel={() => setShowWashingForm(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {groundBatches.map(batch => (
              <BatchProductionCard 
                key={batch.id} 
                batch={batch} 
                stage="ground"
                onClick={() => setSelectedBatch(batch)}
              />
            ))}
          </div>

          {groundBatches.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No batches ready for washing</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PipelineStage({ label, count, weight, color }: { label: string; count: number; weight: number; color: string }) {
  return (
    <div className={`${color} text-white rounded-xl p-4 min-w-[140px] text-center`}>
      <p className="text-sm opacity-90">{label}</p>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs opacity-75">{(weight / 1000).toFixed(1)}t</p>
    </div>
  );
}

function ArrowRight() {
  return (
    <div className="text-gray-400">
      <TrendingUp className="w-8 h-8" />
    </div>
  );
}

function BatchProductionCard({ batch, stage, onClick }: { batch: Batch; stage: 'sorted' | 'ground'; onClick: () => void }) {
  const weight = stage === 'sorted' 
    ? batch.weights.sortedPetWeight 
    : batch.weights.groundFlakesWeight;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{batch.batchNumber}</h3>
          <Badge variant="outline">
            {stage === 'sorted' ? 'Ready to Grind' : 'Ready to Wash'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-gray-500">Input Weight</p>
            <p className="font-medium">{(weight / 1000).toFixed(1)}t</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Cost/kg</p>
            <p className="font-medium text-green-600">₦{batch.costs.costPerKg}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Current Yield</span>
            <span className="font-medium">{batch.weights.totalYieldPercent.toFixed(1)}%</span>
          </div>
          <Progress value={batch.weights.totalYieldPercent} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

function GrindingForm({ 
  batches, 
  workers,
  onSubmit, 
  onCancel 
}: { 
  batches: Batch[]; 
  workers: Worker[];
  onSubmit: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    batchId: '',
    inputWeight: 0,
    outputWeight: 0,
    machineId: '',
    downtimeMinutes: 0,
    downtimeReason: '',
    bladeCost: 0,
    maintenanceCost: 0,
    operatorId: '',
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endTime: new Date().toISOString().slice(0, 16),
    notes: '',
  });

  const selectedBatch = batches.find(b => b.id === formData.batchId);
  const yieldPercent = formData.inputWeight > 0 ? (formData.outputWeight / formData.inputWeight) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Batch *</Label>
        <select
          required
          className="w-full p-2 border rounded-lg"
          value={formData.batchId}
          onChange={(e) => {
            const batch = batches.find(b => b.id === e.target.value);
            setFormData({ 
              ...formData, 
              batchId: e.target.value,
              inputWeight: batch?.weights.sortedPetWeight || 0
            });
          }}
        >
          <option value="">Select batch</option>
          {batches.map(batch => (
            <option key={batch.id} value={batch.id}>
              {batch.batchNumber} - {(batch.weights.sortedPetWeight / 1000).toFixed(1)}t
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Input Weight (kg) *</Label>
          <Input 
            type="number"
            required
            value={formData.inputWeight || ''}
            onChange={(e) => setFormData({ ...formData, inputWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Output Weight (kg) *</Label>
          <Input 
            type="number"
            required
            value={formData.outputWeight || ''}
            onChange={(e) => setFormData({ ...formData, outputWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Yield Summary */}
      <div className="bg-purple-50 p-3 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-purple-700">Grinding Yield:</span>
          <span className="font-bold text-purple-800">{yieldPercent.toFixed(1)}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Machine ID</Label>
        <Input 
          value={formData.machineId}
          onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
          placeholder="e.g., GRINDER-01"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Blade Cost (₦)</Label>
          <Input 
            type="number"
            value={formData.bladeCost || ''}
            onChange={(e) => setFormData({ ...formData, bladeCost: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Maintenance Cost (₦)</Label>
          <Input 
            type="number"
            value={formData.maintenanceCost || ''}
            onChange={(e) => setFormData({ ...formData, maintenanceCost: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Downtime (minutes)</Label>
          <Input 
            type="number"
            value={formData.downtimeMinutes || ''}
            onChange={(e) => setFormData({ ...formData, downtimeMinutes: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Downtime Reason</Label>
          <Input 
            value={formData.downtimeReason}
            onChange={(e) => setFormData({ ...formData, downtimeReason: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Operator</Label>
        <select
          className="w-full p-2 border rounded-lg"
          value={formData.operatorId}
          onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })}
        >
          <option value="">Select operator</option>
          {workers.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time *</Label>
          <Input 
            type="datetime-local"
            required
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>End Time *</Label>
          <Input 
            type="datetime-local"
            required
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Input 
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1 bg-purple-600 hover:bg-purple-700"
          disabled={!formData.batchId}
        >
          Record Grinding
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function WashingForm({ 
  batches, 
  workers,
  onSubmit, 
  onCancel 
}: { 
  batches: Batch[]; 
  workers: Worker[];
  onSubmit: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    batchId: '',
    inputWeight: 0,
    afterWashWeight: 0,
    afterDewaterWeight: 0,
    finalDryWeight: 0,
    chemicalsCost: 0,
    waterCost: 0,
    labourCost: 0,
    dieselAllocation: 0,
    operatorIds: [] as string[],
    startTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endTime: new Date().toISOString().slice(0, 16),
    notes: '',
  });

  const selectedBatch = batches.find(b => b.id === formData.batchId);
  
  const washLoss = formData.inputWeight > 0 
    ? ((formData.inputWeight - formData.afterWashWeight) / formData.inputWeight) * 100 
    : 0;
  const dewaterLoss = formData.afterWashWeight > 0 
    ? ((formData.afterWashWeight - formData.afterDewaterWeight) / formData.afterWashWeight) * 100 
    : 0;
  const totalLoss = formData.inputWeight > 0 
    ? ((formData.inputWeight - formData.finalDryWeight) / formData.inputWeight) * 100 
    : 0;

  const toggleOperator = (id: string) => {
    setFormData(prev => ({
      ...prev,
      operatorIds: prev.operatorIds.includes(id)
        ? prev.operatorIds.filter(opId => opId !== id)
        : [...prev.operatorIds, id]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Batch *</Label>
        <select
          required
          className="w-full p-2 border rounded-lg"
          value={formData.batchId}
          onChange={(e) => {
            const batch = batches.find(b => b.id === e.target.value);
            setFormData({ 
              ...formData, 
              batchId: e.target.value,
              inputWeight: batch?.weights.groundFlakesWeight || 0
            });
          }}
        >
          <option value="">Select batch</option>
          {batches.map(batch => (
            <option key={batch.id} value={batch.id}>
              {batch.batchNumber} - {(batch.weights.groundFlakesWeight / 1000).toFixed(1)}t
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Input Weight (kg) *</Label>
          <Input 
            type="number"
            required
            value={formData.inputWeight || ''}
            onChange={(e) => setFormData({ ...formData, inputWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>After Wash (kg) *</Label>
          <Input 
            type="number"
            required
            value={formData.afterWashWeight || ''}
            onChange={(e) => setFormData({ ...formData, afterWashWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>After Dewater (kg) *</Label>
          <Input 
            type="number"
            required
            value={formData.afterDewaterWeight || ''}
            onChange={(e) => setFormData({ ...formData, afterDewaterWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Final Dry Weight (kg) *</Label>
          <Input 
            type="number"
            required
            value={formData.finalDryWeight || ''}
            onChange={(e) => setFormData({ ...formData, finalDryWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Loss Summary */}
      <div className="bg-cyan-50 p-3 rounded-lg space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-cyan-700">Wash Loss:</span>
          <span className="font-medium text-cyan-800">{washLoss.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-cyan-700">Dewater Loss:</span>
          <span className="font-medium text-cyan-800">{dewaterLoss.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between text-sm font-bold border-t border-cyan-200 pt-1">
          <span className="text-cyan-800">Total Loss:</span>
          <span className="text-cyan-800">{totalLoss.toFixed(1)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Chemicals Cost (₦)</Label>
          <Input 
            type="number"
            value={formData.chemicalsCost || ''}
            onChange={(e) => setFormData({ ...formData, chemicalsCost: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Water Cost (₦)</Label>
          <Input 
            type="number"
            value={formData.waterCost || ''}
            onChange={(e) => setFormData({ ...formData, waterCost: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Labour Cost (₦)</Label>
          <Input 
            type="number"
            value={formData.labourCost || ''}
            onChange={(e) => setFormData({ ...formData, labourCost: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Diesel Allocation (₦)</Label>
          <Input 
            type="number"
            value={formData.dieselAllocation || ''}
            onChange={(e) => setFormData({ ...formData, dieselAllocation: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Operators</Label>
        <div className="flex flex-wrap gap-2">
          {workers.map(worker => (
            <button
              key={worker.id}
              type="button"
              onClick={() => toggleOperator(worker.id)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                formData.operatorIds.includes(worker.id)
                  ? 'bg-cyan-100 border-cyan-500 text-cyan-700'
                  : 'bg-gray-100 border-gray-300 text-gray-600'
              }`}
            >
              {worker.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time *</Label>
          <Input 
            type="datetime-local"
            required
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>End Time *</Label>
          <Input 
            type="datetime-local"
            required
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Input 
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1 bg-cyan-600 hover:bg-cyan-700"
          disabled={!formData.batchId}
        >
          Record Washing
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
