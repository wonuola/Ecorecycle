// ============================================================================
// REPORTS MODULE - Production, Financial, Inventory, Workforce Reports with PDF Export
// ============================================================================

import { useEffect, useState } from 'react';
import { db } from '@/services/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Factory, 
  Package, 
  Users,
  Download,
  Calendar,
  FileText,
  Printer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function ReportsModule() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('production');

  const generateReport = async () => {
    setLoading(true);
    const [production, financial] = await Promise.all([
      db.getProductionReport(startDate, endDate),
      db.getFinancialReport(startDate, endDate),
    ]);
    setReportData({ production, financial });
    setLoading(false);
  };

  useEffect(() => {
    generateReport();
  }, []);

  const downloadPDF = async () => {
    if (!reportData) return;
    
    const doc = new jsPDF();
    const companyName = 'EcoRecycle Factory';
    const reportTitle = `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report`;
    const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;
    
    // Header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text(companyName, 14, 20);
    doc.setFontSize(16);
    doc.text(reportTitle, 14, 32);
    
    // Report info
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 50);
    doc.text(`Period: ${dateRange}`, 14, 56);
    
    let startY = 65;
    
    switch (activeTab) {
      case 'production':
        await generateProductionPDF(doc, reportData.production, startY);
        break;
      case 'financial':
        await generateFinancialPDF(doc, reportData.financial, startY);
        break;
      case 'inventory':
        await generateInventoryPDF(doc, startY);
        break;
      case 'workforce':
        await generateWorkforcePDF(doc, startY);
        break;
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount} - EcoRecycle Factory Management System`, 14, 287);
      doc.text('Confidential', 180, 287);
    }
    
    doc.save(`${activeTab}-report-${startDate}-to-${endDate}.pdf`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label>Start Date</Label>
              <Input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label>End Date</Label>
              <Input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button 
              onClick={generateReport}
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
            {reportData && (
              <Button 
                onClick={downloadPDF}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="production">
              <Factory className="w-4 h-4 mr-2" />
              Production
            </TabsTrigger>
            <TabsTrigger value="financial">
              <TrendingUp className="w-4 h-4 mr-2" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <Package className="w-4 h-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="workforce">
              <Users className="w-4 h-4 mr-2" />
              Workforce
            </TabsTrigger>
          </TabsList>

          <TabsContent value="production" className="space-y-4">
            <ProductionReport data={reportData.production} />
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <FinancialReport data={reportData.financial} />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <InventoryReport />
          </TabsContent>

          <TabsContent value="workforce" className="space-y-4">
            <WorkforceReport />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// ============================================================================
// PDF GENERATION FUNCTIONS
// ============================================================================

async function generateProductionPDF(doc: jsPDF, data: any, startY: number) {
  // Summary Section
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text('Production Summary', 14, startY);
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  
  const summaryData = [
    ['Total Input', `${(data.totalInput / 1000).toFixed(1)} tonnes`],
    ['Total Output', `${(data.totalOutput / 1000).toFixed(1)} tonnes`],
    ['Overall Yield', `${data.totalInput > 0 ? ((data.totalOutput / data.totalInput) * 100).toFixed(1) : 0}%`],
  ];
  
  autoTable(doc, {
    startY: startY + 5,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
    },
  });
  
  // Yield by Stage
  let currentY = (doc as any).lastAutoTable?.finalY || startY + 40;
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text('Yield by Production Stage', 14, currentY + 10);
  
  const yieldData = [
    ['Sorting', `${data.yieldByStage.sorting.toFixed(1)}%`],
    ['Grinding', `${data.yieldByStage.grinding.toFixed(1)}%`],
    ['Washing', `${(100 - data.yieldByStage.washing).toFixed(1)}%`],
  ];
  
  autoTable(doc, {
    startY: currentY + 15,
    head: [['Stage', 'Yield']],
    body: yieldData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
    },
  });
  
  // Batch Performance
  currentY = (doc as any).lastAutoTable?.finalY || currentY + 50;
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text('Batch Performance', 14, currentY + 10);
  
  const batchData = data.batches?.map((batch: any) => [
    batch.batchNumber,
    batch.weights.initialWeight.toLocaleString(),
    (batch.weights.finalDryFlakesWeight || batch.weights.groundFlakesWeight || 0).toLocaleString(),
    `${batch.weights.totalYieldPercent.toFixed(1)}%`,
    `₦${batch.costs.costPerKg}`,
  ]) || [];
  
  autoTable(doc, {
    startY: currentY + 15,
    head: [['Batch', 'Input (kg)', 'Output (kg)', 'Yield %', 'Cost/kg']],
    body: batchData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 },
    columnStyles: {
      3: { halign: 'center' },
      4: { halign: 'right' },
    },
  });
}

async function generateFinancialPDF(doc: jsPDF, data: any, startY: number) {
  // Summary Section
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text('Financial Summary', 14, startY);
  
  const totalCosts = data.materialCosts + data.labourCosts + data.logisticsCosts + data.handlingCosts + data.otherCosts;
  
  const summaryData = [
    ['Revenue', `₦${(data.revenue / 1000000).toFixed(2)}M`],
    ['Total Costs', `₦${(totalCosts / 1000000).toFixed(2)}M`],
    ['Gross Profit', `₦${(data.grossProfit / 1000000).toFixed(2)}M`],
    ['Cost per kg', `₦${data.costPerKg.toFixed(0)}`],
  ];
  
  autoTable(doc, {
    startY: startY + 5,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
    },
  });
  
  // Cost Breakdown
  let currentY = (doc as any).lastAutoTable?.finalY || startY + 40;
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text('Cost Breakdown', 14, currentY + 10);
  
  const costData = [
    ['Material Costs', `₦${(data.materialCosts / 1000).toFixed(0)}k`, `${((data.materialCosts / totalCosts) * 100).toFixed(1)}%`],
    ['Labour Costs', `₦${(data.labourCosts / 1000).toFixed(0)}k`, `${((data.labourCosts / totalCosts) * 100).toFixed(1)}%`],
    ['Logistics Costs', `₦${(data.logisticsCosts / 1000).toFixed(0)}k`, `${((data.logisticsCosts / totalCosts) * 100).toFixed(1)}%`],
    ['Handling Costs', `₦${(data.handlingCosts / 1000).toFixed(0)}k`, `${((data.handlingCosts / totalCosts) * 100).toFixed(1)}%`],
    ['Other Costs', `₦${(data.otherCosts / 1000).toFixed(0)}k`, `${((data.otherCosts / totalCosts) * 100).toFixed(1)}%`],
    ['Total', `₦${totalCosts.toLocaleString()}`, '100%'],
  ].filter(row => parseFloat(row[1].replace(/[₦,k]/g, '')) > 0);
  
  autoTable(doc, {
    startY: currentY + 15,
    head: [['Cost Category', 'Amount', 'Percentage']],
    body: costData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
      2: { halign: 'center' },
    },
  });
}

async function generateInventoryPDF(doc: jsPDF, startY: number) {
  const kpis = await db.getDashboardKPIs();
  const inventory = kpis.stockOnHand;
  const batchesData = await db.getBatches();
  const batches = batchesData.filter((b: any) => b.status !== 'dispatched');
  
  const inventoryData = [
    { name: 'Unsorted PET', value: inventory.unsorted_pet || 0 },
    { name: 'Sorted PET', value: inventory.sorted_pet || 0 },
    { name: 'Caps', value: inventory.caps || 0 },
    { name: 'Labels', value: inventory.labels || 0 },
    { name: 'Ground Flakes', value: inventory.ground_flakes || 0 },
    { name: 'Washed Flakes', value: inventory.washed_flakes || 0 },
    { name: 'Final Flakes', value: inventory.final_flakes || 0 },
    { name: 'Rejects', value: inventory.rejects || 0 },
  ].filter(item => item.value > 0);
  
  const totalStock = inventoryData.reduce((sum, item) => sum + item.value, 0);
  
  // Summary
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text('Inventory Summary', 14, startY);
  
  const summaryData = [
    ['Total Stock', `${(totalStock / 1000).toFixed(1)} tonnes`],
    ['Active Batches', `${batches.length}`],
    ['Saleable Stock', `${((inventory.final_flakes || 0) / 1000).toFixed(1)} tonnes`],
  ];
  
  autoTable(doc, {
    startY: startY + 5,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
    },
  });
  
  // Inventory by State
  let currentY = (doc as any).lastAutoTable?.finalY || startY + 40;
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text('Inventory by State', 14, currentY + 10);
  
  const invTableData = inventoryData.map(item => [
    item.name,
    `${(item.value / 1000).toFixed(2)} tonnes`,
    `${((item.value / totalStock) * 100).toFixed(1)}%`,
  ]);
  
  autoTable(doc, {
    startY: currentY + 15,
    head: [['Material Type', 'Quantity', 'Percentage']],
    body: invTableData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
      2: { halign: 'center' },
    },
  });
  
  // Stock Aging
  currentY = (doc as any).lastAutoTable?.finalY || currentY + 60;
  if (currentY > 200) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text('Stock Aging', 14, currentY + 10);
  
  const agingData = batches.slice(0, 15).map((batch: any) => {
    const age = Math.floor((Date.now() - new Date(batch.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const weight = batch.weights.finalDryFlakesWeight || batch.weights.groundFlakesWeight || batch.weights.sortedPetWeight || batch.weights.initialWeight;
    return [
      batch.batchNumber,
      batch.currentState.replace(/_/g, ' '),
      weight.toLocaleString(),
      `${age} days`,
      `₦${batch.costs.costPerKg}`,
    ];
  });
  
  autoTable(doc, {
    startY: currentY + 15,
    head: [['Batch', 'State', 'Weight (kg)', 'Age', 'Cost/kg']],
    body: agingData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'right' },
    },
  });
}

async function generateWorkforcePDF(doc: jsPDF, startY: number) {
  const [workersData, wagesData] = await Promise.all([
    db.getWorkers(),
    db.getWageEntries(),
  ]);
  
  const totalWages = wagesData.reduce((sum: number, w: any) => sum + w.amount, 0);
  const avgWage = wagesData.length > 0 ? totalWages / wagesData.length : 0;
  const totalKgSorted = workersData.reduce((sum: number, w: any) => sum + w.totalKgSorted, 0);
  
  // Summary
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text('Workforce Summary', 14, startY);
  
  const summaryData = [
    ['Total Workers', `${workersData.length}`],
    ['Total Wages Paid', `₦${(totalWages / 1000).toFixed(0)}k`],
    ['Average Wage/Worker', `₦${avgWage.toFixed(0)}`],
    ['Total KG Sorted', `${(totalKgSorted / 1000).toFixed(1)} tonnes`],
  ];
  
  autoTable(doc, {
    startY: startY + 5,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
    },
  });
  
  // Worker Performance
  let currentY = (doc as any).lastAutoTable?.finalY || startY + 40;
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text('Worker Performance', 14, currentY + 10);
  
  const workerData = workersData
    .sort((a: any, b: any) => b.totalKgSorted - a.totalKgSorted)
    .map((worker: any, index: number) => [
      `#${index + 1}`,
      worker.name,
      worker.role,
      worker.totalKgSorted.toLocaleString(),
      `₦${worker.totalWagesEarned.toLocaleString()}`,
      worker.totalWagesEarned > 0 
        ? `${(worker.totalKgSorted / (worker.totalWagesEarned / 50)).toFixed(1)} kg/₦`
        : '0 kg/₦',
    ]);
  
  autoTable(doc, {
    startY: currentY + 15,
    head: [['Rank', 'Name', 'Role', 'KG Sorted', 'Wages Earned', 'Efficiency']],
    body: workerData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
    },
  });
}

