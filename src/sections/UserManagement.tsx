// ============================================================================
// USER MANAGEMENT - Admin & Owner Only
// ============================================================================

import { useEffect, useState } from 'react';
import { db } from '@/services/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Users, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Key
} from 'lucide-react';
import type { User as UserType, UserRole } from '@/types';

const ROLES: { key: UserRole; label: string; description: string; color: string }[] = [
  { key: 'admin', label: 'Admin', description: 'Full system access', color: 'bg-red-100 text-red-800' },
  { key: 'owner', label: 'Owner', description: 'Business owner access', color: 'bg-purple-100 text-purple-800' },
  { key: 'procurement', label: 'Procurement', description: 'Purchase management', color: 'bg-blue-100 text-blue-800' },
  { key: 'warehouse_officer', label: 'Warehouse', description: 'Inventory control', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'sorting_supervisor', label: 'Sorting', description: 'Sorting operations', color: 'bg-green-100 text-green-800' },
  { key: 'production_supervisor', label: 'Production', description: 'Production tracking', color: 'bg-cyan-100 text-cyan-800' },
  { key: 'logistics_officer', label: 'Logistics', description: 'Trip management', color: 'bg-orange-100 text-orange-800' },
  { key: 'finance', label: 'Finance', description: 'Financial reports', color: 'bg-emerald-100 text-emerald-800' },
  { key: 'auditor', label: 'Auditor', description: 'Read-only access', color: 'bg-gray-100 text-gray-800' },
];

export function UserManagement() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const usersData = await db.getUsers();
    setUsers(usersData);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUsers = filteredUsers.filter(u => u.isActive);
  const inactiveUsers = filteredUsers.filter(u => !u.isActive);

  const handleCreateUser = async (userData: any) => {
    await db.createUser(userData);
    setShowCreateForm(false);
    loadUsers();
  };

  const handleUpdateUser = async (userId: string, updates: Partial<UserType>) => {
    await db.updateUser(userId, updates);
    setEditingUser(null);
    loadUsers();
  };

  const handleToggleActive = async (user: UserType) => {
    await db.updateUser(user.id, { isActive: !user.isActive });
    loadUsers();
  };

  const getRoleBadge = (role: UserRole) => {
    const roleConfig = ROLES.find(r => r.key === role);
    return roleConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: UserRole) => {
    return ROLES.find(r => r.key === role)?.label || role;
  };

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
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-xl font-bold">{users.length}</p>
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
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-xl font-bold">{activeUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Inactive</p>
                <p className="text-xl font-bold">{inactiveUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Roles</p>
                <p className="text-xl font-bold">{ROLES.length}</p>
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
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <UserForm 
              onSubmit={handleCreateUser}
              onCancel={() => setShowCreateForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            System Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadge(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" /> Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            <XCircle className="w-3 h-3 mr-1" /> Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <span className="text-sm text-gray-600">
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(user)}
                            className={user.isActive ? 'text-red-600' : 'text-green-600'}
                          >
                            {user.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Reference Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-500" />
            Role Permissions Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES.map((role) => (
              <div key={role.key} className={`p-4 rounded-lg ${role.color}`}>
                <p className="font-semibold">{role.label}</p>
                <p className="text-sm opacity-75">{role.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <UserForm 
              user={editingUser}
              onSubmit={(data) => handleUpdateUser(editingUser.id, data)}
              onCancel={() => setEditingUser(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserForm({ 
  user, 
  onSubmit, 
  onCancel 
}: { 
  user?: UserType; 
  onSubmit: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'procurement' as UserRole,
    isActive: user?.isActive ?? true,
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Full Name *</Label>
        <Input 
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="John Doe"
        />
      </div>

      <div className="space-y-2">
        <Label>Email Address *</Label>
        <Input 
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="john@company.com"
        />
      </div>

      <div className="space-y-2">
        <Label>Phone Number</Label>
        <Input 
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="08012345678"
        />
      </div>

      {!user && (
        <div className="space-y-2">
          <Label>Password *</Label>
          <Input 
            type="password"
            required={!user}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Set initial password"
          />
          <p className="text-xs text-gray-500">User can change this after first login</p>
        </div>
      )}

      <div className="space-y-2">
        <Label>Role *</Label>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((role) => (
            <button
              key={role.key}
              type="button"
              onClick={() => setFormData({ ...formData, role: role.key })}
              className={`p-3 rounded-lg border text-left transition-colors ${
                formData.role === role.key
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <p className="font-medium text-sm">{role.label}</p>
              <p className="text-xs opacity-75">{role.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="isActive" className="mb-0">Active User</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
          {user ? 'Update User' : 'Create User'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
