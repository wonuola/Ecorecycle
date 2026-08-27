// ============================================================================
// SHIFT SCHEDULING & WORKER ATTENDANCE
// Rosters, clock-in/out, attendance tracking, shift handover
// ============================================================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import {
  Clock, Users, CheckCircle, XCircle, Calendar, LogIn, LogOut,
  ClipboardList, Sun, Moon, Sunrise, UserPlus, UserMinus
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
  icon: React.ElementType;
}

interface WorkerAttendance {
  id: string;
  workerId: string;
  workerName: string;
  shiftId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: 'present' | 'absent' | 'late' | 'on_leave' | 'sick';
  hoursWorked: number;
  notes: string;
}

interface ShiftRoster {
  id: string;
  shiftId: string;
  date: string;
  workerIds: string[];
  supervisorId: string;
  supervisorName: string;
  handoverFrom?: string;
  handoverNotes?: string;
  productionTargetKg: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SHIFTS: Shift[] = [
  { id: 'morning', name: 'Morning', startTime: '06:00', endTime: '14:00', color: 'bg-yellow-100 text-yellow-800', icon: Sunrise },
  { id: 'afternoon', name: 'Afternoon', startTime: '14:00', endTime: '22:00', color: 'bg-orange-100 text-orange-800', icon: Sun },
  { id: 'night', name: 'Night', startTime: '22:00', endTime: '06:00', color: 'bg-indigo-100 text-indigo-800', icon: Moon },
];

const WORKERS = [
  { id: 'w1', name: 'Adebayo Oluwaseun', role: 'Sorter' },
  { id: 'w2', name: 'Chukwu Emeka', role: 'Grinder Operator' },
  { id: 'w3', name: 'Ibrahim Musa', role: 'Washer' },
  { id: 'w4', name: 'Okafor Chioma', role: 'Bagging Operator' },
  { id: 'w5', name: 'Fatima Bello', role: 'Sorter' },
  { id: 'w6', name: 'Obi Chinedu', role: 'Material Handler' },
  { id: 'w7', name: 'Yusuf Abdullahi', role: 'Sorter' },
  { id: 'w8', name: 'Nwosu Ifeanyi', role: 'Quality Checker' },
];

const TODAY = '2025-07-08';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_ATTENDANCE: WorkerAttendance[] = [
  { id: 'a1', workerId: 'w1', workerName: 'Adebayo Oluwaseun', shiftId: 'morning', date: TODAY, clockIn: '05:52', clockOut: null, status: 'present', hoursWorked: 5.5, notes: '' },
  { id: 'a2', workerId: 'w2', workerName: 'Chukwu Emeka', shiftId: 'morning', date: TODAY, clockIn: '06:05', clockOut: null, status: 'present', hoursWorked: 5.4, notes: '' },
  { id: 'a3', workerId: 'w3', workerName: 'Ibrahim Musa', shiftId: 'morning', date: TODAY, clockIn: '05:55', clockOut: null, status: 'present', hoursWorked: 5.5, notes: '' },
  { id: 'a4', workerId: 'w4', workerName: 'Okafor Chioma', shiftId: 'morning', date: TODAY, clockIn: '06:15', clockOut: null, status: 'late', hoursWorked: 5.2, notes: 'Arrived late due to transport' },
  { id: 'a5', workerId: 'w5', workerName: 'Fatima Bello', shiftId: 'morning', date: TODAY, clockIn: '05:58', clockOut: null, status: 'present', hoursWorked: 5.5, notes: '' },
  { id: 'a6', workerId: 'w6', workerName: 'Obi Chinedu', shiftId: 'morning', date: TODAY, clockIn: null, clockOut: null, status: 'absent', hoursWorked: 0, notes: 'Called in sick' },
  { id: 'a7', workerId: 'w7', workerName: 'Yusuf Abdullahi', shiftId: 'morning', date: TODAY, clockIn: '06:00', clockOut: null, status: 'present', hoursWorked: 5.5, notes: '' },
  { id: 'a8', workerId: 'w8', workerName: 'Nwosu Ifeanyi', shiftId: 'morning', date: TODAY, clockIn: null, clockOut: null, status: 'on_leave', hoursWorked: 0, notes: 'Approved leave' },
];

const MOCK_ROSTERS: ShiftRoster[] = [
  { id: 'r1', shiftId: 'morning', date: TODAY, workerIds: ['w1','w2','w3','w4','w5','w7'], supervisorId: 'w4', supervisorName: 'Okafor Chioma', productionTargetKg: 5000, handoverNotes: 'All machines operational. Grinder blade changed yesterday evening.' },
  { id: 'r2', shiftId: 'afternoon', date: TODAY, workerIds: ['w1','w2','w5','w6','w7','w8'], supervisorId: 'w8', supervisorName: 'Nwosu Ifeanyi', productionTargetKg: 4800, handoverNotes: '' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ShiftScheduling() {
  const [activeTab, setActiveTab] = useState('today');
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<WorkerAttendance[]>(MOCK_ATTENDANCE);
  const [selectedShift, setSelectedShift] = useState('morning');
  const [selectedDate, setSelectedDate] = useState(TODAY);

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const onLeaveCount = attendance.filter(a => a.status === 'on_leave' || a.status === 'sick').length;

  const currentRoster = MOCK_ROSTERS.find(r => r.shiftId === selectedShift && r.date === selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shift Management</h2>
          <p className="text-sm text-gray-500">Workforce scheduling, attendance tracking, and shift handover</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Calendar className="w-4 h-4 mr-2" /> Create Roster
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-500">Present</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-500">Absent</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-gray-500">Late</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-500">On Leave</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{onLeaveCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today"><Clock className="w-4 h-4 mr-1" /> Today's Attendance</TabsTrigger>
          <TabsTrigger value="roster"><Users className="w-4 h-4 mr-1" /> Shift Roster</TabsTrigger>
          <TabsTrigger value="clock"><LogIn className="w-4 h-4 mr-1" /> Clock In/Out</TabsTrigger>
          <TabsTrigger value="handover"><ClipboardList className="w-4 h-4 mr-1" /> Handover</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <AttendanceTab attendance={attendance} setAttendance={setAttendance} />
        </TabsContent>

        <TabsContent value="roster">
          <RosterTab />
        </TabsContent>

        <TabsContent value="clock">
          <ClockInOutTab />
        </TabsContent>

        <TabsContent value="handover">
          <HandoverTab rosters={MOCK_ROSTERS} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// ATTENDANCE TAB
// ============================================================================

function AttendanceTab({ attendance, setAttendance }: { attendance: WorkerAttendance[]; setAttendance: any }) {
  const updateStatus = (id: string, status: WorkerAttendance['status']) => {
    setAttendance((prev: WorkerAttendance[]) => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Today's Attendance</CardTitle>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800">{attendance.filter(a => a.status === 'present').length} Present</Badge>
          <Badge className="bg-red-100 text-red-800">{attendance.filter(a => a.status === 'absent').length} Absent</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b"><th className="text-left py-2">Worker</th><th className="text-left">Clock In</th><th className="text-left">Status</th><th className="text-right">Hours</th><th className="text-left">Notes</th><th className="text-left">Action</th></tr></thead>
            <tbody>
              {attendance.map(a => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-medium">{a.workerName}</td>
                  <td className={a.clockIn ? 'text-green-600 font-medium' : 'text-gray-400'}>{a.clockIn || '-'}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="text-right">{a.hoursWorked > 0 ? a.hoursWorked.toFixed(1) : '-'}</td>
                  <td className="text-sm text-gray-500">{a.notes || '-'}</td>
                  <td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(a.id, 'present')}><CheckCircle className="w-3 h-3 mr-1" /> Present</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(a.id, 'absent')}><XCircle className="w-3 h-3 mr-1" /> Absent</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(a.id, 'late')}><Clock className="w-3 h-3 mr-1" /> Late</Button>
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

function StatusBadge({ status }: { status: WorkerAttendance['status'] }) {
  const colors = {
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
    on_leave: 'bg-blue-100 text-blue-800',
    sick: 'bg-purple-100 text-purple-800',
  };
  const labels = { present: 'Present', absent: 'Absent', late: 'Late', on_leave: 'On Leave', sick: 'Sick' };
  return <Badge className={colors[status]}>{labels[status]}</Badge>;
}

// ============================================================================
// ROSTER TAB
// ============================================================================

function RosterTab() {
  return (
    <div className="space-y-4">
      {SHIFTS.map(shift => {
        const ShiftIcon = shift.icon;
        const roster = MOCK_ROSTERS.find(r => r.shiftId === shift.id && r.date === TODAY);
        const shiftWorkers = roster ? WORKERS.filter(w => roster.workerIds.includes(w.id)) : [];

        return (
          <Card key={shift.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${shift.color}`}>
                    <ShiftIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{shift.name} Shift ({shift.startTime} - {shift.endTime})</CardTitle>
                    <p className="text-xs text-gray-500">{roster ? `${shiftWorkers.length} workers assigned` : 'No roster created'}</p>
                  </div>
                </div>
                {roster && (
                  <div className="text-right">
                    <p className="text-sm font-medium">Target: {roster.productionTargetKg.toLocaleString()} kg</p>
                    <p className="text-xs text-gray-500">Supervisor: {roster.supervisorName}</p>
                  </div>
                )}
              </div>
            </CardHeader>
            {roster && (
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {shiftWorkers.map(w => (
                    <Badge key={w.id} variant="outline" className="px-3 py-1.5">
                      <Users className="w-3 h-3 mr-1 inline" />
                      {w.name} <span className="text-gray-400">({w.role})</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================================
// CLOCK IN/OUT TAB
// ============================================================================

function ClockInOutTab() {
  const [workerPin, setWorkerPin] = useState('');
  const [action, setAction] = useState<'in' | 'out'>('in');
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleClockAction = () => {
    if (!workerPin) return;
    setLastAction(`${action === 'in' ? 'Clocked IN' : 'Clocked OUT'} at ${new Date().toLocaleTimeString()}`);
    setWorkerPin('');
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Quick Clock In/Out</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={action === 'in' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setAction('in')}
            >
              <LogIn className="w-4 h-4 mr-2" /> Clock In
            </Button>
            <Button
              variant={action === 'out' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setAction('out')}
            >
              <LogOut className="w-4 h-4 mr-2" /> Clock Out
            </Button>
          </div>

          <div>
            <Label>Worker PIN / Name</Label>
            <Input
              value={workerPin}
              onChange={e => setWorkerPin(e.target.value)}
              placeholder="Enter PIN or scan ID card"
              className="mt-1 text-lg"
            />
          </div>

          <Button
            className={`w-full ${action === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            onClick={handleClockAction}
            disabled={!workerPin}
          >
            {action === 'in' ? <LogIn className="w-5 h-5 mr-2" /> : <LogOut className="w-5 h-5 mr-2" />}
            {action === 'in' ? 'Confirm Clock IN' : 'Confirm Clock OUT'}
          </Button>

          {lastAction && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-sm text-green-700 font-medium">{lastAction}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Today's Clock Events</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {MOCK_ATTENDANCE.filter(a => a.clockIn).map(a => (
              <div key={a.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${a.clockOut ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`} />
                  <span className="text-sm font-medium">{a.workerName}</span>
                </div>
                <div className="text-sm text-gray-500">
                  In: <span className="text-green-600 font-medium">{a.clockIn}</span>
                  {a.clockOut && <> • Out: <span className="text-blue-600 font-medium">{a.clockOut}</span></>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// HANDOVER TAB
// ============================================================================

function HandoverTab({ rosters }: { rosters: ShiftRoster[] }) {
  return (
    <div className="space-y-4">
      {rosters.map(roster => {
        const shift = SHIFTS.find(s => s.id === roster.shiftId);
        return (
          <Card key={roster.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{shift?.name} Shift — {roster.supervisorName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-500">Workers:</span> <strong>{roster.workerIds.length}</strong></div>
                <div><span className="text-gray-500">Target:</span> <strong>{roster.productionTargetKg.toLocaleString()} kg</strong></div>
                <div><span className="text-gray-500">Date:</span> <strong>{roster.date}</strong></div>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-1">Shift Notes / Handover:</p>
                <p className="text-sm text-yellow-700">{roster.handoverNotes || 'No handover notes recorded.'}</p>
              </div>
              <Button variant="outline" size="sm"><ClipboardList className="w-4 h-4 mr-1" /> Add Handover Notes</Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
