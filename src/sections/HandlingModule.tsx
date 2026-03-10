// ============================================================================
// HANDLING MODULE - Cost Layer Integration
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
  Hand, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw,
  CheckCircle,
  Clock,
  TrendingUp,
  Package,
  Truck,
  Factory
} from 'lucide-react';
import type { HandlingEvent, HandlingType, HandlingDirection, PurchaseLot, Batch, Dispatch } from '@/types';

export function HandlingModule() {
  const { hasPermission } = useAuth();
  const [events, setEvents] = useState<HandlingEvent[]>([]);
  const [handlingTypes, setHandlingTypes] = useState<HandlingType[]>([]);
  const [lots, setLots] = useState<PurchaseLot[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [eventsData, typesData, lotsData, batchesData, dispatchesData] = await Promise.all([
      db.getHandlingEvents(),
      db.getHandlingTypes(),
      db.getLots(),
      db.getBatches(),
      db.getDispatches(),
    ]);
    setEvents(eventsData);
    setHandlingTypes(typesData);
    setLots(lotsData);
    setBatches(batchesData);
    setDispatches(dispatchesData);
    setLoading(false);
  };

  const filteredEvents = events.filter(event => 
    event.handlingType?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.paidTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inboundEvents = filteredEvents.filter(e => e.direction === 'inbound');
  const internalEvents = filteredEvents.filter(e => e.direction === 'internal');
  const outboundEvents = filteredEvents.filter(e => e.direction === 'outbound');

  const totalHandlingCost = events.reduce((sum, e) => sum + e.amount, 0);
  const pendingPayments = events.filter(e => !e.isPaid).reduce((sum, e) => sum + e.amount, 0);

  const getDirectionIcon = (direction: HandlingDirection) => {
    switch (direction) {
      case 'inbound':
        return <ArrowDownLeft className="w-4 h-4" />;
      case 'outbound':
        return <ArrowUpRight className="w-4 h-4" />;
      default:
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  const getDirectionColor = (direction: HandlingDirection) => {
    switch (direction) {
      case 'inbound':
        return 'bg-blue-100 text-blue-800';
      case 'outbound':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                <Hand className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Events</p>
                <p className="text-xl font-bold">{events.length}</p>
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
                <p className="text-sm text-gray-500">Total Cost</p>
                <p className="text-xl font-bold">₦{(totalHandlingCost / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold">₦{(pendingPayments / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Types</p>
                <p className="text-xl font-bold">{handlingTypes.length}</p>
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
            placeholder="Search handling events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasPermission('create_handling') && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Record Handling
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record Handling Event</DialogTitle>
              </DialogHeader>
              <HandlingForm 
                handlingTypes={handlingTypes}
                lots={lots}
                batches={batches}
                dispatches={dispatches}
                onSubmit={async (data) => {
                  await db.createHandlingEvent(data);
                  setShowForm(false);
                  loadData();
                }}
                onCancel={() => setShowForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Events Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({filteredEvents.length})</TabsTrigger>
          <TabsTrigger value="inbound">Inbound ({inboundEvents.length})</TabsTrigger>
          <TabsTrigger value="internal">Internal ({internalEvents.length})</TabsTrigger>
          <TabsTrigger value="outbound">Outbound ({outboundEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <EventsTable 
            events={filteredEvents}
            getDirectionIcon={getDirectionIcon}
            getDirectionColor={getDirectionColor}
          />
        </TabsContent>
        <TabsContent value="inbound" className="mt-4">
          <EventsTable 
            events={inboundEvents}
            getDirectionIcon={getDirectionIcon}
            getDirectionColor={getDirectionColor}
          />
        </TabsContent>
        <TabsContent value="internal" className="mt-4">
          <EventsTable 
            events={internalEvents}
            getDirectionIcon={getDirectionIcon}
            getDirectionColor={getDirectionColor}
          />
        </TabsContent>
        <TabsContent value="outbound" className="mt-4">
          <EventsTable 
            events={outboundEvents}
            getDirectionIcon={getDirectionIcon}
            getDirectionColor={getDirectionColor}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EventsTable({ 
  events,
  getDirectionIcon,
  getDirectionColor,
}: { 
  events: HandlingEvent[];
  getDirectionIcon: (direction: HandlingDirection) => React.ReactNode;
  getDirectionColor: (direction: HandlingDirection) => string;
}) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Linked To</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid To</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.handlingType?.name}</TableCell>
                <TableCell>
                  <Badge className={getDirectionColor(event.direction)}>
                    {getDirectionIcon(event.direction)}
                    <span className="ml-1 capitalize">{event.direction}</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-sm capitalize">
                  {event.linkedType}
                </TableCell>
                <TableCell>
                  {event.quantity} {event.unit}
                </TableCell>
                <TableCell>₦{event.rate}</TableCell>
                <TableCell className="font-medium">₦{event.amount.toLocaleString()}</TableCell>
                <TableCell>{event.paidTo}</TableCell>
                <TableCell>
                  {event.isPaid ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" /> Paid
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" /> Pending
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {events.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No handling events found
        </div>
      )}
    </Card>
  );
}

function HandlingForm({ 
  handlingTypes, 
  lots,
  batches,
  dispatches,
  onSubmit, 
  onCancel 
}: { 
  handlingTypes: HandlingType[]; 
  lots: PurchaseLot[];
  batches: Batch[];
  dispatches: Dispatch[];
  onSubmit: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    handlingTypeId: '',
    direction: 'inbound' as HandlingDirection,
    linkedType: 'lot' as 'lot' | 'batch' | 'dispatch' | 'trip',
    linkedId: '',
    quantity: 0,
    unit: 'kg' as 'kg' | 'bag' | 'hour' | 'trip',
    rate: 0,
    paidTo: '',
    paymentMethod: 'cash' as 'cash' | 'transfer' | 'pending',
    isPaid: false,
    timestamp: new Date().toISOString().slice(0, 16),
    notes: '',
  });

  const selectedType = handlingTypes.find(ht => ht.id === formData.handlingTypeId);
  const amount = formData.quantity * formData.rate;

  const getLinkedItems = () => {
    switch (formData.linkedType) {
      case 'lot':
        return lots.map(l => ({ id: l.id, label: `${l.lotNumber} - ${l.vendor?.name}` }));
      case 'batch':
        return batches.map(b => ({ id: b.id, label: b.batchNumber }));
      case 'dispatch':
        return dispatches.map(d => ({ id: d.id, label: `${d.dispatchNumber} - ${d.buyer?.name}` }));
      default:
        return [];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Handling Type *</Label>
        <Select 
          value={formData.handlingTypeId} 
          onValueChange={(v) => {
            const type = handlingTypes.find(ht => ht.id === v);
            setFormData({ 
              ...formData, 
              handlingTypeId: v,
              direction: type?.direction || 'inbound',
              unit: type?.defaultUnit || 'kg'
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select handling type" />
          </SelectTrigger>
          <SelectContent>
            {handlingTypes.map(ht => (
              <SelectItem key={ht.id} value={ht.id}>{ht.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Link Type</Label>
          <Select 
            value={formData.linkedType} 
            onValueChange={(v) => setFormData({ ...formData, linkedType: v as any, linkedId: '' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lot">Purchase Lot</SelectItem>
              <SelectItem value="batch">Batch</SelectItem>
              <SelectItem value="dispatch">Dispatch</SelectItem>
              <SelectItem value="trip">Trip</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Link To *</Label>
          <Select 
            value={formData.linkedId} 
            onValueChange={(v) => setFormData({ ...formData, linkedId: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${formData.linkedType}`} />
            </SelectTrigger>
            <SelectContent>
              {getLinkedItems().map(item => (
                <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Quantity *</Label>
          <Input 
            type="number"
            required
            min={0}
            value={formData.quantity || ''}
            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Unit</Label>
          <Select 
            value={formData.unit} 
            onValueChange={(v) => setFormData({ ...formData, unit: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">Kilogram (kg)</SelectItem>
              <SelectItem value="bag">Bag</SelectItem>
              <SelectItem value="hour">Hour</SelectItem>
              <SelectItem value="trip">Trip</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Rate (₦)</Label>
          <Input 
            type="number"
            required
            min={0}
            value={formData.rate || ''}
            onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Paid To *</Label>
        <Input 
          required
          value={formData.paidTo}
          onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
          placeholder="Worker or contractor name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select 
            value={formData.paymentMethod} 
            onValueChange={(v) => setFormData({ ...formData, paymentMethod: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="transfer">Bank Transfer</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Payment Status</Label>
          <Select 
            value={formData.isPaid ? 'paid' : 'pending'} 
            onValueChange={(v) => setFormData({ ...formData, isPaid: v === 'paid' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Timestamp</Label>
        <Input 
          type="datetime-local"
          value={formData.timestamp}
          onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
        />
      </div>

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
          <p className="text-sm text-green-700">Total Amount</p>
          <p className="text-xl font-bold text-green-800">₦{amount.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
          Record Handling
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
