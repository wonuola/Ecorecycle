// ============================================================================
// SORTING MODULE - Sorting Operations & Yield Tracking
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Scale
} from 'lucide-react';
import type { SortingOperation, Batch, Worker } from '@/types';

export function SortingModule() {
  const { hasPermission } = useAuth();
  const [operations, setOperations] = useState<SortingOperation[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [opsData, batchesData, workersData] = await Promise.all([
      db.getSortingOperations(),
      db.getBatches(),
      db.getWorkers(),
    ]);
    setOperations(opsData);
    setBatches(batchesData);
    setWorkers(workersData);
    setLoading(false);
  };

  const filteredOperations = operations.filter(op => 
    op.batch?.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.teamLeader.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalInput = operations.reduce((sum, op) => sum + op.inputWeight, 0);
  const totalOutput = operations.reduce((sum, op) => sum + op.sortedPetWeight, 0);
  const avgYield = operations.length > 0 
    ? operations.reduce((sum, op) => sum + op.yieldPercent, 0) / operations.length 
    : 0;
  const totalByproducts = operations.reduce((sum, op) => sum + op.capsWeight + op.labelsWeight, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Operations</p>
                <p className="text-xl font-bold">{operations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Scale className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Input</p>
                <p className="text-xl font-bold">{(totalInput / 1000).toFixed(1)}t</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Yield</p>
                <p className="text-xl font-bold">{avgYield.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Package className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Byproducts</p>
                <p className="text-xl font-bold">{(totalByproducts / 1000).toFixed(1)}t</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search operations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasPermission('create_sorting') && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Record Sorting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record Sorting Operation</DialogTitle>
              </DialogHeader>
              <SortingForm 
                batches={batches.filter(b => b.currentState === 'unsorted_pet')}
                workers={workers.filter(w => w.role === 'sorter')}
                onSubmit={async (data) => {
                  await db.createSortingOperation(data);
                  setShowForm(false);
                  loadData();
                }}
                onCancel={() => setShowForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Operations Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Input</TableHead>
                <TableHead>Sorted PET</TableHead>
                <TableHead>Yield</TableHead>
                <TableHead>Byproducts</TableHead>
                <TableHead>Rejects</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperations.map((op) => (
                <TableRow key={op.id}>
                  <TableCell className="font-medium">{op.batch?.batchNumber}</TableCell>
                  <TableCell>{op.inputWeight.toLocaleString()} kg</TableCell>
                  <TableCell className="font-medium text-green-600">
                    {op.sortedPetWeight.toLocaleString()} kg
                  </TableCell>
                  <TableCell>
                    <Badge className={op.yieldPercent >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {op.yieldPercent.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="text-yellow-600">C: {op.capsWeight}kg</span>
                    <br />
                    <span className="text-orange-600">L: {op.labelsWeight}kg</span>
                  </TableCell>
                  <TableCell className="text-red-600">{op.rejectsWeight} kg</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{op.workerIds.length}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {Math.floor(op.durationMinutes / 60)}h {op.durationMinutes % 60}m
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredOperations.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No sorting operations found
          </div>
        )}
      </Card>

      {/* Recent Operations Detail */}
      {filteredOperations.slice(0, 3).map(op => (
        <OperationDetailCard key={op.id} operation={op} />
      ))}
    </div>
  );
}

function OperationDetailCard({ operation }: { operation: SortingOperation }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">{operation.batch?.batchNumber}</h3>
            <p className="text-sm text-gray-500">
              {new Date(operation.createdAt).toLocaleDateString()} | Team: {operation.teamLeader}
            </p>
          </div>
          <Badge className={operation.yieldPercent >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
            {operation.yieldPercent.toFixed(1)}% Yield
          </Badge>
        </div>

        {/* Weight Flow */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Input: {operation.inputWeight.toLocaleString()} kg</span>
              <span className="font-medium text-green-600">
                Output: {operation.sortedPetWeight.toLocaleString()} kg
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-green-500 h-full rounded-full transition-all"
                style={{ width: `${operation.yieldPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-xs text-green-600">Sorted PET</p>
              <p className="font-semibold">{operation.sortedPetWeight.toLocaleString()}</p>
              <p className="text-xs text-green-500">kg</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <p className="text-xs text-yellow-600">Caps</p>
              <p className="font-semibold">{operation.capsWeight.toLocaleString()}</p>
              <p className="text-xs text-yellow-500">kg</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <p className="text-xs text-orange-600">Labels</p>
              <p className="font-semibold">{operation.labelsWeight.toLocaleString()}</p>
              <p className="text-xs text-orange-500">kg</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <p className="text-xs text-red-600">Rejects</p>
              <p className="font-semibold">{operation.rejectsWeight.toLocaleString()}</p>
              <p className="text-xs text-red-500">kg</p>
            </div>
          </div>

          <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
            <span className="text-gray-600">Duration: {Math.floor(operation.durationMinutes / 60)}h {operation.durationMinutes % 60}m</span>
            <span className="text-gray-600">Workers: {operation.workerIds.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SortingForm({ 
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
    sortedPetWeight: 0,
    capsWeight: 0,
    labelsWeight: 0,
    rejectsWeight: 0,
    workerIds: [] as string[],
    startTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endTime: new Date().toISOString().slice(0, 16),
    notes: '',
  });

  const selectedBatch = batches.find(b => b.id === formData.batchId);
  const totalOutput = formData.sortedPetWeight + formData.capsWeight + formData.labelsWeight + formData.rejectsWeight;
  const yieldPercent = formData.inputWeight > 0 ? (formData.sortedPetWeight / formData.inputWeight) * 100 : 0;
  const variance = formData.inputWeight - totalOutput;

  const toggleWorker = (workerId: string) => {
    setFormData(prev => ({
      ...prev,
      workerIds: prev.workerIds.includes(workerId)
        ? prev.workerIds.filter(id => id !== workerId)
        : [...prev.workerIds, workerId]
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
              inputWeight: batch?.weights.initialWeight || 0
            });
          }}
        >
          <option value="">Select batch</option>
          {batches.map(batch => (
            <option key={batch.id} value={batch.id}>
              {batch.batchNumber} - {(batch.weights.initialWeight / 1000).toFixed(1)}t
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
          <Label>Sorted PET Output (kg) *</Label>
          <Input 
            type="number"
            required
            value={formData.sortedPetWeight || ''}
            onChange={(e) => setFormData({ ...formData, sortedPetWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Caps (kg)</Label>
          <Input 
            type="number"
            value={formData.capsWeight || ''}
            onChange={(e) => setFormData({ ...formData, capsWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Labels (kg)</Label>
          <Input 
            type="number"
            value={formData.labelsWeight || ''}
            onChange={(e) => setFormData({ ...formData, labelsWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Rejects (kg)</Label>
          <Input 
            type="number"
            value={formData.rejectsWeight || ''}
            onChange={(e) => setFormData({ ...formData, rejectsWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-3 rounded-lg space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Output:</span>
          <span className="font-medium">{totalOutput.toLocaleString()} kg</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Variance:</span>
          <span className={`font-medium ${variance === 0 ? 'text-green-600' : 'text-orange-600'}`}>
            {variance > 0 ? '+' : ''}{variance.toLocaleString()} kg
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Yield:</span>
          <span className="font-medium text-green-600">{yieldPercent.toFixed(1)}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Select Workers *</Label>
        <div className="flex flex-wrap gap-2">
          {workers.map(worker => (
            <button
              key={worker.id}
              type="button"
              onClick={() => toggleWorker(worker.id)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                formData.workerIds.includes(worker.id)
                  ? 'bg-green-100 border-green-500 text-green-700'
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
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={formData.workerIds.length === 0 || !formData.batchId}
        >
          Record Sorting
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
