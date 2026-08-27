// ============================================================================
// ANALYTICS & FORECASTING DASHBOARD
// Production trends, material forecasts, efficiency charts
// ============================================================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Package } from 'lucide-react';

// ============================================================================
// MOCK DATA
// ============================================================================

const PRODUCTION_TREND = [
  { month: 'Jan', planned: 45000, actual: 42800, efficiency: 95 },
  { month: 'Feb', planned: 48000, actual: 44100, efficiency: 92 },
  { month: 'Mar', planned: 50000, actual: 51200, efficiency: 102 },
  { month: 'Apr', planned: 52000, actual: 48900, efficiency: 94 },
  { month: 'May', planned: 55000, actual: 53400, efficiency: 97 },
  { month: 'Jun', planned: 55000, actual: 54800, efficiency: 99 },
  { month: 'Jul', planned: 58000, actual: 32000, efficiency: 92 }, // partial month
];

const MATERIAL_BREAKDOWN = [
  { material: 'PET Clear', input: 120000, output: 114500, loss: 5500, pct: 35 },
  { material: 'PET Green', input: 95000, output: 90100, loss: 4900, pct: 28 },
  { material: 'HDPE', input: 60000, output: 57100, loss: 2900, pct: 18 },
  { material: 'PP', input: 40000, output: 38200, loss: 1800, pct: 12 },
  { material: 'LDPE', input: 25000, output: 23800, loss: 1200, pct: 7 },
];

const LOSS_BY_STAGE = [
  { stage: 'Sorting', lossKg: 2100, pct: 1.1 },
  { stage: 'Grinding', lossKg: 5800, pct: 3.0 },
  { stage: 'Washing', lossKg: 2900, pct: 1.5 },
  { stage: 'Drying', lossKg: 1900, pct: 1.0 },
  { stage: 'Bagging', lossKg: 1200, pct: 0.6 },
];

const DAILY_PRODUCTION = [
  { day: 'Mon', sorted: 5200, ground: 5050, washed: 5020, dried: 5000, bagged: 4980 },
  { day: 'Tue', sorted: 4800, ground: 4650, washed: 4620, dried: 4600, bagged: 4580 },
  { day: 'Wed', sorted: 5500, ground: 5320, washed: 5290, dried: 5270, bagged: 5250 },
  { day: 'Thu', sorted: 5100, ground: 4950, washed: 4920, dried: 4900, bagged: 4880 },
  { day: 'Fri', sorted: 4900, ground: 4750, washed: 4720, dried: 4700, bagged: 4680 },
  { day: 'Sat', sorted: 3500, ground: 3380, washed: 3360, dried: 3350, bagged: 3340 },
  { day: 'Sun', sorted: 0, ground: 0, washed: 0, dried: 0, bagged: 0 },
];

const VENDOR_PERFORMANCE = [
  { vendor: 'Adebayo Musa', deliveries: 45, avgWeight: 1850, qualityScore: 94, onTimeRate: 91 },
  { vendor: 'Olaoluwa Plastics', deliveries: 38, avgWeight: 2100, qualityScore: 97, onTimeRate: 95 },
  { vendor: 'Iya Kemi', deliveries: 52, avgWeight: 1200, qualityScore: 88, onTimeRate: 78 },
  { vendor: 'RecycleHub', deliveries: 28, avgWeight: 3200, qualityScore: 96, onTimeRate: 89 },
];

// ============================================================================
// CHART HELPERS
// ============================================================================

