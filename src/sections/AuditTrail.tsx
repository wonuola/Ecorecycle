// ============================================================================
// AUDIT TRAIL - Admin & Owner Only
// ============================================================================

import { useEffect, useState } from 'react';
import { db } from '@/services/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  History, 
  User, 
  Edit3, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Calendar,
  Filter
} from 'lucide-react';
import type { AuditLog } from '@/types';

export function AuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const auditLogs = await db.getAuditLogs();
    setLogs(auditLogs);
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedByUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterAction === 'all' || log.action === filterAction;
    
    return matchesSearch && matchesFilter;
  });

  const getActionIcon = (action: AuditLog['action']) => {
    switch (action) {
      case 'create':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'update':
        return <Edit3 className="w-4 h-4 text-blue-600" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'approve':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'reject':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <History className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionBadge = (action: AuditLog['action']) => {
    const styles = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      approve: 'bg-emerald-100 text-emerald-800',
      reject: 'bg-orange-100 text-orange-800',
      login: 'bg-purple-100 text-purple-800',
    };
    return styles[action] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <History className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Logs</p>
                <p className="text-xl font-bold">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Plus className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Created Today</p>
                <p className="text-xl font-bold">
                  {logs.filter(l => new Date(l.performedAt).toDateString() === new Date().toDateString() && l.action === 'create').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Edit3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Updated Today</p>
                <p className="text-xl font-bold">
                  {logs.filter(l => new Date(l.performedAt).toDateString() === new Date().toDateString() && l.action === 'update').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-xl font-bold">
                  {new Set(logs.map(l => l.performedBy)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search audit logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterAction === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterAction('all')}
          >
            All
          </Button>
          <Button
            variant={filterAction === 'create' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterAction('create')}
          >
            Create
          </Button>
          <Button
            variant={filterAction === 'update' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterAction('update')}
          >
            Update
          </Button>
          <Button
            variant={filterAction === 'delete' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterAction('delete')}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(log.performedAt).toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium">
                            {log.performedByUser?.name || log.performedBy}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionBadge(log.action)}>
                          <span className="flex items-center gap-1">
                            {getActionIcon(log.action)}
                            <span className="capitalize">{log.action}</span>
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">{log.entityType}</span>
                        <span className="text-xs text-gray-400 block">ID: {log.entityId.slice(0, 8)}...</span>
                      </TableCell>
                      <TableCell>
                        {log.fieldName && (
                          <div className="text-sm">
                            <span className="text-gray-500">Field:</span> {log.fieldName}
                          </div>
                        )}
                        {log.oldValue && (
                          <div className="text-xs text-red-600 line-through">
                            {log.oldValue.slice(0, 50)}{log.oldValue.length > 50 ? '...' : ''}
                          </div>
                        )}
                        {log.newValue && (
                          <div className="text-xs text-green-600">
                            {log.newValue.slice(0, 50)}{log.newValue.length > 50 ? '...' : ''}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.reason ? (
                          <span className="text-sm text-gray-600">{log.reason}</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
