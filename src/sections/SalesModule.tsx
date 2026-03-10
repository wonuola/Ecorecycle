// ============================================================================
// SALES & DISPATCH MODULE
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  Truck, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  Banknote,
  ArrowRight,
  Scale,
  User
} from 'lucide-react';
import type { Dispatch, Buyer, Batch, Trip } from '@/types';

export function SalesModule() {
  const { hasPermission } = useAuth();
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [dispatchesData, buyersData, batchesData, tripsData] = await Promise.all([
      db.getDispatches(),
      db.getBuyers(),
      db.getBatches(),
      db.getTrips(),
    ]);
    setDispatches(dispatchesData);
    setBuyers(buyersData);
    setBatches(batchesData);
    setTrips(tripsData);
    setLoading(false);
  };

  const filteredDispatches = dispatches.filter(d => 
    d.dispatchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.buyer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalRevenue = dispatches.reduce((sum, d) => sum + d.totalValue, 0);
  const totalProfit = dispatches.reduce((sum, d) => sum + d.profit, 0);
  const totalDispatched = dispatches.reduce((sum, d) => sum + d.totalWeight, 0);
  const avgMargin = dispatches.length > 0 
    ? dispatches.reduce((sum, d) => sum + d.profitMargin, 0) / dispatches.length 
    : 0;

  const getStatusBadge = (status: Dispatch['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Paid</Badge>;
      case 'invoiced':
        return <Badge className="bg-blue-100 text-blue-800"><Banknote className="w-3 h-3 mr-1" /> Invoiced</Badge>;
      case 'confirmed':
        return <Badge className="bg-purple-100 text-purple-800"><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</Badge>;
      case 'delivered':
        return <Badge className="bg-cyan-100 text-cyan-800"><Truck className="w-3 h-3 mr-1" /> Delivered</Badge>;
      case 'in_transit':
        return <Badge className="bg-yellow-100 text-yellow-800"><ArrowRight className="w-3 h-3 mr-1" /> In Transit</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" /> Preparing</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Dispatches</p>
                <p className="text-xl font-bold">{dispatches.length}</p>
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
                <p className="text-sm text-gray-500">Total KG</p>
                <p className="text-xl font-bold">{(totalDispatched / 1000).toFixed(1)}t</p>
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
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-xl font-bold">₦{(totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${avgMargin >= 15 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <Banknote className={`w-5 h-5 ${avgMargin >= 15 ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Margin</p>
                <p className={`text-xl font-bold ${avgMargin >= 15 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {avgMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Summary */}
      <Card className={totalProfit >= 0 ? 'border-green-200' : 'border-red-200'}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Profit</p>
              <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₦{totalProfit.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Costs</p>
              <p className="text-xl font-semibold">
                ₦{dispatches.reduce((sum, d) => sum + d.totalCost, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search dispatches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasPermission('create_dispatch') && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Dispatch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Dispatch</DialogTitle>
              </DialogHeader>
              <DispatchForm 
                buyers={buyers}
                batches={batches.filter(b => b.currentState === 'final_flakes' && b.status !== 'dispatched')}
                trips={trips.filter(t => t.type === 'outbound' && t.status !== 'completed')}
                onSubmit={async (data) => {
                  await db.createDispatch(data);
                  setShowForm(false);
                  loadData();
                }}
                onCancel={() => setShowForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Dispatches Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispatch #</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Price/kg</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDispatches.map((dispatch) => (
                <TableRow 
                  key={dispatch.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedDispatch(dispatch)}
                >
                  <TableCell className="font-medium">{dispatch.dispatchNumber}</TableCell>
                  <TableCell>{dispatch.buyer?.name}</TableCell>
                  <TableCell>{dispatch.totalWeight.toLocaleString()} kg</TableCell>
                  <TableCell>₦{dispatch.pricePerKg}</TableCell>
                  <TableCell className="font-medium">₦{dispatch.totalValue.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={dispatch.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ₦{dispatch.profit.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(dispatch.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredDispatches.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No dispatches found
          </div>
        )}
      </Card>

      {/* Dispatch Detail Dialog */}
      <Dialog open={!!selectedDispatch} onOpenChange={() => setSelectedDispatch(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispatch Details: {selectedDispatch?.dispatchNumber}</DialogTitle>
          </DialogHeader>
          {selectedDispatch && (
            <DispatchDetail 
              dispatch={selectedDispatch} 
              onUpdate={loadData}
              onConfirmWeight={async (weight) => {
                await db.confirmBuyerWeight(selectedDispatch.id, weight);
                loadData();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DispatchDetail({ 
  dispatch, 
  onUpdate,
  onConfirmWeight 
}: { 
  dispatch: Dispatch; 
  onUpdate: () => void;
  onConfirmWeight: (weight: number) => void;
}) {
  const [confirmedWeight, setConfirmedWeight] = useState('');

  const handleConfirm = () => {
    const weight = parseFloat(confirmedWeight);
    if (weight > 0) {
      onConfirmWeight(weight);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="flex justify-between items-center">
        <Badge className={
          dispatch.status === 'paid' ? 'bg-green-100 text-green-800' :
          dispatch.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }>
          {dispatch.status.toUpperCase()}
        </Badge>
        <p className="text-sm text-gray-500">
          {new Date(dispatch.dispatchedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Buyer Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-gray-400" />
          <span className="font-medium">{dispatch.buyer?.name}</span>
        </div>
        <p className="text-sm text-gray-600">{dispatch.buyer?.contactPerson}</p>
        <p className="text-sm text-gray-600">{dispatch.buyer?.phone}</p>
        <p className="text-sm text-gray-600">{dispatch.buyer?.location}</p>
      </div>

      {/* Weight Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Factory Weight</p>
          <p className="text-2xl font-bold">{dispatch.factoryWeight.toLocaleString()} kg</p>
        </div>
        <div className={`p-4 rounded-lg ${
          dispatch.varianceKg === 0 ? 'bg-green-50' : 
          Math.abs(dispatch.variancePercent) > 2 ? 'bg-red-50' : 'bg-yellow-50'
        }`}>
          <p className={`text-sm ${
            dispatch.varianceKg === 0 ? 'text-green-600' : 
            Math.abs(dispatch.variancePercent) > 2 ? 'text-red-600' : 'text-yellow-600'
          }`}>
            Buyer Confirmed
          </p>
          <p className={`text-2xl font-bold ${
            dispatch.varianceKg === 0 ? 'text-green-700' : 
            Math.abs(dispatch.variancePercent) > 2 ? 'text-red-700' : 'text-yellow-700'
          }`}>
            {dispatch.buyerConfirmedWeight > 0 
              ? `${dispatch.buyerConfirmedWeight.toLocaleString()} kg`
              : 'Pending'
            }
          </p>
          {dispatch.buyerConfirmedWeight > 0 && (
            <p className={`text-sm ${
              dispatch.varianceKg === 0 ? 'text-green-600' : 
              Math.abs(dispatch.variancePercent) > 2 ? 'text-red-600' : 'text-yellow-600'
            }`}>
              Variance: {dispatch.varianceKg > 0 ? '+' : ''}{dispatch.varianceKg} kg ({dispatch.variancePercent}%)
            </p>
          )}
        </div>
      </div>

      {/* Confirm Weight Form */}
      {dispatch.buyerConfirmedWeight === 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-700 mb-2">Confirm Buyer Weight</p>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter confirmed weight (kg)"
              value={confirmedWeight}
              onChange={(e) => setConfirmedWeight(e.target.value)}
            />
            <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
              Confirm
            </Button>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Financial Summary</h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Price per kg:</span>
            <span>₦{dispatch.pricePerKg}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Value:</span>
            <span className="font-medium">₦{dispatch.totalValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Handling Cost:</span>
            <span>₦{dispatch.handlingCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Cost:</span>
            <span>₦{dispatch.deliveryCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cost of Goods:</span>
            <span>₦{(dispatch.totalCost - dispatch.handlingCost - dispatch.deliveryCost).toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Cost:</span>
              <span>₦{dispatch.totalCost.toLocaleString()}</span>
            </div>
            <div className={`flex justify-between font-bold mt-1 ${
              dispatch.profit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>Profit:</span>
              <span>₦{dispatch.profit.toLocaleString()} ({dispatch.profitMargin.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Batches */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Included Batches</h4>
        <div className="space-y-2">
          {dispatch.batches?.map(batch => (
            <div key={batch.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium">{batch.batchNumber}</p>
                <p className="text-sm text-gray-500">
                  {(batch.weights.finalDryFlakesWeight / 1000).toFixed(1)}t @ ₦{batch.costs.costPerKg}/kg
                </p>
              </div>
              <Badge variant="outline">{batch.currentState.replace(/_/g, ' ')}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Trip Info */}
      {dispatch.trip && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">Linked Trip</span>
          </div>
          <p className="text-sm text-blue-700">{dispatch.trip.tripNumber}</p>
          <p className="text-sm text-blue-700">{dispatch.trip.vehicleNumber} - {dispatch.trip.driverName}</p>
        </div>
      )}
    </div>
  );
}

function DispatchForm({ 
  buyers, 
  batches,
  trips,
  onSubmit, 
  onCancel 
}: { 
  buyers: Buyer[]; 
  batches: Batch[];
  trips: Trip[];
  onSubmit: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    buyerId: '',
    batchIds: [] as string[],
    factoryWeight: 0,
    pricePerKg: 400,
    handlingCost: 0,
    deliveryCost: 0,
    tripId: '',
  });

  const selectedBatches = batches.filter(b => formData.batchIds.includes(b.id));
  const availableWeight = selectedBatches.reduce((sum, b) => sum + b.weights.finalDryFlakesWeight, 0);
  const totalValue = formData.factoryWeight * formData.pricePerKg;
  const totalCost = selectedBatches.reduce((sum, b) => sum + (b.costs.costPerKg * b.weights.finalDryFlakesWeight), 0) + 
                    formData.handlingCost + formData.deliveryCost;
  const profit = totalValue - totalCost;
  const margin = totalValue > 0 ? (profit / totalValue) * 100 : 0;

  const toggleBatch = (batchId: string) => {
    setFormData(prev => ({
      ...prev,
      batchIds: prev.batchIds.includes(batchId)
        ? prev.batchIds.filter(id => id !== batchId)
        : [...prev.batchIds, batchId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Buyer *</Label>
        <select
          required
          className="w-full p-2 border rounded-lg"
          value={formData.buyerId}
          onChange={(e) => setFormData({ ...formData, buyerId: e.target.value })}
        >
          <option value="">Select buyer</option>
          {buyers.map(buyer => (
            <option key={buyer.id} value={buyer.id}>{buyer.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Select Batches *</Label>
        <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2">
          {batches.map(batch => (
            <div 
              key={batch.id}
              onClick={() => toggleBatch(batch.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                formData.batchIds.includes(batch.id)
                  ? 'bg-green-50 border-green-500 border'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{batch.batchNumber}</p>
                  <p className="text-sm text-gray-500">
                    {(batch.weights.finalDryFlakesWeight / 1000).toFixed(1)}t @ ₦{batch.costs.costPerKg}/kg
                  </p>
                </div>
                {formData.batchIds.includes(batch.id) && <CheckCircle className="w-5 h-5 text-green-600" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Available Weight:</span>
          <span className="font-medium">{availableWeight.toLocaleString()} kg</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Factory Weight (kg) *</Label>
          <Input 
            type="number"
            required
            value={formData.factoryWeight || ''}
            onChange={(e) => setFormData({ ...formData, factoryWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Price per kg (₦) *</Label>
          <Input 
            type="number"
            required
            value={formData.pricePerKg}
            onChange={(e) => setFormData({ ...formData, pricePerKg: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Handling Cost (₦)</Label>
          <Input 
            type="number"
            value={formData.handlingCost || ''}
            onChange={(e) => setFormData({ ...formData, handlingCost: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Delivery Cost (₦)</Label>
          <Input 
            type="number"
            value={formData.deliveryCost || ''}
            onChange={(e) => setFormData({ ...formData, deliveryCost: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Link to Trip (Optional)</Label>
        <select
          className="w-full p-2 border rounded-lg"
          value={formData.tripId}
          onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
        >
          <option value="">Select trip</option>
          {trips.map(trip => (
            <option key={trip.id} value={trip.id}>
              {trip.tripNumber} - {trip.vehicleNumber}
            </option>
          ))}
        </select>
      </div>

      {/* Profit Summary */}
      <div className={`p-4 rounded-lg ${margin >= 15 ? 'bg-green-50' : margin >= 10 ? 'bg-yellow-50' : 'bg-red-50'}`}>
        <h4 className="font-medium mb-2">Profit Projection</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Total Value:</span>
            <span className="font-medium">₦{totalValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Cost:</span>
            <span className="font-medium">₦{totalCost.toLocaleString()}</span>
          </div>
          <div className={`flex justify-between font-bold ${margin >= 15 ? 'text-green-700' : margin >= 10 ? 'text-yellow-700' : 'text-red-700'}`}>
            <span>Profit ({margin.toFixed(1)}%):</span>
            <span>₦{profit.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={!formData.buyerId || formData.batchIds.length === 0 || formData.factoryWeight <= 0}
        >
          Create Dispatch
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
