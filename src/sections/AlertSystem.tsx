// ============================================================================
// AUTOMATED ALERTS SYSTEM
// Email/SMS config, threshold triggers, alert history, recipient management
// ============================================================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import {
  Bell, Mail, MessageSquare, AlertTriangle, CheckCircle, Clock,
  Users, Settings, Send, AlertOctagon
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface AlertRule {
  id: string;
  name: string;
  eventType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  channel: 'email' | 'sms' | 'in_app' | 'all';
  recipients: string[];
  isEnabled: boolean;
  threshold?: number;
  unit?: string;
  description: string;
  actionDescription: string;
  requiresAcknowledgment: boolean;
}

interface AlertLog {
  id: string;
  ruleName: string;
  severity: string;
  message: string;
  channel: string;
  recipients: string[];
  sentAt: string;
  status: 'sent' | 'failed' | 'pending';
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

interface AlertRecipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  channels: ('email' | 'sms')[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_RULES: AlertRule[] = [
  { id: 'r1', name: 'Critical Reconciliation Gap', eventType: 'gap_critical', severity: 'critical', channel: 'all', recipients: ['owner', 'factory_manager'], isEnabled: true, threshold: 10, unit: '%', description: 'Any stage gap exceeding 10%', actionDescription: 'Owner & Factory Manager must investigate immediately', requiresAcknowledgment: true },
  { id: 'r2', name: 'High Loss Warning', eventType: 'loss_high', severity: 'high', channel: 'all', recipients: ['factory_manager', 'supervisor'], isEnabled: true, threshold: 5, unit: '%', description: 'Loss rate above 5% in any stage', actionDescription: 'Production supervisor to review process', requiresAcknowledgment: true },
  { id: 'r3', name: 'Batch Ready to Close', eventType: 'batch_full', severity: 'medium', channel: 'in_app', recipients: ['supervisor', 'production'], isEnabled: true, description: 'Batch reaches target weight', actionDescription: 'Close batch and start next', requiresAcknowledgment: false },
  { id: 'r4', name: 'Quality Check Fail', eventType: 'quality_fail', severity: 'critical', channel: 'all', recipients: ['owner', 'factory_manager', 'supervisor'], isEnabled: true, description: 'GRN quality check failed', actionDescription: 'Quarantine material and investigate vendor', requiresAcknowledgment: true },
  { id: 'r5', name: 'Worker Absent (Multiple)', eventType: 'attendance_low', severity: 'medium', channel: 'sms', recipients: ['supervisor'], isEnabled: true, threshold: 3, unit: 'workers', description: 'More than 3 workers absent', actionDescription: 'Arrange replacement workers', requiresAcknowledgment: false },
  { id: 'r6', name: 'Equipment Downtime > 30min', eventType: 'downtime_extended', severity: 'high', channel: 'sms', recipients: ['factory_manager', 'maintenance'], isEnabled: true, threshold: 30, unit: 'minutes', description: 'Equipment down longer than 30 minutes', actionDescription: 'Escalate to maintenance team', requiresAcknowledgment: true },
  { id: 'r7', name: 'Daily Summary', eventType: 'daily_summary', severity: 'low', channel: 'email', recipients: ['owner', 'factory_manager'], isEnabled: true, description: 'Daily production summary', actionDescription: 'Review daily report', requiresAcknowledgment: false },
  { id: 'r8', name: 'Integrity Score Below 70', eventType: 'integrity_low', severity: 'high', channel: 'all', recipients: ['owner', 'factory_manager'], isEnabled: true, threshold: 70, unit: 'score', description: 'Batch integrity score below 70', actionDescription: 'Dispatch blocked — full review required', requiresAcknowledgment: true },
];

const MOCK_LOGS: AlertLog[] = [
  { id: 'l1', ruleName: 'Critical Reconciliation Gap', severity: 'critical', message: 'Grinding gap 12.5% in batch B-PET-2025-001', channel: 'all', recipients: ['owner@ecorecycle.com', '+2348012345678'], sentAt: '2025-07-07T14:30:00Z', status: 'sent', acknowledged: true, acknowledgedBy: 'Owner', acknowledgedAt: '2025-07-07T15:00:00Z' },
  { id: 'l2', ruleName: 'Quality Check Fail', severity: 'critical', message: 'GRN-2025-003 moisture 8.5% exceeds limit', channel: 'all', recipients: ['owner@ecorecycle.com', 'manager@ecorecycle.com'], sentAt: '2025-07-06T09:15:00Z', status: 'sent', acknowledged: true, acknowledgedBy: 'Factory Manager', acknowledgedAt: '2025-07-06T10:00:00Z' },
  { id: 'l3', ruleName: 'High Loss Warning', severity: 'high', message: 'Washing loss 6.2% — above threshold', channel: 'sms', recipients: ['+2348087654321'], sentAt: '2025-07-05T16:45:00Z', status: 'sent', acknowledged: false },
  { id: 'l4', ruleName: 'Batch Ready to Close', severity: 'medium', message: 'B-HDPE-2025-001 reached 3,000kg target', channel: 'in_app', recipients: ['supervisor'], sentAt: '2025-07-05T11:00:00Z', status: 'sent', acknowledged: true, acknowledgedBy: 'Supervisor', acknowledgedAt: '2025-07-05T11:30:00Z' },
  { id: 'l5', ruleName: 'Daily Summary', severity: 'low', message: 'Daily production: 5,200kg | Loss: 4.1% | 14 workers present', channel: 'email', recipients: ['owner@ecorecycle.com'], sentAt: '2025-07-05T18:00:00Z', status: 'sent', acknowledged: false },
];

const MOCK_RECIPIENTS: AlertRecipient[] = [
  { id: 'u1', name: 'Owner', email: 'owner@ecorecycle.com', phone: '+2348012345678', role: 'Owner', channels: ['email', 'sms'] },
  { id: 'u2', name: 'Factory Manager', email: 'manager@ecorecycle.com', phone: '+2348087654321', role: 'Factory Manager', channels: ['email', 'sms'] },
  { id: 'u3', name: 'Production Supervisor', email: 'supervisor@ecorecycle.com', phone: '+2348098765432', role: 'Supervisor', channels: ['sms'] },
  { id: 'u4', name: 'Maintenance Lead', email: 'maintenance@ecorecycle.com', phone: '+2348076543210', role: 'Maintenance', channels: ['sms'] },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AlertSystem() {
  const [activeTab, setActiveTab] = useState('rules');
  const [rules, setRules] = useState(MOCK_RULES);
  const { canDelete } = useAuth();
  const isOwner = canDelete();

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
  };

  const pendingAck = MOCK_LOGS.filter(l => !l.acknowledged && l.severity !== 'low');
  const sentToday = MOCK_LOGS.filter(l => l.sentAt.startsWith('2025-07-08')).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alerts & Notifications</h2>
          <p className="text-sm text-gray-500">Event-driven alerts, escalation rules, and notification channels</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><Bell className="w-5 h-5 text-red-600" /><p className="text-sm text-gray-500">Pending Ack</p></div>
            <p className="text-2xl font-bold text-red-600">{pendingAck.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><Send className="w-5 h-5 text-blue-600" /><p className="text-sm text-gray-500">Sent Today</p></div>
            <p className="text-2xl font-bold">{sentToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><Settings className="w-5 h-5 text-green-600" /><p className="text-sm text-gray-500">Active Rules</p></div>
            <p className="text-2xl font-bold">{rules.filter(r => r.isEnabled).length} / {rules.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2"><Users className="w-5 h-5 text-purple-600" /><p className="text-sm text-gray-500">Recipients</p></div>
            <p className="text-2xl font-bold">{MOCK_RECIPIENTS.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules"><Settings className="w-4 h-4 mr-1" /> Alert Rules</TabsTrigger>
          <TabsTrigger value="logs"><Clock className="w-4 h-4 mr-1" /> Alert History</TabsTrigger>
          <TabsTrigger value="recipients"><Users className="w-4 h-4 mr-1" /> Recipients</TabsTrigger>
          <TabsTrigger value="config"><Mail className="w-4 h-4 mr-1" /> Email/SMS Config</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <RulesTab rules={rules} toggleRule={toggleRule} isOwner={isOwner} />
        </TabsContent>
        <TabsContent value="logs">
          <LogsTab logs={MOCK_LOGS} />
        </TabsContent>
        <TabsContent value="recipients">
          <RecipientsTab recipients={MOCK_RECIPIENTS} />
        </TabsContent>
        <TabsContent value="config">
          <ConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// RULES TAB
// ============================================================================

function RulesTab({ rules, toggleRule, isOwner }: { rules: AlertRule[]; toggleRule: (id: string) => void; isOwner: boolean }) {
  return (
    <div className="space-y-3">
      {rules.map(rule => (
        <Card key={rule.id} className={rule.isEnabled ? '' : 'opacity-60'}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{rule.name}</h3>
                  <SeverityBadge severity={rule.severity} />
                  <ChannelBadge channel={rule.channel} />
                  {rule.requiresAcknowledgment && <Badge className="bg-orange-100 text-orange-800">Ack Required</Badge>}
                </div>
                <p className="text-sm text-gray-500">{rule.description}</p>
                <p className="text-sm text-gray-600 mt-1"><strong>Action:</strong> {rule.actionDescription}</p>
                {rule.threshold && (
                  <p className="text-xs text-gray-400 mt-1">Threshold: {rule.threshold}{rule.unit}</p>
                )}
                <div className="flex gap-1 mt-2 flex-wrap">
                  {rule.recipients.map(r => <Badge key={r} variant="outline" className="text-xs">{r.replace(/_/g, ' ')}</Badge>)}
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <Switch checked={rule.isEnabled} onCheckedChange={() => isOwner && toggleRule(rule.id)} disabled={!isOwner} />
                <span className={`text-xs font-medium ${rule.isEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                  {rule.isEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// LOGS TAB
// ============================================================================

function LogsTab({ logs }: { logs: AlertLog[] }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-lg">Alert History</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2">Rule</th><th className="text-left">Message</th><th className="text-center">Severity</th><th className="text-center">Channel</th><th className="text-center">Acknowledged</th><th className="text-left">Sent At</th></tr></thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-medium">{l.ruleName}</td>
                  <td className="max-w-xs truncate">{l.message}</td>
                  <td className="text-center"><SeverityBadge severity={l.severity as any} /></td>
                  <td className="text-center"><ChannelBadge channel={l.channel as any} /></td>
                  <td className="text-center">
                    {l.acknowledged ? (
                      <span className="text-xs text-green-600 flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> {l.acknowledgedBy}</span>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>
                    )}
                  </td>
                  <td className="text-xs">{new Date(l.sentAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// RECIPIENTS TAB
// ============================================================================

function RecipientsTab({ recipients }: { recipients: AlertRecipient[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Alert Recipients</CardTitle>
        <Button size="sm" className="bg-green-600 hover:bg-green-700"><Users className="w-4 h-4 mr-1" /> Add Recipient</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2">Name</th><th className="text-left">Role</th><th className="text-left">Email</th><th className="text-left">Phone</th><th className="text-center">Channels</th></tr></thead>
            <tbody>
              {recipients.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-medium">{r.name}</td>
                  <td>{r.role}</td>
                  <td className="text-xs">{r.email || '-'}</td>
                  <td className="text-xs">{r.phone || '-'}</td>
                  <td className="text-center">
                    <div className="flex gap-1 justify-center">
                      {r.channels.includes('email') && <Mail className="w-4 h-4 text-blue-500" />}
                      {r.channels.includes('sms') && <MessageSquare className="w-4 h-4 text-green-500" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CONFIG TAB
// ============================================================================

function ConfigTab() {
  const [emailConfig, setEmailConfig] = useState({ smtpHost: 'smtp.gmail.com', smtpPort: '587', smtpUser: '', smtpPass: '', fromEmail: 'alerts@ecorecycle.com' });
  const [smsConfig, setSmsConfig] = useState({ provider: 'twilio', apiKey: '', senderId: 'EcoRecycle' });

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Mail className="w-5 h-5" /> Email Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>SMTP Host</Label><Input value={emailConfig.smtpHost} onChange={e => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Port</Label><Input value={emailConfig.smtpPort} onChange={e => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })} className="mt-1" /></div>
            <div><Label>From Email</Label><Input value={emailConfig.fromEmail} onChange={e => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })} className="mt-1" /></div>
          </div>
          <div><Label>SMTP Username</Label><Input value={emailConfig.smtpUser} onChange={e => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })} placeholder="your-email@gmail.com" className="mt-1" /></div>
          <div><Label>SMTP Password</Label><Input type="password" value={emailConfig.smtpPass} onChange={e => setEmailConfig({ ...emailConfig, smtpPass: e.target.value })} placeholder="App password" className="mt-1" /></div>
          <Button className="w-full bg-green-600 hover:bg-green-700"><Send className="w-4 h-4 mr-2" /> Test & Save</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5" /> SMS Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>SMS Provider</Label>
            <select className="w-full mt-1 p-2 border rounded-md text-sm" value={smsConfig.provider} onChange={e => setSmsConfig({ ...smsConfig, provider: e.target.value })}>
              <option value="twilio">Twilio</option>
              <option value="africastalking">Africa's Talking</option>
              <option value="termii">Termii</option>
              <option value="bulksms">BulkSMS Nigeria</option>
            </select>
          </div>
          <div><Label>API Key</Label><Input type="password" value={smsConfig.apiKey} onChange={e => setSmsConfig({ ...smsConfig, apiKey: e.target.value })} placeholder="Enter API key" className="mt-1" /></div>
          <div><Label>Sender ID</Label><Input value={smsConfig.senderId} onChange={e => setSmsConfig({ ...smsConfig, senderId: e.target.value })} placeholder="EcoRecycle" className="mt-1" /></div>
          <Button className="w-full bg-green-600 hover:bg-green-700"><Send className="w-4 h-4 mr-2" /> Test & Save</Button>
          <p className="text-xs text-gray-500">Nigeria: Recommended — Africa's Talking, Termii, or BulkSMS Nigeria</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// BADGES
// ============================================================================

function SeverityBadge({ severity }: { severity: AlertRule['severity'] | string }) {
  const colors = { critical: 'bg-red-100 text-red-800', high: 'bg-orange-100 text-orange-800', medium: 'bg-yellow-100 text-yellow-800', low: 'bg-blue-100 text-blue-800' };
  return <Badge className={colors[severity as keyof typeof colors] || colors.low}>{severity.toUpperCase()}</Badge>;
}

function ChannelBadge({ channel }: { channel: AlertRule['channel'] | string }) {
  const colors = { email: 'bg-blue-100 text-blue-800', sms: 'bg-green-100 text-green-800', in_app: 'bg-purple-100 text-purple-800', all: 'bg-gray-100 text-gray-800' };
  const labels = { email: 'Email', sms: 'SMS', in_app: 'In-App', all: 'All Channels' };
  return <Badge className={colors[channel as keyof typeof colors] || colors.all}>{labels[channel as keyof typeof labels] || channel}</Badge>;
}
