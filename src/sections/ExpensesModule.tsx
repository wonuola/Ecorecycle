// ============================================================================
// EXPENSES MODULE - Quick Entry with Allocation
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
  Receipt, 
  Banknote, 
  Wrench,
  Fuel,
  Truck,
  Package,
  Beaker,
  Zap,
  Users,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import type { Expense, ExpenseCategory, Batch } from '@/types';

const EXPENSE_CATEGORIES: { key: ExpenseCategory; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'labour', label: 'Labour', icon: Users, color: 'bg-blue-100 text-blue-800' },
  { key: 'diesel', label: 'Diesel', icon: Fuel, color: 'bg-orange-100 text-orange-800' },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'bg-red-100 text-red-800' },
  { key: 'logistics', label: 'Logistics', icon: Truck, color: 'bg-purple-100 text-purple-800' },
  { key: 'handling', label: 'Handling', icon: Package, color: 'bg-yellow-100 text-yellow-800' },
  { key: 'packaging', label: 'Packaging', icon: Package, color: 'bg-pink-100 text-pink-800' },
  { key: 'chemicals', label: 'Chemicals', icon: Beaker, color: 'bg-cyan-100 text-cyan-800' },
  { key: 'power', label: 'Power', icon: Zap, color: 'bg-green-100 text-green-800' },
  { key: 'admin', label: 'Admin', icon: FileText, color: 'bg-gray-100 text-gray-800' },
  { key: 'other', label: 'Other', icon: Receipt, color: 'bg-slate-100 text-slate-800' },
];

export function ExpensesModule() {
  const { hasPermission } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [expensesData, batchesData] = await Promise.all([
      db.getExpenses(),
      db.getBatches(),
    ]);
    setExpenses(expensesData);
    setBatches(batchesData);
    setLoading(false);
  };

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats by category
  const expensesByCategory = EXPENSE_CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.key).reduce((sum, e) => sum + e.amount, 0),
    count: expenses.filter(e => e.category === cat.key).length,
  }));

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenses = expenses.filter(e => e.isPaid).reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => !e.isPaid).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-xl font-bold">{expenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-xl font-bold">₦{(totalExpenses / 1000).toFixed(0)}k</p>
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
                <p className="text-sm text-gray-500">Paid</p>
                <p className="text-xl font-bold">₦{(paidExpenses / 1000).toFixed(0)}k</p>
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
                <p className="text-xl font-bold">₦{(pendingExpenses / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Expenses by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {expensesByCategory.map(cat => (
              <div key={cat.key} className={`${cat.color} rounded-lg p-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <cat.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{cat.label}</span>
                </div>
                <p className="text-lg font-bold">₦{(cat.total / 1000).toFixed(0)}k</p>
                <p className="text-xs opacity-75">{cat.count} entries</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasPermission('create_expense') && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record New Expense</DialogTitle>
              </DialogHeader>
              <ExpenseForm 
                batches={batches}
                onSubmit={async (data) => {
                  await db.createExpense(data);
                  setShowForm(false);
                  loadData();
                }}
                onCancel={() => setShowForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Expenses Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Allocation</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => {
                const category = EXPENSE_CATEGORIES.find(c => c.key === expense.category);
                return (
                  <TableRow key={expense.id}>
                    <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={category?.color || 'bg-gray-100'}>
                        {category?.icon && <category.icon className="w-3 h-3 mr-1" />}
                        {category?.label || expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                    <TableCell className="font-medium">₦{expense.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm capitalize">
                      {expense.allocatedTo || 'Unallocated'}
                      {expense.batchId && ' (Batch)'}
                    </TableCell>
                    <TableCell>
                      {expense.isPaid ? (
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
                );
              })}
            </TableBody>
          </Table>
        </div>
        {filteredExpenses.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No expenses found
          </div>
        )}
      </Card>
    </div>
  );
}

function ExpenseForm({ 
  batches, 
  onSubmit, 
  onCancel 
}: { 
  batches: Batch[]; 
  onSubmit: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    category: 'maintenance' as ExpenseCategory,
    amount: 0,
    description: '',
    receiptPhoto: '',
    allocatedTo: '' as 'batch' | 'department' | 'shift' | '',
    batchId: '',
    department: '',
    shiftDate: '',
    isPaid: true,
    expenseDate: new Date().toISOString().slice(0, 10),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      approvedBy: 'system',
      approvedAt: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Category *</Label>
        <div className="grid grid-cols-2 gap-2">
          {EXPENSE_CATEGORIES.map(cat => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.key })}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                formData.category === cat.key
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              <span className="text-sm">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Amount (₦) *</Label>
        <Input 
          type="number"
          required
          min={0}
          value={formData.amount || ''}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="space-y-2">
        <Label>Description *</Label>
        <Input 
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="e.g., Grinder blade replacement"
        />
      </div>

      <div className="space-y-2">
        <Label>Expense Date *</Label>
        <Input 
          type="date"
          required
          value={formData.expenseDate}
          onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Allocation</Label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: '', label: 'None' },
            { key: 'batch', label: 'Batch' },
            { key: 'department', label: 'Department' },
            { key: 'shift', label: 'Shift' },
          ].map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFormData({ ...formData, allocatedTo: opt.key as any })}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                formData.allocatedTo === opt.key
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : 'bg-gray-100 border-gray-300 text-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {formData.allocatedTo === 'batch' && (
        <div className="space-y-2">
          <Label>Select Batch</Label>
          <select
            className="w-full p-2 border rounded-lg"
            value={formData.batchId}
            onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
          >
            <option value="">Select batch</option>
            {batches.map(batch => (
              <option key={batch.id} value={batch.id}>
                {batch.batchNumber}
              </option>
            ))}
          </select>
        </div>
      )}

      {formData.allocatedTo === 'department' && (
        <div className="space-y-2">
          <Label>Department</Label>
          <Input 
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="e.g., Production, Logistics"
          />
        </div>
      )}

      {formData.allocatedTo === 'shift' && (
        <div className="space-y-2">
          <Label>Shift Date</Label>
          <Input 
            type="date"
            value={formData.shiftDate}
            onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Payment Status</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isPaid: true })}
            className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
              formData.isPaid
                ? 'bg-green-100 border-green-500 text-green-700'
                : 'bg-gray-100 border-gray-300 text-gray-600'
            }`}
          >
            <CheckCircle className="w-4 h-4 inline mr-1" /> Paid
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isPaid: false })}
            className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
              !formData.isPaid
                ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                : 'bg-gray-100 border-gray-300 text-gray-600'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-1" /> Pending
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={!formData.description || formData.amount <= 0}
        >
          Record Expense
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
