// ============================================================================
// PROCUREMENT MODULE - Purchase Lots
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
  Scale, 
  Calculator, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Package,
  Camera
} from 'lucide-react';
import type { PurchaseLot, MaterialType, MaterialGrade, Vendor } from '@/types';

export function ProcurementModule() {
  const { hasPermission } = useAuth();
  const [lots, setLots] = useState<PurchaseLot[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedLot, setSelectedLot] = useState<PurchaseLot | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [lotsData, vendorsData] = await Promise.all([
      db.getLots(),
      db.getVendors(),
    ]);
    setLots(lotsData);
    setVendors(vendorsData);
    setLoading(false);
  };

  const filteredLots = lots.filter(lot => 
    lot.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingLots = filteredLots.filter(l => l.paymentStatus === 'pending');
  const paidLots = filteredLots.filter(l => l.paymentStatus === 'paid');
  const partialLots = filteredLots.filter(l => l.paymentStatus === 'partial');

  const getPaymentBadge = (status: PurchaseLot['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Partial</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const totalPending = pendingLots.reduce((sum, lot) => sum + lot.totalCost, 0);

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
                <p className="text-sm text-gray-500">Total Lots</p>
                <p className="text-xl font-bold">{lots.length}</p>
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
                <p className="text-xl font-bold">
                  {(lots.reduce((sum, l) => sum + l.netWeight, 0) / 1000).toFixed(1)}t
                </p>
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
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-xl font-bold">
                  ₦{(lots.reduce((sum, l) => sum + l.totalCost, 0) / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Pay</p>
                <p className="text-xl font-bold">₦{(totalPending / 1000000).toFixed(1)}M</p>
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
            placeholder="Search lots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasPermission('create_lot') && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                New Purchase
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Purchase Lot</DialogTitle>
              </DialogHeader>
              <PurchaseLotForm 
                vendors={vendors}
                onSubmit={async (data) => {
                  await db.createLot(data);
                  setShowForm(false);
                  loadData();
                }}
                onCancel={() => setShowForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Lots Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({filteredLots.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingLots.length})</TabsTrigger>
          <TabsTrigger value="partial">Partial ({partialLots.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({paidLots.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <LotsTable 
            lots={filteredLots} 
            getPaymentBadge={getPaymentBadge}
            onSelect={setSelectedLot}
          />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <LotsTable 
            lots={pendingLots} 
            getPaymentBadge={getPaymentBadge}
            onSelect={setSelectedLot}
          />
        </TabsContent>
        <TabsContent value="partial" className="mt-4">
          <LotsTable 
            lots={partialLots} 
            getPaymentBadge={getPaymentBadge}
            onSelect={setSelectedLot}
          />
        </TabsContent>
        <TabsContent value="paid" className="mt-4">
          <LotsTable 
            lots={paidLots} 
            getPaymentBadge={getPaymentBadge}
            onSelect={setSelectedLot}
          />
        </TabsContent>
      </Tabs>

      {/* Lot Detail Dialog */}
      <Dialog open={!!selectedLot} onOpenChange={() => setSelectedLot(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lot Details: {selectedLot?.lotNumber}</DialogTitle>
          </DialogHeader>
          {selectedLot && (
            <LotDetail lot={selectedLot} onUpdate={loadData} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LotsTable({ 
  lots, 
  getPaymentBadge,
  onSelect 
}: { 
  lots: PurchaseLot[]; 
  getPaymentBadge: (status: PurchaseLot['paymentStatus']) => React.ReactNode;
  onSelect: (lot: PurchaseLot) => void;
}) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lot #</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Price/kg</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lots.map((lot) => (
              <TableRow 
                key={lot.id} 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onSelect(lot)}
              >
                <TableCell className="font-medium">{lot.lotNumber}</TableCell>
                <TableCell>{lot.vendor?.name}</TableCell>
                <TableCell>{lot.netWeight.toLocaleString()} kg</TableCell>
                <TableCell>₦{lot.finalPricePerKg}</TableCell>
                <TableCell>₦{lot.totalCost.toLocaleString()}</TableCell>
                <TableCell>{getPaymentBadge(lot.paymentStatus)}</TableCell>
                <TableCell>{new Date(lot.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {lots.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No lots found
        </div>
      )}
    </Card>
  );
}

function LotDetail({ lot, onUpdate }: { lot: PurchaseLot; onUpdate: () => void }) {
  const [paymentAmount, setPaymentAmount] = useState('');

  const handlePayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (amount > 0) {
      await db.updateLotPayment(lot.id, amount);
      setPaymentAmount('');
      onUpdate();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Vendor</p>
          <p className="font-medium">{lot.vendor?.name}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Material</p>
          <p className="font-medium">{lot.materialType} - Grade {lot.grade}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Gross Weight</p>
          <p className="font-medium">{lot.grossWeight.toLocaleString()} kg</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Tare Weight</p>
          <p className="font-medium">{lot.tareWeight.toLocaleString()} kg</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Net Weight</p>
          <p className="font-medium">{lot.netWeight.toLocaleString()} kg</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Base Price</p>
          <p className="font-medium">₦{lot.basePricePerKg}/kg</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Final Price</p>
          <p className="font-medium">₦{lot.finalPricePerKg}/kg</p>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-green-600">Total Cost</p>
            <p className="text-xl font-bold text-green-700">₦{lot.totalCost.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-green-600">Paid</p>
            <p className="text-lg font-semibold text-green-700">₦{lot.amountPaid.toLocaleString()}</p>
          </div>
        </div>
        {lot.paymentStatus !== 'paid' && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <p className="text-xs text-green-600 mb-2">
              Balance: ₦{(lot.totalCost - lot.amountPaid).toLocaleString()}
            </p>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Payment amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handlePayment} className="bg-green-600 hover:bg-green-700">
                Pay
              </Button>
            </div>
          </div>
        )}
      </div>

      {lot.notes && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Notes</p>
          <p className="text-sm">{lot.notes}</p>
        </div>
      )}
    </div>
  );
}

function PurchaseLotForm({ 
  vendors, 
  onSubmit, 
  onCancel 
}: { 
  vendors: Vendor[]; 
  onSubmit: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    vendorId: '',
    materialType: 'PET' as MaterialType,
    grade: 'A' as MaterialGrade,
    grossWeight: 0,
    tareWeight: 0,
    basePricePerKg: 200,
    gradeAdjustment: 0,
    moistureAdjustment: 0,
    contaminationAdjustment: 0,
    notes: '',
  });

  const netWeight = Math.max(0, formData.grossWeight - formData.tareWeight);
  const moistureDeduction = netWeight * (formData.moistureAdjustment / 100);
  const contaminationDeduction = netWeight * (formData.contaminationAdjustment / 100);
  const adjustedWeight = netWeight - moistureDeduction - contaminationDeduction;
  const finalPrice = formData.basePricePerKg + formData.gradeAdjustment;
  const totalCost = Math.floor(adjustedWeight * finalPrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      netWeight: adjustedWeight,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Vendor *</Label>
        <Select 
          value={formData.vendorId} 
          onValueChange={(v) => setFormData({ ...formData, vendorId: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select vendor" />
          </SelectTrigger>
          <SelectContent>
            {vendors.map(v => (
              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Material Type</Label>
          <Select 
            value={formData.materialType} 
            onValueChange={(v) => setFormData({ ...formData, materialType: v as MaterialType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['PET', 'HDPE', 'PP', 'LDPE', 'PVC', 'MIXED'].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Grade</Label>
          <Select 
            value={formData.grade} 
            onValueChange={(v) => setFormData({ ...formData, grade: v as MaterialGrade })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['A', 'B', 'C'].map(g => (
                <SelectItem key={g} value={g}>Grade {g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Gross Weight (kg) *</Label>
          <Input 
            type="number"
            required
            value={formData.grossWeight || ''}
            onChange={(e) => setFormData({ ...formData, grossWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Tare Weight (kg)</Label>
          <Input 
            type="number"
            value={formData.tareWeight || ''}
            onChange={(e) => setFormData({ ...formData, tareWeight: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Net Weight:</span>
          <span className="font-medium">{netWeight.toLocaleString()} kg</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Base Price (₦/kg)</Label>
          <Input 
            type="number"
            value={formData.basePricePerKg}
            onChange={(e) => setFormData({ ...formData, basePricePerKg: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Grade Adjustment (₦)</Label>
          <Input 
            type="number"
            value={formData.gradeAdjustment}
            onChange={(e) => setFormData({ ...formData, gradeAdjustment: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Moisture Deduction (%)</Label>
          <Input 
            type="number"
            min={0}
            max={100}
            value={formData.moistureAdjustment}
            onChange={(e) => setFormData({ ...formData, moistureAdjustment: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Contamination Deduction (%)</Label>
          <Input 
            type="number"
            min={0}
            max={100}
            value={formData.contaminationAdjustment}
            onChange={(e) => setFormData({ ...formData, contaminationAdjustment: parseFloat(e.target.value) || 0 })}
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

      {/* Cost Summary */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-800 mb-2">Cost Summary</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-green-700">Adjusted Weight:</span>
            <span className="font-medium">{adjustedWeight.toLocaleString()} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Final Price:</span>
            <span className="font-medium">₦{finalPrice}/kg</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-green-200 pt-2 mt-2">
            <span className="text-green-800">Total Cost:</span>
            <span className="text-green-800">₦{totalCost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
          Create Purchase Lot
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
