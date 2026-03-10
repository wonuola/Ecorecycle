// ============================================================================
// WAGES MODULE - Worker Wage Management
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
  Banknote, 
  Users, 
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  Star,
  Award,
  Calendar
} from 'lucide-react';
import type { Worker, WageEntry, SortingOperation } from '@/types';

export function WagesModule() {
  const { hasPermission } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [wageEntries, setWageEntries] = useState<WageEntry[]>([]);
  const [operations, setOperations] = useState<SortingOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [workersData, wagesData, opsData] = await Promise.all([
      db.getWorkers(),
      db.getWageEntries(),
      db.getSortingOperations(),
    ]);
    setWorkers(workersData);
    setWageEntries(wagesData);
    setOperations(opsData);
    setLoading(false);
  };

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.phone.includes(searchTerm)
  );

  // Calculate stats
  const totalWagesPaid = wageEntries.filter(w => w.isPaid).reduce((sum, w) => sum + w.amount, 0);
  const totalWagesPending = wageEntries.filter(w => !w.isPaid).reduce((sum, w) => sum + w.amount, 0);
  const totalKgSorted = workers.reduce((sum, w) => sum + w.totalKgSorted, 0);

  // Sort workers by productivity
  const topWorkers = [...workers]
    .sort((a, b) => b.totalKgSorted - a.totalKgSorted)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Workers</p>
                <p className="text-xl font-bold">{workers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Banknote className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Wages Paid</p>
                <p className="text-xl font-bold">₦{(totalWagesPaid / 1000).toFixed(0)}k</p>
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
                <p className="text-xl font-bold">₦{(totalWagesPending / 1000).toFixed(0)}k</p>
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
                <p className="text-sm text-gray-500">Total KG Sorted</p>
                <p className="text-xl font-bold">{(totalKgSorted / 1000).toFixed(1)}t</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topWorkers.map((worker, index) => (
              <div key={worker.id} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">#{index + 1}</span>
                </div>
                <p className="font-medium text-sm">{worker.name}</p>
                <p className="text-xs text-gray-500">{worker.totalKgSorted.toLocaleString()} kg</p>
                <p className="text-xs text-green-600">₦{worker.totalWagesEarned.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="workers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workers">Workers ({workers.length})</TabsTrigger>
          <TabsTrigger value="entries">Wage Entries ({wageEntries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="workers" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search workers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {hasPermission('create_worker') && (
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Worker
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="entries" className="space-y-4">
          {hasPermission('create_wage') && (
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Wage Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Record Wage Payment</DialogTitle>
                </DialogHeader>
                <WageForm 
                  workers={workers}
                  operations={operations}
                  onSubmit={async (data) => {
                    await db.createWageEntry(data);
                    setShowForm(false);
                    loadData();
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </DialogContent>
            </Dialog>
          )}

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Operation</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wageEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.worker?.name}</TableCell>
                      <TableCell className="text-sm capitalize">{entry.operationType}</TableCell>
                      <TableCell>{entry.quantity.toLocaleString()}</TableCell>
                      <TableCell>₦{entry.rate}</TableCell>
                      <TableCell className="font-medium">₦{entry.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        {entry.isPaid ? (
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
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WorkerCard({ worker }: { worker: Worker }) {
  const getRoleColor = (role: Worker['role']) => {
    switch (role) {
      case 'sorter':
        return 'bg-blue-100 text-blue-800';
      case 'loader':
        return 'bg-orange-100 text-orange-800';
      case 'operator':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{worker.name}</h3>
            <Badge className={getRoleColor(worker.role)}>
              {worker.role.charAt(0).toUpperCase() + worker.role.slice(1)}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Since</p>
            <p className="text-sm">{new Date(worker.joinedAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="bg-blue-50 p-2 rounded-lg text-center">
            <p className="text-xs text-blue-600">KG Sorted</p>
            <p className="font-semibold">{worker.totalKgSorted.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-2 rounded-lg text-center">
            <p className="text-xs text-green-600">Earnings</p>
            <p className="font-semibold">₦{(worker.totalWagesEarned / 1000).toFixed(0)}k</p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Base Rate:</span>
            <span className="font-medium">₦{worker.baseWageRate}/unit</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Phone:</span>
            <span className="font-medium">{worker.phone}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WageForm({ 
  workers, 
  operations,
  onSubmit, 
  onCancel 
}: { 
  workers: Worker[]; 
  operations: SortingOperation[];
  onSubmit: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    workerId: '',
    operationType: 'sorting' as 'sorting' | 'loading' | 'grinding' | 'washing',
    operationId: '',
    quantity: 0,
    rate: 50,
    isTeamSplit: false,
    teamSize: 1,
    isPaid: true,
    periodStart: new Date().toISOString().slice(0, 10),
    periodEnd: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const amount = formData.isTeamSplit 
    ? (formData.quantity * formData.rate) / (formData.teamSize || 1)
    : formData.quantity * formData.rate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount,
      approvedBy: 'system',
      approvedAt: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Worker *</Label>
        <select
          required
          className="w-full p-2 border rounded-lg"
          value={formData.workerId}
          onChange={(e) => {
            const worker = workers.find(w => w.id === e.target.value);
            setFormData({ 
              ...formData, 
              workerId: e.target.value,
              rate: worker?.baseWageRate || 50
            });
          }}
        >
          <option value="">Select worker</option>
          {workers.map(worker => (
            <option key={worker.id} value={worker.id}>
              {worker.name} - {worker.role}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Operation Type</Label>
          <select
            className="w-full p-2 border rounded-lg"
            value={formData.operationType}
            onChange={(e) => setFormData({ ...formData, operationType: e.target.value as any })}
          >
            <option value="sorting">Sorting</option>
            <option value="loading">Loading</option>
            <option value="grinding">Grinding</option>
            <option value="washing">Washing</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Rate (₦)</Label>
          <Input 
            type="number"
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Quantity *</Label>
          <Input 
            type="number"
            required
            value={formData.quantity || ''}
            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Payment Status</Label>
          <select
            className="w-full p-2 border rounded-lg"
            value={formData.isPaid ? 'paid' : 'pending'}
            onChange={(e) => setFormData({ ...formData, isPaid: e.target.value === 'paid' })}
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="teamSplit"
          checked={formData.isTeamSplit}
          onChange={(e) => setFormData({ ...formData, isTeamSplit: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="teamSplit" className="mb-0">Team Split</Label>
      </div>

      {formData.isTeamSplit && (
        <div className="space-y-2">
          <Label>Team Size</Label>
          <Input 
            type="number"
            min={1}
            value={formData.teamSize}
            onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || 1 })}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Period Start</Label>
          <Input 
            type="date"
            value={formData.periodStart}
            onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Period End</Label>
          <Input 
            type="date"
            value={formData.periodEnd}
            onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <p className="text-sm text-green-700">Wage Amount</p>
          <p className="text-xl font-bold text-green-800">₦{amount.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={!formData.workerId}
        >
          Record Wage
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
