// ============================================================================
// REAL-TIME PRODUCTION MONITOR
// Live stage status, production rates, downtime tracking, shift performance
// ============================================================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity, Clock, TrendingUp, AlertTriangle, PauseCircle,
  PlayCircle, CheckCircle, Timer, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// STAGE STATUS
// ============================================================================

interface StageStatus {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'down' | 'maintenance' | 'complete';
  currentBatch: string;
  inputWeight: number;
  outputWeight: number;
  rateKgPerHour: number;
  targetRate: number;
  uptimePercent: number;
  downtimeMinutes: number;
  operatorName: string;
  startedAt: string;
  estimatedCompletion?: string;
}

interface DowntimeEvent {
  id: string;
  stage: string;
  reason: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
  reportedBy: string;
  resolvedBy?: string;
}

// ============================================================================
// MOCK LIVE DATA
// ============================================================================

const MOCK_STAGES: StageStatus[] = [
  {
    id: 'sorting', name: 'Sorting', status: 'running', currentBatch: 'B-PET-2025-002',
    inputWeight: 3200, outputWeight: 3180, rateKgPerHour: 450, targetRate: 500,
    uptimePercent: 92, downtimeMinutes: 45, operatorName: 'Adebayo Oluwaseun',
    startedAt: '2025-07-08T06:00:00Z', estimatedCompletion: '2025-07-08T14:00:00Z',
  },
  {
    id: 'grinding', name: 'Grinding', status: 'running', currentBatch: 'B-PET-2025-001',
    inputWeight: 4730, outputWeight: 4580, rateKgPerHour: 380, targetRate: 400,
    uptimePercent: 88, downtimeMinutes: 72, operatorName: 'Chukwu Emeka',
    startedAt: '2025-07-08T06:30:00Z', estimatedCompletion: '2025-07-08T16:00:00Z',
  },
  {
    id: 'washing', name: 'Washing', status: 'idle', currentBatch: '-',
    inputWeight: 0, outputWeight: 0, rateKgPerHour: 0, targetRate: 350,
    uptimePercent: 0, downtimeMinutes: 0, operatorName: 'Unassigned',
    startedAt: '-',
  },
  {
    id: 'drying', name: 'Drying', status: 'running', currentBatch: 'B-HDPE-2025-001',
    inputWeight: 3050, outputWeight: 3020, rateKgPerHour: 300, targetRate: 320,
    uptimePercent: 95, downtimeMinutes: 20, operatorName: 'Ibrahim Musa',
    startedAt: '2025-07-08T07:00:00Z', estimatedCompletion: '2025-07-08T18:00:00Z',
  },
  {
    id: 'bagging', name: 'Bagging', status: 'running', currentBatch: 'B-HDPE-2025-001',
    inputWeight: 3020, outputWeight: 3000, rateKgPerHour: 280, targetRate: 300,
    uptimePercent: 90, downtimeMinutes: 60, operatorName: 'Okafor Chioma',
    startedAt: '2025-07-08T07:30:00Z', estimatedCompletion: '2025-07-08T19:00:00Z',
  },
];

const MOCK_DOWNTIME: DowntimeEvent[] = [
  { id: 'd1', stage: 'Grinding', reason: 'Blade replacement', startedAt: '2025-07-08T08:15:00Z', endedAt: '2025-07-08T09:00:00Z', durationMinutes: 45, reportedBy: 'Chukwu Emeka', resolvedBy: 'Maintenance' },
  { id: 'd2', stage: 'Bagging', reason: 'Conveyor jam', startedAt: '2025-07-08T10:30:00Z', endedAt: '2025-07-08T11:30:00Z', durationMinutes: 60, reportedBy: 'Okafor Chioma', resolvedBy: 'Okafor Chioma' },
  { id: 'd3', stage: 'Sorting', reason: 'Power fluctuation', startedAt: '2025-07-08T07:45:00Z', endedAt: '2025-07-08T08:30:00Z', durationMinutes: 45, reportedBy: 'Adebayo Oluwaseun', resolvedBy: 'Electrician' },
];

const SHIFT_DATA = {
  shiftName: 'Morning Shift',
  shiftTime: '06:00 - 14:00',
  supervisor: 'Okafor Chioma',
  targetOutputKg: 5000,
  currentOutputKg: 3180,
  workersPresent: 12,
  workersExpected: 14,
  efficiencyPercent: 78,
};

// ============================================================================
// STATUS HELPERS
// ============================================================================

function getStatusColor(status: StageStatus['status']) {
  switch (status) {
    case 'running': return 'bg-green-100 text-green-800 border-green-200';
    case 'idle': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'down': return 'bg-red-100 text-red-800 border-red-200';
    case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'complete': return 'bg-blue-100 text-blue-800 border-blue-200';
  }
}