function BarChart({ data, max, color = 'bg-green-500' }: { data: number[]; max: number; color?: string }) {
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t ${color} opacity-80 hover:opacity-100 transition-opacity`}
            style={{ height: `${(v / max) * 100}%`, minHeight: 4 }}
          />
        </div>
      ))}
    </div>
  );
}

function StackedBar({ segments, labels }: { segments: { color: string; value: number }[][]; labels: string[] }) {
  const max = Math.max(...segments.map(s => s.reduce((a, b) => a + b.value, 0)));
  return (
    <div className="flex items-end gap-2 h-40">
      {segments.map((seg, i) => {
        const total = seg.reduce((a, b) => a + b.value, 0);
        return (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="w-full flex flex-col-reverse rounded overflow-hidden" style={{ height: `${(total / max) * 100}%` }}>
              {seg.map((s, j) => (
                <div key={j} className={`w-full ${s.color}`} style={{ height: `${(s.value / total) * 100}%` }} />
              ))}
            </div>
            <span className="text-[10px] text-gray-500 mt-1">{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('production');

  const totalPlanned = PRODUCTION_TREND.reduce((s, d) => s + d.planned, 0);
  const totalActual = PRODUCTION_TREND.reduce((s, d) => s + d.actual, 0);
  const avgEfficiency = (totalActual / totalPlanned) * 100;
  const totalLoss = MATERIAL_BREAKDOWN.reduce((s, m) => s + m.loss, 0);
  const totalInput = MATERIAL_BREAKDOWN.reduce((s, m) => s + m.input, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-sm text-gray-500">Production intelligence, forecasting, and performance metrics</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Avg Efficiency</p>
            <p className="text-2xl font-bold text-green-600">{avgEfficiency.toFixed(1)}%</p>
            <p className="text-xs text-gray-400">vs planned target</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Output (YTD)</p>
            <p className="text-2xl font-bold">{(totalActual / 1000).toFixed(0)}k <span className="text-sm font-normal">kg</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Overall Loss Rate</p>
            <p className="text-2xl font-bold text-red-600">{((totalLoss / totalInput) * 100).toFixed(2)}%</p>
            <p className="text-xs text-gray-400">{totalLoss.toLocaleString()} kg lost</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Active Batches</p>
            <p className="text-2xl font-bold text-blue-600">4</p>
            <p className="text-xs text-gray-400">2 ready to close</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="production"><BarChart3 className="w-4 h-4 mr-1" /> Production</TabsTrigger>
          <TabsTrigger value="materials"><PieChart className="w-4 h-4 mr-1" /> Materials</TabsTrigger>
          <TabsTrigger value="loss"><TrendingDown className="w-4 h-4 mr-1" /> Loss Analysis</TabsTrigger>
          <TabsTrigger value="vendors"><Package className="w-4 h-4 mr-1" /> Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="space-y-4">
          <ProductionTab />
        </TabsContent>
        <TabsContent value="materials" className="space-y-4">
          <MaterialsTab />
        </TabsContent>
        <TabsContent value="loss" className="space-y-4">
          <LossTab />
        </TabsContent>
        <TabsContent value="vendors" className="space-y-4">
          <VendorTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// PRODUCTION TAB
// ============================================================================

function ProductionTab() {
  const maxVal = Math.max(...PRODUCTION_TREND.map(d => Math.max(d.planned, d.actual)));

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">Monthly Production vs Plan</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-48">
            {PRODUCTION_TREND.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full flex gap-1 items-end justify-center" style={{ height: `${(Math.max(d.planned, d.actual) / maxVal) * 100}%` }}>
                  <div className="w-3 bg-blue-300 rounded-t" style={{ height: `${(d.planned / Math.max(d.planned, d.actual)) * 100}%` }} title={`Planned: ${d.planned.toLocaleString()}kg`} />
                  <div className="w-3 bg-green-500 rounded-t" style={{ height: `${(d.actual / Math.max(d.planned, d.actual)) * 100}%` }} title={`Actual: ${d.actual.toLocaleString()}kg`} />
                </div>
                <span className="text-[10px] text-gray-500 mt-1">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-300 rounded-sm" /> Planned</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-sm" /> Actual</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Daily Stage Flow (This Week)</CardTitle></CardHeader>
        <CardContent>
          <StackedBar
            segments={DAILY_PRODUCTION.map(d => [
              { color: 'bg-gray-400', value: d.sorted - d.ground },
              { color: 'bg-amber-500', value: d.ground - d.washed },
              { color: 'bg-blue-500', value: d.washed - d.dried },
              { color: 'bg-orange-500', value: d.dried - d.bagged },
              { color: 'bg-green-500', value: d.bagged },
            ])}
            labels={DAILY_PRODUCTION.map(d => d.day)}
          />
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-400 rounded-sm" /> Sorted</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded-sm" /> Ground</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-sm" /> Washed</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded-sm" /> Dried</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-sm" /> Bagged</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Efficiency Trend</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-40">
            {PRODUCTION_TREND.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className={`w-full rounded-t ${d.efficiency >= 95 ? 'bg-green-500' : d.efficiency >= 85 ? 'bg-yellow-500' : 'bg-red-500'} opacity-80`} style={{ height: `${d.efficiency}%` }} />
                <span className="text-[10px] text-gray-500 mt-1">{d.month}</span>
                <span className="text-[10px] font-bold">{d.efficiency}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Production Forecast (Next 3 Months)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { month: 'August', predicted: 59500, confidence: 'High', note: 'Based on consistent trend' },
              { month: 'September', predicted: 61200, confidence: 'Medium', note: 'Seasonal demand expected' },
              { month: 'October', predicted: 64000, confidence: 'Medium', note: 'New grinder online' },
            ].map(f => (
              <div key={f.month} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-20 text-sm font-bold">{f.month}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(f.predicted / 70000) * 100}%` }} />
                    <span className="text-sm font-medium">{f.predicted.toLocaleString()} kg</span>
                  </div>
                </div>
                <Badge className={f.confidence === 'High' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{f.confidence}</Badge>
                <span className="text-xs text-gray-500">{f.note}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// MATERIALS TAB
// ============================================================================

function MaterialsTab() {
  const totalOutput = MATERIAL_BREAKDOWN.reduce((s, m) => s + m.output, 0);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">Material Breakdown (YTD)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MATERIAL_BREAKDOWN.map(m => (
              <div key={m.material}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{m.material}</span>
                  <span className="text-xs text-gray-500">{m.pct}% of total</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-green-500" style={{ width: `${(m.output / totalOutput) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-500">In: {m.input.toLocaleString()}kg</span>
                  <span className="text-green-600">Out: {m.output.toLocaleString()}kg</span>
                  <span className="text-red-500">Loss: {m.loss.toLocaleString()}kg</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Input vs Output by Material</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {MATERIAL_BREAKDOWN.map(m => {
              const max = Math.max(m.input, m.output);
              return (
                <div key={m.material} className="flex items-center gap-2">
                  <span className="text-xs w-20 text-right">{m.material}</span>
                  <div className="flex-1 flex items-center gap-1">
                    <div className="h-3 bg-blue-300 rounded-l-sm" style={{ width: `${(m.input / max) * 50}%` }} />
                    <div className="h-3 bg-green-500 rounded-r-sm" style={{ width: `${(m.output / max) * 50}%` }} />
                  </div>
                  <span className="text-xs w-16 text-right">{((m.loss / m.input) * 100).toFixed(1)}% loss</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-300 rounded-sm" /> Input</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-sm" /> Output</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// LOSS TAB
// ============================================================================

function LossTab() {
  const maxLoss = Math.max(...LOSS_BY_STAGE.map(l => l.lossKg));
  const totalLossKg = LOSS_BY_STAGE.reduce((s, l) => s + l.lossKg, 0);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">Loss by Stage</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {LOSS_BY_STAGE.map(l => (
              <div key={l.stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{l.stage}</span>
                  <span className="text-xs">{l.lossKg.toLocaleString()} kg ({l.pct}%)</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: `${(l.lossKg / maxLoss) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-sm text-gray-600">Total Process Loss</p>
            <p className="text-2xl font-bold text-red-600">{totalLossKg.toLocaleString()} kg</p>
            <p className="text-xs text-gray-500">{((totalLossKg / totalInput) * 100).toFixed(2)}% of all input</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Loss Trend Over Time</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { week: 'Week 1', lossPct: 7.2 },
              { week: 'Week 2', lossPct: 6.8 },
              { week: 'Week 3', lossPct: 7.5 },
              { week: 'Week 4', lossPct: 6.2 },
              { week: 'Week 5', lossPct: 5.9 },
              { week: 'Week 6', lossPct: 5.5 },
            ].map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs w-16">{w.week}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full">
                  <div className={`h-full rounded-full ${w.lossPct > 7 ? 'bg-red-500' : w.lossPct > 6 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${(w.lossPct / 10) * 100}%` }} />
                </div>
                <span className="text-xs w-10 text-right font-medium">{w.lossPct}%</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-green-600 mt-3 text-center">Downward trend — improvement over last 6 weeks</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// VENDOR TAB
// ============================================================================

function VendorTab() {
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Vendor Performance Scorecard</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Vendor</th>
                <th className="text-right">Deliveries</th>
                <th className="text-right">Avg Weight</th>
                <th className="text-right">Quality</th>
                <th className="text-right">On-Time</th>
                <th className="text-center">Rating</th>
              </tr>
            </thead>
            <tbody>
              {VENDOR_PERFORMANCE.map(v => {
                const avgScore = (v.qualityScore + v.onTimeRate) / 2;
                return (
                  <tr key={v.vendor} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{v.vendor}</td>
                    <td className="text-right">{v.deliveries}</td>
                    <td className="text-right">{v.avgWeight.toLocaleString()} kg</td>
                    <td className="text-right">{v.qualityScore}%</td>
                    <td className="text-right">{v.onTimeRate}%</td>
                    <td className="text-center">
                      <Badge className={avgScore >= 95 ? 'bg-green-100 text-green-800' : avgScore >= 85 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                        {avgScore >= 95 ? 'A' : avgScore >= 90 ? 'B+' : avgScore >= 85 ? 'B' : avgScore >= 80 ? 'C' : 'D'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

const totalInput = MATERIAL_BREAKDOWN.reduce((s, m) => s + m.input, 0);