// ============================================================================
// REPORT COMPONENTS
// ============================================================================

function ProductionReport({ data }: { data: any }) {
  const yieldData = [
    { name: 'Sorting', yield: data.yieldByStage.sorting },
    { name: 'Grinding', yield: data.yieldByStage.grinding },
    { name: 'Washing', yield: 100 - data.yieldByStage.washing },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Input</p>
            <p className="text-2xl font-bold">{(data.totalInput / 1000).toFixed(1)}t</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Output</p>
            <p className="text-2xl font-bold">{(data.totalOutput / 1000).toFixed(1)}t</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Overall Yield</p>
            <p className="text-2xl font-bold text-green-600">
              {data.totalInput > 0 ? ((data.totalOutput / data.totalInput) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Yield by Stage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Yield by Production Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Bar dataKey="yield" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Batch Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Batch</th>
                  <th className="text-right py-2">Input (kg)</th>
                  <th className="text-right py-2">Output (kg)</th>
                  <th className="text-right py-2">Yield %</th>
                  <th className="text-right py-2">Cost/kg</th>
                </tr>
              </thead>
              <tbody>
                {data.batches?.map((batch: any) => (
                  <tr key={batch.id} className="border-b">
                    <td className="py-2 font-medium">{batch.batchNumber}</td>
                    <td className="text-right py-2">{batch.weights.initialWeight.toLocaleString()}</td>
                    <td className="text-right py-2">
                      {(batch.weights.finalDryFlakesWeight || batch.weights.groundFlakesWeight || 0).toLocaleString()}
                    </td>
                    <td className="text-right py-2">
                      <span className={batch.weights.totalYieldPercent >= 85 ? 'text-green-600' : 'text-yellow-600'}>
                        {batch.weights.totalYieldPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right py-2">₦{batch.costs.costPerKg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FinancialReport({ data }: { data: any }) {
  const costBreakdown = [
    { name: 'Material', value: data.materialCosts },
    { name: 'Labour', value: data.labourCosts },
    { name: 'Logistics', value: data.logisticsCosts },
    { name: 'Handling', value: data.handlingCosts },
    { name: 'Other', value: data.otherCosts },
  ].filter(item => item.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Revenue</p>
            <p className="text-2xl font-bold text-green-600">₦{(data.revenue / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Costs</p>
            <p className="text-2xl font-bold text-red-600">
              ₦{((data.materialCosts + data.labourCosts + data.logisticsCosts + data.handlingCosts + data.otherCosts) / 1000000).toFixed(1)}M
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Gross Profit</p>
            <p className={`text-2xl font-bold ${data.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₦{(data.grossProfit / 1000000).toFixed(1)}M
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Cost per kg</p>
            <p className="text-2xl font-bold">₦{data.costPerKg.toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₦${(value / 1000).toFixed(0)}k`} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cost Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costBreakdown.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="font-medium">₦{(item.value / 1000).toFixed(0)}k</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>
                    ₦{costBreakdown.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InventoryReport() {
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const kpis = await db.getDashboardKPIs();
    setInventory(kpis.stockOnHand);
    const batchesData = await db.getBatches();
    setBatches(batchesData.filter(b => b.status !== 'dispatched'));
  };

  const inventoryData = [
    { name: 'Unsorted PET', value: inventory.unsorted_pet || 0, color: '#6B7280' },
    { name: 'Sorted PET', value: inventory.sorted_pet || 0, color: '#3B82F6' },
    { name: 'Caps', value: inventory.caps || 0, color: '#EAB308' },
    { name: 'Labels', value: inventory.labels || 0, color: '#F97316' },
    { name: 'Ground Flakes', value: inventory.ground_flakes || 0, color: '#A855F7' },
    { name: 'Washed Flakes', value: inventory.washed_flakes || 0, color: '#06B6D4' },
    { name: 'Final Flakes', value: inventory.final_flakes || 0, color: '#10B981' },
    { name: 'Rejects', value: inventory.rejects || 0, color: '#EF4444' },
  ].filter(item => item.value > 0);

  const totalStock = inventoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Stock</p>
            <p className="text-2xl font-bold">{(totalStock / 1000).toFixed(1)}t</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Active Batches</p>
            <p className="text-2xl font-bold">{batches.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Saleable Stock</p>
            <p className="text-2xl font-bold text-green-600">
              {((inventory.final_flakes || 0) / 1000).toFixed(1)}t
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">In Process</p>
            <p className="text-2xl font-bold text-blue-600">
              {(((inventory.sorted_pet || 0) + (inventory.ground_flakes || 0) + (inventory.washed_flakes || 0)) / 1000).toFixed(1)}t
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inventory by State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value: number) => `${(value / 1000).toFixed(1)}t`} />
                <Bar dataKey="value">
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stock Aging */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Stock Aging</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Batch</th>
                  <th className="text-left py-2">State</th>
                  <th className="text-right py-2">Weight (kg)</th>
                  <th className="text-right py-2">Age (days)</th>
                  <th className="text-right py-2">Cost/kg</th>
                </tr>
              </thead>
              <tbody>
                {batches.slice(0, 10).map((batch) => {
                  const age = Math.floor((Date.now() - new Date(batch.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  const weight = batch.weights.finalDryFlakesWeight || batch.weights.groundFlakesWeight || batch.weights.sortedPetWeight || batch.weights.initialWeight;
                  return (
                    <tr key={batch.id} className="border-b">
                      <td className="py-2 font-medium">{batch.batchNumber}</td>
                      <td className="py-2 capitalize">{batch.currentState.replace(/_/g, ' ')}</td>
                      <td className="text-right py-2">{weight.toLocaleString()}</td>
                      <td className="text-right py-2">
                        <span className={age > 30 ? 'text-red-600' : age > 14 ? 'text-yellow-600' : 'text-green-600'}>
                          {age}
                        </span>
                      </td>
                      <td className="text-right py-2">₦{batch.costs.costPerKg}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WorkforceReport() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [wageEntries, setWageEntries] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [workersData, wagesData] = await Promise.all([
      db.getWorkers(),
      db.getWageEntries(),
    ]);
    setWorkers(workersData);
    setWageEntries(wagesData);
  };

  const totalWages = wageEntries.reduce((sum, w) => sum + w.amount, 0);
  const avgWage = wageEntries.length > 0 ? totalWages / wageEntries.length : 0;

  const productivityData = workers
    .filter(w => w.totalKgSorted > 0)
    .sort((a, b) => b.totalKgSorted - a.totalKgSorted)
    .slice(0, 10)
    .map((w, i) => ({
      name: w.name.split(' ')[0],
      kg: w.totalKgSorted,
      earnings: w.totalWagesEarned,
    }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Workers</p>
            <p className="text-2xl font-bold">{workers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Wages</p>
            <p className="text-2xl font-bold">₦{(totalWages / 1000).toFixed(0)}k</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Avg Wage/Worker</p>
            <p className="text-2xl font-bold">₦{avgWage.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total KG Sorted</p>
            <p className="text-2xl font-bold">
              {(workers.reduce((sum, w) => sum + w.totalKgSorted, 0) / 1000).toFixed(1)}t
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Performers - KG Sorted</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="kg" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Workers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Worker Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Rank</th>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-right py-2">KG Sorted</th>
                  <th className="text-right py-2">Wages Earned</th>
                  <th className="text-right py-2">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {workers
                  .sort((a, b) => b.totalKgSorted - a.totalKgSorted)
                  .map((worker, index) => (
                    <tr key={worker.id} className="border-b">
                      <td className="py-2">
                        {index < 3 ? (
                          <Badge className={
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }>
                            #{index + 1}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">#{index + 1}</span>
                        )}
                      </td>
                      <td className="py-2 font-medium">{worker.name}</td>
                      <td className="py-2 capitalize">{worker.role}</td>
                      <td className="text-right py-2">{worker.totalKgSorted.toLocaleString()}</td>
                      <td className="text-right py-2">₦{worker.totalWagesEarned.toLocaleString()}</td>
                      <td className="text-right py-2">
                        {worker.totalWagesEarned > 0 
                          ? `${(worker.totalKgSorted / (worker.totalWagesEarned / 50)).toFixed(1)} kg/₦`
                          : '0'} kg/₦
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
