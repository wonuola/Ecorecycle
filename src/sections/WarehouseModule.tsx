// ============================================================================
// WAREHOUSE MODULE - Inventory Management
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Search, 
  Plus, 
  ArrowRightLeft,
  Factory,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Scale
} from 'lucide-react';
import type { Batch, InventoryState, PurchaseLot } from '@/types';

const INVENTORY_STATES: { key: InventoryState; label: string; color: string }[] = [
  { key: 'unsorted_pet', label: 'Unsorted PET', color: 'bg-gray-500' },
  { key: 'sorted_pet', label: 'Sorted PET', color: 'bg-blue-500' },
  { key: 'caps', label: 'Caps', color: 'bg-yellow-500' },
  { key: 'labels', label: 'Labels', color: 'bg-orange-500' },
  { key: 'ground_flakes', label: 'Ground Flakes', color: 'bg-purple-500' },
  { key: 'washed_flakes', label: 'Washed Flakes', color: 'bg-cyan-500' },
  { key: 'final_flakes', label: 'Final Flakes', color: 'bg-green-500' },
  { key: 'rejects', label: 'Rejects', color: 'bg-red-500' },
];

export function WarehouseModule() {
  const { hasPermission } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [lots, setLots] = useState<PurchaseLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [batchesData, lotsData] = await Promise.all([
      db.getBatches(),
      db.getLots(),
    ]);
    setBatches(batchesData);
    setLots(lotsData);
    setLoading(false);
  };

  const filteredBatches = batches.filter(batch => 
    batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate inventory by state
  const inventoryByState: Record<InventoryState, number> = {
    unsorted_pet: 0,
    sorted_pet: 0,
    caps: 0,
    labels: 0,
    ground_flakes: 0,
    washed_flakes: 0,
    final_flakes: 0,
    rejects: 0,
  };

  batches.forEach(batch => {
    if (batch.status !== 'dispatched') {
      const weight = batch.weights.finalDryFlakesWeight || 
                     batch.weights.groundFlakesWeight || 
                     batch.weights.sortedPetWeight || 
                     batch.weights.initialWeight;
      inventoryByState[batch.currentState] += weight;
    }
  });

  const totalInventory = Object.values(inventoryByState).reduce((sum, w) => sum + w, 0);
  const activeBatches = batches.filter(b => b.status === 'active').length;
  const completedBatches = batches.filter(b => b.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Inventory Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Scale className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Stock</p>
                <p className="text-xl font-bold">{(totalInventory / 1000).toFixed(1)}t</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Factory className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Batches</p>
                <p className="text-xl font-bold">{activeBatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-xl font-bold">{completedBatches}</p>
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
                <p className="text-sm text-gray-500">Avg Cost/kg</p>
                <p className="text-xl font-bold">
                  ₦{Math.floor(batches.reduce((sum, b) => sum + b.costs.costPerKg, 0) / (batches.length || 1))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory by State */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            Inventory by State
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INVENTORY_STATES.map(({ key, label, color }) => {
              const weight = inventoryByState[key];
              const percentage = totalInventory > 0 ? (weight / totalInventory) * 100 : 0;
              return (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                  <p className="text-2xl font-bold">{(weight / 1000).toFixed(1)}t</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${color} h-2 rounded-full transition-all`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Batches */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasPermission('create_batch') && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Batch</DialogTitle>
              </DialogHeader>
              <BatchForm 
                lots={lots}
                onSubmit={async (data) => {
                  await db.createBatch(data);
                  setShowForm(false);
                  loadData();
                }}
                onCancel={() => setShowForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Batches Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBatches.map((batch) => (
          <BatchCard 
            key={batch.id} 
            batch={batch}
            onClick={() => setSelectedBatch(batch)}
          />
        ))}
      </div>

      {filteredBatches.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No batches found</p>
        </Card>
      )}

      {/* Batch Detail Dialog */}
      <Dialog open={!!selectedBatch} onOpenChange={() => setSelectedBatch(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Batch Details: {selectedBatch?.batchNumber}</DialogTitle>
          </DialogHeader>
          {selectedBatch && (
            <BatchDetail batch={selectedBatch} onUpdate={loadData} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BatchCard({ batch, onClick }: { batch: Batch; onClick: () => void }) {
  const stateConfig = INVENTORY_STATES.find(s => s.key === batch.currentState);
  const currentWeight = batch.weights.finalDryFlakesWeight || 
                        batch.weights.groundFlakesWeight || 
                        batch.weights.sortedPetWeight || 
                        batch.weights.initialWeight;

  const getStatusBadge = () => {
    switch (batch.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'dispatched':
        return <Badge className="bg-purple-100 text-purple-800">Dispatched</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Active</Badge>;
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{batch.batchNumber}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${stateConfig?.color}`} />
              <span className="text-sm text-gray-500">{stateConfig?.label}</span>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-gray-500">Input</p>
            <p className="font-medium">{(batch.weights.initialWeight / 1000).toFixed(1)}t</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Current</p>
            <p className="font-medium">{(currentWeight / 1000).toFixed(1)}t</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Yield</span>
            <span className="font-medium">{batch.weights.totalYieldPercent.toFixed(1)}%</span>
          </div>
          <Progress value={batch.weights.totalYieldPercent} className="h-2" />
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-500">Cost/kg</span>
          <span className="font-semibold text-green-600">₦{batch.costs.costPerKg}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function BatchDetail({ batch, onUpdate }: { batch: Batch; onUpdate: () => void }) {
  return (
    <div className="space-y-6">
      {/* Status & State */}
      <div className="flex gap-4">
        <div className="flex-1 bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Status</p>
          <Badge className={
            batch.status === 'completed' ? 'bg-green-100 text-green-800' :
            batch.status === 'dispatched' ? 'bg-purple-100 text-purple-800' :
            'bg-yellow-100 text-yellow-800'
          }>
            {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
          </Badge>
        </div>
        <div className="flex-1 bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Current State</p>
          <p className="font-medium capitalize">{batch.currentState.replace(/_/g, ' ')}</p>
        </div>
      </div>

      {/* Weight Tracking */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Weight Tracking</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-600">Initial Weight</p>
            <p className="text-lg font-semibold">{batch.weights.initialWeight.toLocaleString()} kg</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-green-600">Sorted PET</p>
            <p className="text-lg font-semibold">{batch.weights.sortedPetWeight.toLocaleString()} kg</p>
            <p className="text-xs text-green-500">{batch.weights.sortingYieldPercent.toFixed(1)}% yield</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-purple-600">Ground Flakes</p>
            <p className="text-lg font-semibold">{batch.weights.groundFlakesWeight.toLocaleString()} kg</p>
            <p className="text-xs text-purple-500">{batch.weights.grindingYieldPercent.toFixed(1)}% yield</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg">
            <p className="text-xs text-emerald-600">Final Dry Flakes</p>
            <p className="text-lg font-semibold">{batch.weights.finalDryFlakesWeight.toLocaleString()} kg</p>
            <p className="text-xs text-emerald-500">{batch.weights.totalYieldPercent.toFixed(1)}% total yield</p>
          </div>
        </div>
      </div>

      {/* Byproducts */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Byproducts</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <p className="text-xs text-yellow-600">Caps</p>
            <p className="font-semibold">{batch.weights.capsWeight.toLocaleString()} kg</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <p className="text-xs text-orange-600">Labels</p>
            <p className="font-semibold">{batch.weights.labelsWeight.toLocaleString()} kg</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <p className="text-xs text-red-600">Rejects</p>
            <p className="font-semibold">{batch.weights.sortingRejectsWeight.toLocaleString()} kg</p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Cost Breakdown</h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Material Cost</span>
            <span>₦{batch.costs.materialCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sorting Cost</span>
            <span>₦{batch.costs.sortingCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Grinding Cost</span>
            <span>₦{batch.costs.grindingCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Washing Cost</span>
            <span>₦{batch.costs.washingCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Handling Cost</span>
            <span>₦{batch.costs.handlingCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Logistics Cost</span>
            <span>₦{batch.costs.logisticsCost.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Cost</span>
              <span>₦{batch.costs.totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-green-600 font-bold mt-1">
              <span>Cost per kg</span>
              <span>₦{batch.costs.costPerKg}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Source Lots */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Source Lots</h4>
        <div className="space-y-2">
          {batch.sourceLots?.map(lot => (
            <div key={lot.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium">{lot.lotNumber}</p>
                <p className="text-sm text-gray-500">{lot.vendor?.name}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{lot.netWeight.toLocaleString()} kg</p>
                <p className="text-sm text-gray-500">₦{lot.totalCost.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BatchForm({ 
  lots, 
  onSubmit, 
  onCancel 
}: { 
  lots: PurchaseLot[]; 
  onSubmit: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    sourceLotIds: [] as string[],
    initialWeight: 0,
  });

  const selectedLots = lots.filter(l => formData.sourceLotIds.includes(l.id));
  const totalAvailableWeight = selectedLots.reduce((sum, l) => sum + l.netWeight, 0);

  const toggleLot = (lotId: string) => {
    setFormData(prev => ({
      ...prev,
      sourceLotIds: prev.sourceLotIds.includes(lotId)
        ? prev.sourceLotIds.filter(id => id !== lotId)
        : [...prev.sourceLotIds, lotId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      initialWeight: formData.initialWeight || totalAvailableWeight,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Select Source Lots *</Label>
        <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-2">
          {lots.filter(l => l.paymentStatus === 'paid').map(lot => (
            <div 
              key={lot.id}
              onClick={() => toggleLot(lot.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                formData.sourceLotIds.includes(lot.id)
                  ? 'bg-green-50 border-green-500 border'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{lot.lotNumber}</p>
                  <p className="text-sm text-gray-500">{lot.vendor?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{lot.netWeight.toLocaleString()} kg</p>
                  <p className="text-sm text-gray-500">₦{lot.totalCost.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Selected Lots:</span>
          <span className="font-medium">{selectedLots.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Weight:</span>
          <span className="font-medium">{totalAvailableWeight.toLocaleString()} kg</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Initial Weight (kg)</Label>
        <Input 
          type="number"
          value={formData.initialWeight || totalAvailableWeight}
          onChange={(e) => setFormData({ ...formData, initialWeight: parseFloat(e.target.value) || 0 })}
        />
        <p className="text-xs text-gray-500">Defaults to total of selected lots</p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={formData.sourceLotIds.length === 0}
        >
          Create Batch
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
