// ============================================================================
// LOGISTICS MODULE - Inbound & Outbound Trips
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Truck, 
  MapPin, 
  User, 
  Fuel, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import type { Trip, TripType, TripStatus, PurchaseLot, Dispatch } from '@/types';

export function LogisticsModule() {
  const { hasPermission } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [lots, setLots] = useState<PurchaseLot[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [tripsData, lotsData, dispatchesData] = await Promise.all([
      db.getTrips(),
      db.getLots(),
      db.getDispatches(),
    ]);
    setTrips(tripsData);
    setLots(lotsData);
    setDispatches(dispatchesData);
    setLoading(false);
  };

  const filteredTrips = trips.filter(trip => 
    trip.tripNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inboundTrips = filteredTrips.filter(t => t.type === 'inbound');
  const outboundTrips = filteredTrips.filter(t => t.type === 'outbound');

  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'arrived':
        return <Badge className="bg-blue-100 text-blue-800"><MapPin className="w-3 h-3 mr-1" /> Arrived</Badge>;
      case 'in_transit':
        return <Badge className="bg-yellow-100 text-yellow-800"><Truck className="w-3 h-3 mr-1" /> In Transit</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" /> Planned</Badge>;
    }
  };

  const totalLogisticsCost = trips.reduce((sum, t) => sum + t.totalCost, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Trips</p>
                <p className="text-xl font-bold">{trips.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowRight className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Inbound</p>
                <p className="text-xl font-bold">{inboundTrips.length}</p>
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
                <p className="text-sm text-gray-500">Outbound</p>
                <p className="text-xl font-bold">{outboundTrips.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Fuel className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Cost</p>
                <p className="text-xl font-bold">₦{(totalLogisticsCost / 1000).toFixed(0)}k</p>
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
            placeholder="Search trips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasPermission('create_trip') && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                New Trip
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Trip</DialogTitle>
              </DialogHeader>
              <TripForm 
                lots={lots}
                dispatches={dispatches}
                onSubmit={async (data) => {
                  await db.createTrip(data);
                  setShowForm(false);
                  loadData();
                }}
                onCancel={() => setShowForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Trips Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({filteredTrips.length})</TabsTrigger>
          <TabsTrigger value="inbound">Inbound ({inboundTrips.length})</TabsTrigger>
          <TabsTrigger value="outbound">Outbound ({outboundTrips.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <TripsTable 
            trips={filteredTrips} 
            getStatusBadge={getStatusBadge}
            onSelect={setSelectedTrip}
          />
        </TabsContent>
        <TabsContent value="inbound" className="mt-4">
          <TripsTable 
            trips={inboundTrips} 
            getStatusBadge={getStatusBadge}
            onSelect={setSelectedTrip}
          />
        </TabsContent>
        <TabsContent value="outbound" className="mt-4">
          <TripsTable 
            trips={outboundTrips} 
            getStatusBadge={getStatusBadge}
            onSelect={setSelectedTrip}
          />
        </TabsContent>
      </Tabs>

      {/* Trip Detail Dialog */}
      <Dialog open={!!selectedTrip} onOpenChange={() => setSelectedTrip(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Trip Details: {selectedTrip?.tripNumber}</DialogTitle>
          </DialogHeader>
          {selectedTrip && (
            <TripDetail trip={selectedTrip} onUpdate={loadData} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TripsTable({ 
  trips, 
  getStatusBadge,
  onSelect 
}: { 
  trips: Trip[]; 
  getStatusBadge: (status: TripStatus) => React.ReactNode;
  onSelect: (trip: Trip) => void;
}) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trip #</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.map((trip) => (
              <TableRow 
                key={trip.id} 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onSelect(trip)}
              >
                <TableCell className="font-medium">{trip.tripNumber}</TableCell>
                <TableCell>
                  <Badge variant={trip.type === 'inbound' ? 'default' : 'secondary'}>
                    {trip.type}
                  </Badge>
                </TableCell>
                <TableCell>{trip.vehicleNumber}</TableCell>
                <TableCell>{trip.driverName}</TableCell>
                <TableCell className="text-sm">
                  {trip.origin} → {trip.destination}
                </TableCell>
                <TableCell>₦{trip.totalCost.toLocaleString()}</TableCell>
                <TableCell>{getStatusBadge(trip.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {trips.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No trips found
        </div>
      )}
    </Card>
  );
}

function TripDetail({ trip, onUpdate }: { trip: Trip; onUpdate: () => void }) {
  const canUpdateStatus = trip.status !== 'completed';

  const updateStatus = async (newStatus: TripStatus) => {
    await db.updateTripStatus(trip.id, newStatus);
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <Badge variant={trip.type === 'inbound' ? 'default' : 'secondary'}>
            {trip.type.toUpperCase()}
          </Badge>
        </div>
        {canUpdateStatus && (
          <div className="flex gap-2">
            {trip.status === 'planned' && (
              <Button size="sm" onClick={() => updateStatus('in_transit')}>
                Start Trip
              </Button>
            )}
            {trip.status === 'in_transit' && (
              <Button size="sm" onClick={() => updateStatus('arrived')}>
                Mark Arrived
              </Button>
            )}
            {trip.status === 'arrived' && (
              <Button size="sm" onClick={() => updateStatus('completed')}>
                Complete
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Vehicle</p>
          <p className="font-medium">{trip.vehicleNumber}</p>
          <p className="text-sm text-gray-600">{trip.vehicleType}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Driver</p>
          <p className="font-medium">{trip.driverName}</p>
          <p className="text-sm text-gray-600">{trip.driverPhone}</p>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-xs text-gray-500 mb-2">Route</p>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="font-medium">{trip.origin}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="text-center">
            <p className="font-medium">{trip.destination}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Fuel Cost</p>
          <p className="font-medium">₦{trip.fuelCost.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Driver Wage</p>
          <p className="font-medium">₦{trip.driverWage.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Other Costs</p>
          <p className="font-medium">₦{trip.otherCosts.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <p className="text-sm text-green-700">Total Trip Cost</p>
          <p className="text-xl font-bold text-green-800">₦{trip.totalCost.toLocaleString()}</p>
        </div>
      </div>

      {trip.departureTime && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Departure</p>
          <p className="font-medium">{new Date(trip.departureTime).toLocaleString()}</p>
        </div>
      )}

      {trip.arrivalTime && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Arrival</p>
          <p className="font-medium">{new Date(trip.arrivalTime).toLocaleString()}</p>
        </div>
      )}

      {trip.notes && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Notes</p>
          <p className="text-sm">{trip.notes}</p>
        </div>
      )}
    </div>
  );
}

function TripForm({ 
  lots, 
  dispatches,
  onSubmit, 
  onCancel 
}: { 
  lots: PurchaseLot[]; 
  dispatches: Dispatch[];
  onSubmit: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    type: 'inbound' as TripType,
    status: 'planned' as TripStatus,
    vehicleNumber: '',
    vehicleType: '',
    driverName: '',
    driverPhone: '',
    origin: '',
    destination: '',
    fuelCost: 0,
    driverWage: 0,
    otherCosts: 0,
    linkedLotIds: [] as string[],
    linkedDispatchId: '',
    notes: '',
  });

  const totalCost = formData.fuelCost + formData.driverWage + formData.otherCosts;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      totalCost,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Trip Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(v) => setFormData({ ...formData, type: v as TripType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inbound">Inbound (Collection)</SelectItem>
              <SelectItem value="outbound">Outbound (Delivery)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(v) => setFormData({ ...formData, status: v as TripStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Vehicle Number *</Label>
          <Input 
            required
            value={formData.vehicleNumber}
            onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
            placeholder="e.g., LAG-123-AA"
          />
        </div>
        <div className="space-y-2">
          <Label>Vehicle Type</Label>
          <Input 
            value={formData.vehicleType}
            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
            placeholder="e.g., Truck, Van"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Driver Name *</Label>
          <Input 
            required
            value={formData.driverName}
            onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Driver Phone</Label>
          <Input 
            value={formData.driverPhone}
            onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Origin *</Label>
          <Input 
            required
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Destination *</Label>
          <Input 
            required
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Fuel Cost (₦)</Label>
          <Input 
            type="number"
            value={formData.fuelCost || ''}
            onChange={(e) => setFormData({ ...formData, fuelCost: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Driver Wage (₦)</Label>
          <Input 
            type="number"
            value={formData.driverWage || ''}
            onChange={(e) => setFormData({ ...formData, driverWage: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Other Costs (₦)</Label>
          <Input 
            type="number"
            value={formData.otherCosts || ''}
            onChange={(e) => setFormData({ ...formData, otherCosts: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      {formData.type === 'inbound' && (
        <div className="space-y-2">
          <Label>Link to Lots</Label>
          <Select 
            value={formData.linkedLotIds[0] || ''} 
            onValueChange={(v) => setFormData({ ...formData, linkedLotIds: v ? [v] : [] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select lot (optional)" />
            </SelectTrigger>
            <SelectContent>
              {lots.filter(l => l.paymentStatus === 'pending').map(lot => (
                <SelectItem key={lot.id} value={lot.id}>
                  {lot.lotNumber} - {lot.vendor?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.type === 'outbound' && (
        <div className="space-y-2">
          <Label>Link to Dispatch</Label>
          <Select 
            value={formData.linkedDispatchId} 
            onValueChange={(v) => setFormData({ ...formData, linkedDispatchId: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select dispatch (optional)" />
            </SelectTrigger>
            <SelectContent>
              {dispatches.filter(d => d.status === 'preparing').map(dispatch => (
                <SelectItem key={dispatch.id} value={dispatch.id}>
                  {dispatch.dispatchNumber} - {dispatch.buyer?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Notes</Label>
        <Input 
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      {/* Cost Summary */}
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <p className="text-sm text-green-700">Total Trip Cost</p>
          <p className="text-xl font-bold text-green-800">₦{totalCost.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
          Create Trip
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
