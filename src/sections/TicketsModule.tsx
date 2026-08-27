// ============================================================================
// TICKETS MODULE - Production Problem Solving
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Ticket, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  User as UserIcon,
  Calendar,
  MessageSquare,
  Wrench,
  Factory,
  TrendingUp,
  Filter,
  ArrowRight
} from 'lucide-react';
import type { Ticket as TicketType, User, Batch } from '@/types';

const PRIORITIES = [
  { key: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { key: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { key: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
];

const CATEGORIES = [
  { key: 'equipment_failure', label: 'Equipment Failure' },
  { key: 'quality_issue', label: 'Quality Issue' },
  { key: 'safety_concern', label: 'Safety Concern' },
  { key: 'process_delay', label: 'Process Delay' },
  { key: 'material_shortage', label: 'Material Shortage' },
  { key: 'power_outage', label: 'Power Outage' },
  { key: 'maintenance', label: 'Maintenance Required' },
  { key: 'other', label: 'Other' },
];

export function TicketsModule() {
  const { user, hasPermission } = useAuth();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [ticketsData, usersData, batchesData] = await Promise.all([
      db.getTickets(),
      db.getUsers(),
      db.getBatches(),
    ]);
    setTickets(ticketsData);
    setUsers(usersData);
    setBatches(batchesData);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const openTickets = filteredTickets.filter(t => t.status === 'open');
  const inProgressTickets = filteredTickets.filter(t => t.status === 'in_progress');
  const resolvedTickets = filteredTickets.filter(t => t.status === 'resolved');
  const closedTickets = filteredTickets.filter(t => t.status === 'closed');

  const handleCreateTicket = async (ticketData: any) => {
    await db.createTicket({
      ...ticketData,
      createdBy: user?.id || '',
    });
    setShowForm(false);
    loadData();
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: TicketType['status']) => {
    await db.updateTicketStatus(ticketId, newStatus, user?.id || '');
    loadData();
    if (selectedTicket?.id === ticketId) {
      const updated = await db.getTicketById(ticketId);
      setSelectedTicket(updated || null);
    }
  };

  const handleAddComment = async (ticketId: string, comment: string) => {
    await db.addTicketComment(ticketId, {
      text: comment,
      userId: user?.id || '',
      timestamp: new Date().toISOString(),
    });
    loadData();
    const updated = await db.getTicketById(ticketId);
    setSelectedTicket(updated || null);
  };

  const getStatusBadge = (status: TicketType['status']) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" /> Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" /> Closed</Badge>;
    }
  };

  const getPriorityBadge = (priority: TicketType['priority']) => {
    const config = PRIORITIES.find(p => p.key === priority);
    return <Badge className={config?.color || 'bg-gray-100'}>{config?.label || priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Ticket className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold">{tickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Open</p>
                <p className="text-xl font-bold">{openTickets.length}</p>
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
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-xl font-bold">{inProgressTickets.length}</p>
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
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-xl font-bold">{resolvedTickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wrench className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Resolution</p>
                <p className="text-xl font-bold">
                  {tickets.filter(t => t.resolvedAt).length > 0 
                    ? Math.round(tickets.filter(t => t.resolvedAt).reduce((sum, t) => {
                        const created = new Date(t.createdAt).getTime();
                        const resolved = new Date(t.resolvedAt!).getTime();
                        return sum + (resolved - created) / (1000 * 60 * 60);
                      }, 0) / tickets.filter(t => t.resolvedAt).length) + 'h'
                    : 'N/A'}
                </p>
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
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-3 py-2 border rounded-lg text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          {hasPermission('create_ticket') && (
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Ticket</DialogTitle>
                </DialogHeader>
                <TicketForm 
                  users={users}
                  batches={batches}
                  onSubmit={handleCreateTicket}
                  onCancel={() => setShowForm(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Tickets Tabs */}
      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({filteredTickets.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({openTickets.length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({inProgressTickets.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedTickets.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closedTickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <TicketsTable 
            tickets={filteredTickets}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            onSelect={setSelectedTicket}
          />
        </TabsContent>
        <TabsContent value="open" className="mt-4">
          <TicketsTable 
            tickets={openTickets}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            onSelect={setSelectedTicket}
          />
        </TabsContent>
        <TabsContent value="in_progress" className="mt-4">
          <TicketsTable 
            tickets={inProgressTickets}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            onSelect={setSelectedTicket}
          />
        </TabsContent>
        <TabsContent value="resolved" className="mt-4">
          <TicketsTable 
            tickets={resolvedTickets}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            onSelect={setSelectedTicket}
          />
        </TabsContent>
        <TabsContent value="closed" className="mt-4">
          <TicketsTable 
            tickets={closedTickets}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            onSelect={setSelectedTicket}
          />
        </TabsContent>
      </Tabs>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <TicketDetail 
              ticket={selectedTicket}
              users={users}
              batches={batches}
              onUpdateStatus={handleUpdateStatus}
              onAddComment={handleAddComment}
              currentUser={user}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TicketsTable({ 
  tickets, 
  getStatusBadge,
  getPriorityBadge,
  onSelect 
}: { 
  tickets: TicketType[]; 
  getStatusBadge: (status: TicketType['status']) => React.ReactNode;
  getPriorityBadge: (priority: TicketType['priority']) => React.ReactNode;
  onSelect: (ticket: TicketType) => void;
}) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket #</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No tickets found
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow 
                  key={ticket.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onSelect(ticket)}
                >
                  <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
                  <TableCell className="max-w-xs truncate">{ticket.title}</TableCell>
                  <TableCell className="capitalize">{ticket.category.replace(/_/g, ' ')}</TableCell>
                  <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell>{ticket.assignedToUser?.name || 'Unassigned'}</TableCell>
                  <TableCell className="text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function TicketDetail({ 
  ticket, 
  users, 
  batches,
  onUpdateStatus,
  onAddComment,
  currentUser
}: { 
  ticket: TicketType;
  users: User[];
  batches: Batch[];
  onUpdateStatus: (id: string, status: TicketType['status']) => void;
  onAddComment: (id: string, comment: string) => void;
  currentUser: User | null;
}) {
  const [newComment, setNewComment] = useState('');
  const linkedBatch = batches.find(b => b.id === ticket.linkedBatchId);

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(ticket.id, newComment);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-500">{ticket.ticketNumber}</span>
            {ticket.priority === 'critical' && (
              <Badge className="bg-red-100 text-red-800">
                <AlertTriangle className="w-3 h-3 mr-1" /> Critical
              </Badge>
            )}
          </div>
          <h3 className="text-xl font-semibold">{ticket.title}</h3>
        </div>
        <div className="flex gap-2">
          {ticket.status === 'open' && (
            <Button size="sm" onClick={() => onUpdateStatus(ticket.id, 'in_progress')}>
              <Clock className="w-4 h-4 mr-1" /> Start Work
            </Button>
          )}
          {ticket.status === 'in_progress' && (
            <Button size="sm" className="bg-green-600" onClick={() => onUpdateStatus(ticket.id, 'resolved')}>
              <CheckCircle className="w-4 h-4 mr-1" /> Mark Resolved
            </Button>
          )}
          {ticket.status === 'resolved' && (
            <Button size="sm" variant="outline" onClick={() => onUpdateStatus(ticket.id, 'closed')}>
              <XCircle className="w-4 h-4 mr-1" /> Close Ticket
            </Button>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Category</p>
          <p className="font-medium capitalize">{ticket.category.replace(/_/g, ' ')}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Priority</p>
          <p className="font-medium capitalize">{ticket.priority}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Status</p>
          <p className="font-medium capitalize">{ticket.status.replace(/_/g, ' ')}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Assigned To</p>
          <p className="font-medium">{ticket.assignedToUser?.name || 'Unassigned'}</p>
        </div>
      </div>

      {/* Linked Batch */}
      {linkedBatch && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-600 mb-1">Linked Batch</p>
          <p className="font-medium">{linkedBatch.batchNumber}</p>
          <p className="text-sm text-blue-500">{linkedBatch.currentState.replace(/_/g, ' ')}</p>
        </div>
      )}

      {/* Description */}
      <div>
        <h4 className="font-medium mb-2">Description</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
        </div>
      </div>

      {/* Resolution */}
      {ticket.resolution && (
        <div>
          <h4 className="font-medium mb-2 text-green-700">Resolution</h4>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.resolution}</p>
            {ticket.resolvedAt && (
              <p className="text-sm text-green-600 mt-2">
                Resolved on {new Date(ticket.resolvedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Comments */}
      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Comments ({ticket.comments?.length || 0})
        </h4>
        
        <div className="space-y-3 mb-4">
          {ticket.comments?.map((comment, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{comment.userName}</span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700 text-sm">{comment.text}</p>
            </div>
          ))}
          {(!ticket.comments || ticket.comments.length === 0) && (
            <p className="text-gray-400 text-sm italic">No comments yet</p>
          )}
        </div>

        {/* Add Comment */}
        {ticket.status !== 'closed' && (
          <div className="flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
            />
            <Button onClick={handleSubmitComment}>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Created/Updated Info */}
      <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">
        <p>Created by {ticket.createdByUser?.name} on {new Date(ticket.createdAt).toLocaleString()}</p>
        {ticket.updatedAt && (
          <p>Last updated: {new Date(ticket.updatedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}

function TicketForm({ 
  users, 
  batches,
  onSubmit, 
  onCancel 
}: { 
  users: User[]; 
  batches: Batch[];
  onSubmit: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'equipment_failure' as TicketType['category'],
    priority: 'medium' as TicketType['priority'],
    assignedTo: '',
    linkedBatchId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input 
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Brief description of the problem"
        />
      </div>

      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea 
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description of the issue..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category *</Label>
          <select
            required
            className="w-full p-2 border rounded-lg"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
          >
            {CATEGORIES.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Priority *</Label>
          <select
            required
            className="w-full p-2 border rounded-lg"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
          >
            {PRIORITIES.map(pri => (
              <option key={pri.key} value={pri.key}>{pri.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Assign To</Label>
        <select
          className="w-full p-2 border rounded-lg"
          value={formData.assignedTo}
          onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
        >
          <option value="">Select user (optional)</option>
          {users.filter(u => u.isActive).map(user => (
            <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Link to Batch (Optional)</Label>
        <select
          className="w-full p-2 border rounded-lg"
          value={formData.linkedBatchId}
          onChange={(e) => setFormData({ ...formData, linkedBatchId: e.target.value })}
        >
          <option value="">Select batch</option>
          {batches.map(batch => (
            <option key={batch.id} value={batch.id}>{batch.batchNumber}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
          Create Ticket
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