function getStatusIcon(status: StageStatus['status']) {
  switch (status) {
    case 'running': return PlayCircle;
    case 'idle': return PauseCircle;
    case 'down': return AlertTriangle;
    case 'maintenance': return Timer;
    case 'complete': return CheckCircle;
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ProductionMonitor() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeDowntime, setActiveDowntime] = useState<DowntimeEvent | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const runningStages = MOCK_STAGES.filter(s => s.status === 'running');
  const downStages = MOCK_STAGES.filter(s => s.status === 'down' || s.status === 'maintenance');
  const avgUptime = MOCK_STAGES.reduce((s, st) => s + st.uptimePercent, 0) / MOCK_STAGES.length;
  const totalThroughput = runningStages.reduce((s, st) => s + st.rateKgPerHour, 0);
  const avgEfficiency = (totalThroughput / MOCK_STAGES.filter(s => s.status === 'running').reduce((s, st) => s + st.targetRate, 0)) * 100;

  return (
    <div className="space-y-4">
      {/* Shift Summary Bar */}
      <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" />
              <div>
                <p className="text-sm opacity-90">{SHIFT_DATA.shiftName}</p>
                <p className="font-bold">{SHIFT_DATA.shiftTime}</p>
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-bold">{SHIFT_DATA.currentOutputKg.toLocaleString()}</p>
                <p className="text-xs opacity-75">kg produced / {SHIFT_DATA.targetOutputKg.toLocaleString()}kg</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{SHIFT_DATA.workersPresent}/{SHIFT_DATA.workersExpected}</p>
                <p className="text-xs opacity-75">workers present</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{SHIFT_DATA.efficiencyPercent}%</p>
                <p className="text-xs opacity-75">efficiency</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Supervisor</p>
              <p className="font-bold">{SHIFT_DATA.supervisor}</p>
              <p className="text-xs opacity-75">{currentTime.toLocaleTimeString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium">Lines Running</span>
            </div>
            <p className="text-xl font-bold">{runningStages.length} / {MOCK_STAGES.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-medium">Throughput</span>
            </div>
            <p className="text-xl font-bold">{totalThroughput.toLocaleString()} <span className="text-sm font-normal">kg/hr</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Avg Uptime</span>
            </div>
            <p className="text-xl font-bold">{avgUptime.toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <Timer className="w-4 h-4" />
              <span className="text-xs font-medium">Avg Efficiency</span>
            </div>
            <p className="text-xl font-bold">{avgEfficiency.toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Stage Cards */}
      <div className="grid lg:grid-cols-5 gap-3">
        {MOCK_STAGES.map(stage => {
          const StatusIcon = getStatusIcon(stage.status);
          const ratePct = stage.targetRate > 0 ? (stage.rateKgPerHour / stage.targetRate) * 100 : 0;
          const isRunning = stage.status === 'running';

          return (
            <Card key={stage.id} className={cn(
              "transition-all hover:shadow-md",
              stage.status === 'down' && "border-red-300",
              stage.status === 'running' && "border-green-200",
            )}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{stage.name}</span>
                  <Badge className={cn("text-xs", getStatusColor(stage.status))}>
                    <StatusIcon className="w-3 h-3 mr-1 inline" />
                    {stage.status}
                  </Badge>
                </div>

                {isRunning && (
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Current Batch</p>
                      <p className="text-sm font-medium truncate">{stage.currentBatch}</p>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Input</span>
                      <span className="font-medium">{stage.inputWeight.toLocaleString()}kg</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Output</span>
                      <span className="font-medium">{stage.outputWeight.toLocaleString()}kg</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Rate</span>
                        <span className="font-medium">{stage.rateKgPerHour}/{stage.targetRate} kg/hr</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full">
                        <div
                          className={cn("h-full rounded-full", ratePct >= 90 ? 'bg-green-500' : ratePct >= 70 ? 'bg-yellow-500' : 'bg-red-500')}
                          style={{ width: `${Math.min(ratePct, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Uptime</span>
                      <span className={cn("font-medium", stage.uptimePercent >= 90 ? 'text-green-600' : 'text-yellow-600')}>
                        {stage.uptimePercent}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">Op: {stage.operatorName}</p>
                  </div>
                )}

                {!isRunning && (
                  <div className="text-center py-4">
                    <StatusIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500 capitalize">{stage.status}</p>
                    {stage.status === 'idle' && (
                      <Button size="sm" variant="outline" className="mt-2 text-xs">Assign Batch</Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Downtime Log */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Downtime Log — Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Stage</th>
                  <th className="text-left">Reason</th>
                  <th className="text-left">From</th>
                  <th className="text-left">To</th>
                  <th className="text-right">Duration</th>
                  <th className="text-left">Reported By</th>
                  <th className="text-left">Fixed By</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DOWNTIME.map(d => (
                  <tr key={d.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{d.stage}</td>
                    <td>{d.reason}</td>
                    <td className="text-xs">{new Date(d.startedAt).toLocaleTimeString()}</td>
                    <td className="text-xs">{d.endedAt ? new Date(d.endedAt).toLocaleTimeString() : '-'}</td>
                    <td className="text-right font-medium">{d.durationMinutes} min</td>
                    <td className="text-xs">{d.reportedBy}</td>
                    <td className="text-xs">{d.resolvedBy || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {MOCK_DOWNTIME.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p>No downtime recorded today</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
