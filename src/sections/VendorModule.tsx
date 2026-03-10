// ============================================================================
// VENDOR & BUYER MODULE
// ============================================================================

import { useEffect, useState } from 'react';
import { db } from '@/services/database';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, Phone, MapPin, Package, TrendingUp, Plus, Search } from 'lucide-react';
import type { Vendor, Buyer, MaterialType } from '@/types';

export function VendorModule() {
  const { hasPermission } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [showBuyerForm, setShowBuyerForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [vendorsData, buyersData] = await Promise.all([
      db.getVendors(),
      db.getBuyers(),
    ]);
    setVendors(vendorsData);
    setBuyers(buyersData);
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBuyers = buyers.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getReliabilityColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="vendors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vendors">Vendors ({vendors.length})</TabsTrigger>
          <TabsTrigger value="buyers">Buyers ({buyers.length})</TabsTrigger>
        </TabsList>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {hasPermission('create_vendor') && (
              <Dialog open={showVendorForm} onOpenChange={setShowVendorForm}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vendor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add New Vendor</DialogTitle>
                  </DialogHeader>
                  <VendorForm 
                    onSubmit={async (data) => {
                      await db.createVendor(data);
                      setShowVendorForm(false);
                      loadData();
                    }}
                    onCancel={() => setShowVendorForm(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((vendor) => (
              <VendorCard 
                key={vendor.id} 
                vendor={vendor}
                reliabilityColor={getReliabilityColor(vendor.reliabilityScore)}
              />
            ))}
          </div>

          {filteredVendors.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No vendors found</p>
            </Card>
          )}
        </TabsContent>

        {/* Buyers Tab */}
        <TabsContent value="buyers" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search buyers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={showBuyerForm} onOpenChange={setShowBuyerForm}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Buyer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Buyer</DialogTitle>
                </DialogHeader>
                <BuyerForm 
                  onSubmit={async (data) => {
                    await db.createBuyer(data);
                    setShowBuyerForm(false);
                    loadData();
                  }}
                  onCancel={() => setShowBuyerForm(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuyers.map((buyer) => (
              <BuyerCard key={buyer.id} buyer={buyer} />
            ))}
          </div>

          {filteredBuyers.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No buyers found</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VendorCard({ vendor, reliabilityColor }: { vendor: Vendor; reliabilityColor: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
            <p className="text-sm text-gray-500">{vendor.contactPerson}</p>
          </div>
          <Badge className={reliabilityColor}>
            <Star className="w-3 h-3 mr-1" />
            {vendor.reliabilityScore}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4" />
            {vendor.phone}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            {vendor.location}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Package className="w-4 h-4" />
            {vendor.materialTypes.join(', ')}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Transactions</p>
            <p className="font-semibold">{vendor.totalTransactions}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total KG</p>
            <p className="font-semibold">{(vendor.totalKgPurchased / 1000).toFixed(1)}t</p>
          </div>
        </div>

        {vendor.notes && (
          <p className="mt-3 text-xs text-gray-500 italic">{vendor.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}

function BuyerCard({ buyer }: { buyer: Buyer }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{buyer.name}</h3>
            <p className="text-sm text-gray-500">{buyer.contactPerson}</p>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-200">
            <TrendingUp className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4" />
            {buyer.phone}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            {buyer.location}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Transactions</p>
            <p className="font-semibold">{buyer.totalTransactions}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total KG</p>
            <p className="font-semibold">{(buyer.totalKgSold / 1000).toFixed(1)}t</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VendorForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    location: '',
    materialTypes: [] as MaterialType[],
    reliabilityScore: 70,
    notes: '',
    isActive: true,
  });

  const materialTypes: MaterialType[] = ['PET', 'HDPE', 'PP', 'LDPE', 'PVC', 'MIXED'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleMaterialType = (type: MaterialType) => {
    setFormData(prev => ({
      ...prev,
      materialTypes: prev.materialTypes.includes(type)
        ? prev.materialTypes.filter(t => t !== type)
        : [...prev.materialTypes, type]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Company Name *</Label>
          <Input 
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Contact Person *</Label>
          <Input 
            required
            value={formData.contactPerson}
            onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phone *</Label>
          <Input 
            required
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input 
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Location *</Label>
        <Input 
          required
          value={formData.location}
          onChange={e => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Material Types</Label>
        <div className="flex flex-wrap gap-2">
          {materialTypes.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => toggleMaterialType(type)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                formData.materialTypes.includes(type)
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : 'bg-gray-100 border-gray-300 text-gray-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Reliability Score (0-100)</Label>
        <Input 
          type="number"
          min={0}
          max={100}
          value={formData.reliabilityScore}
          onChange={e => setFormData({ ...formData, reliabilityScore: parseInt(e.target.value) })}
        />
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Input 
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
          Add Vendor
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function BuyerForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    location: '',
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Company Name *</Label>
          <Input 
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Contact Person *</Label>
          <Input 
            required
            value={formData.contactPerson}
            onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phone *</Label>
          <Input 
            required
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input 
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Location *</Label>
        <Input 
          required
          value={formData.location}
          onChange={e => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
          Add Buyer
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
