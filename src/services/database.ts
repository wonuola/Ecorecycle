// ============================================================================
// MOCK DATABASE SERVICE - Simulates PostgreSQL Backend
// ============================================================================

import type {
  User, Vendor, Buyer, PurchaseLot, Batch, Trip, HandlingEvent, HandlingType,
  SortingOperation, Worker, WageEntry, WagePolicy, GrindingOperation,
  WashingOperation, Expense, Dispatch, WeightCheckpoint, AuditLog,
  Payment, Alert, InventoryItem, StockMovement, LoginCredentials,
  CreateLotInput, CreateBatchInput, CreateSortingInput, CreateDispatchInput,
  MaterialType, MaterialGrade, InventoryState, UserRole, ExpenseCategory,
  TripType, HandlingDirection, Ticket, TicketComment
} from '@/types';

// ============================================================================
// INITIAL MOCK DATA
// ============================================================================

const MOCK_USERS: User[] = [
  { id: '1', email: 'admin@factory.com', name: 'System Admin', role: 'admin', isActive: true, createdAt: '2024-01-01' },
  { id: '2', email: 'owner@factory.com', name: 'Factory Owner', role: 'owner', isActive: true, createdAt: '2024-01-01' },
  { id: '3', email: 'procurement@factory.com', name: 'Procurement Officer', role: 'procurement', isActive: true, createdAt: '2024-01-01' },
  { id: '4', email: 'warehouse@factory.com', name: 'Warehouse Officer', role: 'warehouse_officer', isActive: true, createdAt: '2024-01-01' },
  { id: '5', email: 'sorting@factory.com', name: 'Sorting Supervisor', role: 'sorting_supervisor', isActive: true, createdAt: '2024-01-01' },
  { id: '6', email: 'production@factory.com', name: 'Production Supervisor', role: 'production_supervisor', isActive: true, createdAt: '2024-01-01' },
  { id: '7', email: 'logistics@factory.com', name: 'Logistics Officer', role: 'logistics_officer', isActive: true, createdAt: '2024-01-01' },
  { id: '8', email: 'finance@factory.com', name: 'Finance Manager', role: 'finance', isActive: true, createdAt: '2024-01-01' },
];

const MOCK_VENDORS: Vendor[] = [
  { id: '1', name: 'ABC Recycling Ltd', contactPerson: 'John Doe', phone: '08012345678', location: 'Lagos', materialTypes: ['PET', 'HDPE'], reliabilityScore: 85, notes: 'Reliable supplier', isActive: true, createdAt: '2024-01-15', totalTransactions: 45, totalKgPurchased: 125000 },
  { id: '2', name: 'EcoCollectors', contactPerson: 'Jane Smith', phone: '08087654321', location: 'Ibadan', materialTypes: ['PET'], reliabilityScore: 78, notes: 'Good quality, sometimes late', isActive: true, createdAt: '2024-02-01', totalTransactions: 32, totalKgPurchased: 89000 },
  { id: '3', name: 'GreenPlast Ventures', contactPerson: 'Mike Johnson', phone: '08055551234', location: 'Abuja', materialTypes: ['PET', 'PP'], reliabilityScore: 92, notes: 'Premium quality, higher prices', isActive: true, createdAt: '2024-01-20', totalTransactions: 28, totalKgPurchased: 76000 },
  { id: '4', name: 'Metro Waste Solutions', contactPerson: 'Sarah Williams', phone: '08099998888', location: 'Lagos', materialTypes: ['MIXED'], reliabilityScore: 65, notes: 'Mixed quality, negotiate prices', isActive: true, createdAt: '2024-03-01', totalTransactions: 18, totalKgPurchased: 42000 },
];

const MOCK_BUYERS: Buyer[] = [
  { id: '1', name: 'Nigerian Plastics Inc', contactPerson: 'Robert Chen', phone: '07011112222', location: 'Lagos', pricingHistory: [], isActive: true, createdAt: '2024-01-10', totalTransactions: 38, totalKgSold: 98000 },
  { id: '2', name: 'EuroPack Nigeria', contactPerson: 'Maria Garcia', phone: '07033334444', location: 'Port Harcourt', pricingHistory: [], isActive: true, createdAt: '2024-01-25', totalTransactions: 25, totalKgSold: 65000 },
  { id: '3', name: 'AfriFiber Industries', contactPerson: 'David Okonkwo', phone: '07055556666', location: 'Onitsha', pricingHistory: [], isActive: true, createdAt: '2024-02-10', totalTransactions: 20, totalKgSold: 48000 },
];

const MOCK_WORKERS: Worker[] = [
  { id: '1', name: 'Emmanuel Adeyemi', phone: '08111111111', role: 'sorter', baseWageRate: 50, isActive: true, joinedAt: '2024-01-01', totalKgSorted: 15000, totalWagesEarned: 750000 },
  { id: '2', name: 'Fatima Bello', phone: '08122222222', role: 'sorter', baseWageRate: 50, isActive: true, joinedAt: '2024-01-15', totalKgSorted: 12000, totalWagesEarned: 600000 },
  { id: '3', name: 'Chinedu Okafor', phone: '08133333333', role: 'loader', baseWageRate: 2000, isActive: true, joinedAt: '2024-02-01', totalKgSorted: 0, totalWagesEarned: 180000 },
  { id: '4', name: 'Amina Ibrahim', phone: '08144444444', role: 'operator', baseWageRate: 5000, isActive: true, joinedAt: '2024-01-20', totalKgSorted: 0, totalWagesEarned: 350000 },
  { id: '5', name: 'Tunde Bakare', phone: '08155555555', role: 'sorter', baseWageRate: 50, isActive: true, joinedAt: '2024-02-15', totalKgSorted: 8000, totalWagesEarned: 400000 },
];

const MOCK_HANDLING_TYPES: HandlingType[] = [
  { id: '1', name: 'Offloading', direction: 'inbound', defaultUnit: 'kg', isActive: true },
  { id: '2', name: 'Loading', direction: 'outbound', defaultUnit: 'kg', isActive: true },
  { id: '3', name: 'Bagging', direction: 'internal', defaultUnit: 'bag', isActive: true },
  { id: '4', name: 'Unbagging', direction: 'internal', defaultUnit: 'bag', isActive: true },
  { id: '5', name: 'Forklift Rental', direction: 'internal', defaultUnit: 'hour', isActive: true },
  { id: '6', name: 'Yard Movement', direction: 'internal', defaultUnit: 'kg', isActive: true },
  { id: '7', name: 'Tipping Fee', direction: 'inbound', defaultUnit: 'kg', isActive: true },
  { id: '8', name: 'Weighing Assistance', direction: 'inbound', defaultUnit: 'trip', isActive: true },
];

// Generate some initial lots
const generateMockLots = (): PurchaseLot[] => {
  const lots: PurchaseLot[] = [];
  for (let i = 1; i <= 20; i++) {
    const vendor = MOCK_VENDORS[Math.floor(Math.random() * MOCK_VENDORS.length)];
    const grossWeight = Math.floor(Math.random() * 2000) + 500;
    const tareWeight = Math.floor(grossWeight * 0.05);
    const netWeight = grossWeight - tareWeight;
    const basePrice = Math.floor(Math.random() * 100) + 150;
    const totalCost = netWeight * basePrice;
    
    lots.push({
      id: `lot-${i}`,
      lotNumber: `LOT-${2024}-${String(i).padStart(4, '0')}`,
      vendorId: vendor.id,
      materialType: 'PET',
      grade: ['A', 'B', 'C'][Math.floor(Math.random() * 3)] as MaterialGrade,
      grossWeight,
      tareWeight,
      netWeight,
      basePricePerKg: basePrice,
      gradeAdjustment: 0,
      moistureAdjustment: Math.floor(Math.random() * 5),
      contaminationAdjustment: Math.floor(Math.random() * 3),
      finalPricePerKg: basePrice,
      totalCost,
      paymentStatus: Math.random() > 0.3 ? 'paid' : 'pending',
      amountPaid: Math.random() > 0.3 ? totalCost : 0,
      notes: '',
      createdBy: '3',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      handlingCosts: Math.floor(netWeight * 2),
      logisticsCosts: Math.floor(netWeight * 5),
      landedCostPerKg: basePrice + 7,
    });
  }
  return lots;
};

const MOCK_LOTS = generateMockLots();

// Generate batches from lots
const generateMockBatches = (): Batch[] => {
  const batches: Batch[] = [];
  for (let i = 1; i <= 12; i++) {
    const sourceLot = MOCK_LOTS[i - 1];
    const initialWeight = sourceLot.netWeight;
    const sortedWeight = Math.floor(initialWeight * 0.92);
    const groundWeight = Math.floor(sortedWeight * 0.98);
    const finalWeight = Math.floor(groundWeight * 0.95);
    
    batches.push({
      id: `batch-${i}`,
      batchNumber: `BATCH-${2024}-${String(i).padStart(4, '0')}`,
      sourceLotIds: [sourceLot.id],
      currentState: ['sorted_pet', 'ground_flakes', 'final_flakes'][Math.floor(Math.random() * 3)] as InventoryState,
      weights: {
        initialWeight,
        sortedPetWeight: sortedWeight,
        capsWeight: Math.floor(initialWeight * 0.03),
        labelsWeight: Math.floor(initialWeight * 0.04),
        sortingRejectsWeight: Math.floor(initialWeight * 0.01),
        groundFlakesWeight: groundWeight,
        washedFlakesWeight: Math.floor(groundWeight * 0.97),
        dewateredFlakesWeight: Math.floor(groundWeight * 0.96),
        finalDryFlakesWeight: finalWeight,
        sortingYieldPercent: 92,
        grindingYieldPercent: 98,
        washingLossPercent: 4,
        totalYieldPercent: (finalWeight / initialWeight) * 100,
      },
      costs: {
        materialCost: sourceLot.totalCost,
        sortingCost: Math.floor(sortedWeight * 15),
        grindingCost: Math.floor(groundWeight * 20),
        washingCost: Math.floor(finalWeight * 25),
        handlingCost: Math.floor(finalWeight * 5),
        logisticsCost: Math.floor(finalWeight * 8),
        dieselAllocation: Math.floor(finalWeight * 3),
        powerAllocation: Math.floor(finalWeight * 2),
        maintenanceCost: Math.floor(finalWeight * 4),
        chemicalsCost: Math.floor(finalWeight * 6),
        totalCost: 0,
        costPerKg: 0,
      },
      status: ['active', 'completed'][Math.floor(Math.random() * 2)] as 'active' | 'completed',
      createdBy: '4',
      createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
    });
    
    // Calculate total cost
    const batch = batches[i - 1];
    batch.costs.totalCost = 
      batch.costs.materialCost + 
      batch.costs.sortingCost + 
      batch.costs.grindingCost + 
      batch.costs.washingCost +
      batch.costs.handlingCost +
      batch.costs.logisticsCost +
      batch.costs.dieselAllocation +
      batch.costs.powerAllocation +
      batch.costs.maintenanceCost +
      batch.costs.chemicalsCost;
    batch.costs.costPerKg = Math.floor(batch.costs.totalCost / finalWeight);
  }
  return batches;
};

const MOCK_BATCHES = generateMockBatches();

// Generate trips
const MOCK_TRIPS: Trip[] = [
  { id: '1', tripNumber: 'TRIP-001', type: 'inbound', status: 'completed', vehicleNumber: 'LAG-123-AA', vehicleType: 'Truck', driverName: 'Kunle Adebayo', driverPhone: '08011110000', origin: 'Lagos', destination: 'Factory', fuelCost: 25000, driverWage: 15000, otherCosts: 5000, totalCost: 45000, linkedLotIds: ['lot-1', 'lot-2'], departureTime: '2024-01-15T08:00:00Z', arrivalTime: '2024-01-15T12:00:00Z', notes: '', createdBy: '7', createdAt: '2024-01-15' },
  { id: '2', tripNumber: 'TRIP-002', type: 'inbound', status: 'completed', vehicleNumber: 'IB-456-BB', vehicleType: 'Van', driverName: 'Bola Tinubu', driverPhone: '08022220000', origin: 'Ibadan', destination: 'Factory', fuelCost: 18000, driverWage: 12000, otherCosts: 3000, totalCost: 33000, linkedLotIds: ['lot-3'], departureTime: '2024-01-16T09:00:00Z', arrivalTime: '2024-01-16T13:00:00Z', notes: '', createdBy: '7', createdAt: '2024-01-16' },
  { id: '3', tripNumber: 'TRIP-003', type: 'outbound', status: 'in_transit', vehicleNumber: 'PH-789-CC', vehicleType: 'Truck', driverName: 'James Wilson', driverPhone: '08033330000', origin: 'Factory', destination: 'Port Harcourt', fuelCost: 35000, driverWage: 20000, otherCosts: 8000, totalCost: 63000, linkedDispatchId: '1', departureTime: '2024-01-20T06:00:00Z', notes: '', createdBy: '7', createdAt: '2024-01-20' },
];

// Generate handling events
const MOCK_HANDLING_EVENTS: HandlingEvent[] = [
  { id: '1', handlingTypeId: '1', direction: 'inbound', linkedType: 'lot', linkedId: 'lot-1', quantity: 1500, unit: 'kg', rate: 2, amount: 3000, paidTo: 'Emmanuel Adeyemi', paymentMethod: 'cash', isPaid: true, timestamp: '2024-01-15T12:30:00Z', notes: 'Offloading from TRIP-001', createdBy: '4', createdAt: '2024-01-15' },
  { id: '2', handlingTypeId: '5', direction: 'internal', linkedType: 'batch', linkedId: 'batch-1', quantity: 4, unit: 'hour', rate: 3000, amount: 12000, paidTo: 'Forklift Services Ltd', paymentMethod: 'transfer', isPaid: true, approvedBy: '4', approvedAt: '2024-01-16', timestamp: '2024-01-16T10:00:00Z', notes: 'Forklift for yard movement', createdBy: '4', createdAt: '2024-01-16' },
];

// Generate sorting operations
const MOCK_SORTING_OPERATIONS: SortingOperation[] = [
  { id: '1', batchId: 'batch-1', inputWeight: 1425, sortedPetWeight: 1311, capsWeight: 43, labelsWeight: 57, rejectsWeight: 14, yieldPercent: 92, rejectPercent: 1, byproductPercent: 7, teamLeader: 'Emmanuel Adeyemi', workerIds: ['1', '2', '5'], startTime: '2024-01-16T08:00:00Z', endTime: '2024-01-16T16:00:00Z', durationMinutes: 480, notes: 'Good quality material', createdBy: '5', createdAt: '2024-01-16' },
];

// Generate wage entries
const MOCK_WAGE_ENTRIES: WageEntry[] = [
  { id: '1', workerId: '1', policyId: '1', operationType: 'sorting', operationId: '1', quantity: 1311, rate: 50, amount: 65550, isTeamSplit: true, teamSize: 3, isPaid: true, paidAt: '2024-01-17', paidBy: '8', approvedBy: '5', approvedAt: '2024-01-16', periodStart: '2024-01-16', periodEnd: '2024-01-16', createdBy: '5', createdAt: '2024-01-16' },
];

// Generate expenses
const MOCK_EXPENSES: Expense[] = [
  { id: '1', category: 'diesel', amount: 75000, description: 'Diesel for generator - Week 1', receiptPhoto: '', allocatedTo: 'department', department: 'Production', isPaid: true, paidAt: '2024-01-08', expenseDate: '2024-01-08', createdBy: '8', createdAt: '2024-01-08' },
  { id: '2', category: 'maintenance', amount: 45000, description: 'Grinder blade replacement', receiptPhoto: '', allocatedTo: 'batch', batchId: 'batch-1', isPaid: true, paidAt: '2024-01-12', expenseDate: '2024-01-12', createdBy: '6', createdAt: '2024-01-12' },
  { id: '3', category: 'chemicals', amount: 32000, description: 'Caustic soda purchase', receiptPhoto: '', allocatedTo: 'batch', batchId: 'batch-2', isPaid: true, paidAt: '2024-01-14', expenseDate: '2024-01-14', createdBy: '6', createdAt: '2024-01-14' },
];

// Generate dispatches
const MOCK_DISPATCHES: Dispatch[] = [
  { id: '1', dispatchNumber: 'DISP-001', buyerId: '1', batchIds: ['batch-1'], totalWeight: 1245, pricePerKg: 450, totalValue: 560250, handlingCost: 6225, deliveryCost: 15000, totalCost: 21225, factoryWeight: 1245, buyerConfirmedWeight: 1240, varianceKg: -5, variancePercent: -0.4, status: 'in_transit', paymentStatus: 'pending', amountPaid: 0, profit: 0, profitMargin: 0, tripId: '3', dispatchedAt: '2024-01-20', notes: '', createdBy: '7', createdAt: '2024-01-20' },
];

// Calculate dispatch profit
MOCK_DISPATCHES.forEach(dispatch => {
  const batch = MOCK_BATCHES.find(b => b.id === dispatch.batchIds[0]);
  if (batch) {
    const costOfGoods = batch.costs.costPerKg * dispatch.totalWeight;
    dispatch.totalCost = costOfGoods + dispatch.handlingCost + dispatch.deliveryCost;
    dispatch.profit = dispatch.totalValue - dispatch.totalCost;
    dispatch.profitMargin = (dispatch.profit / dispatch.totalValue) * 100;
  }
});

// Generate alerts
const MOCK_ALERTS: Alert[] = [
  { id: '1', type: 'loss_threshold', severity: 'high', message: 'Batch BATCH-2024-0003 washing loss at 8% (threshold: 5%)', entityType: 'batch', entityId: 'batch-3', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isRead: false },
  { id: '2', type: 'margin_compression', severity: 'medium', message: 'Dispatch DISP-001 profit margin below 15%', entityType: 'dispatch', entityId: '1', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), isRead: false },
  { id: '3', type: 'low_stock', severity: 'low', message: 'Unsorted PET inventory below 5,000 kg threshold', createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), isRead: true },
];

// ============================================================================
// DATABASE SERVICE CLASS
// ============================================================================

class DatabaseService {
  private users = [...MOCK_USERS];
  private vendors = [...MOCK_VENDORS];
  private buyers = [...MOCK_BUYERS];
  private lots = [...MOCK_LOTS];
  private batches = [...MOCK_BATCHES];
  private trips = [...MOCK_TRIPS];
  private handlingTypes = [...MOCK_HANDLING_TYPES];
  private handlingEvents = [...MOCK_HANDLING_EVENTS];
  private workers = [...MOCK_WORKERS];
  private sortingOperations = [...MOCK_SORTING_OPERATIONS];
  private wageEntries = [...MOCK_WAGE_ENTRIES];
  private expenses = [...MOCK_EXPENSES];
  private dispatches = [...MOCK_DISPATCHES];
  private alerts = [...MOCK_ALERTS];
  private auditLogs: AuditLog[] = [];
  private currentUser: User | null = null;

  // ==========================================================================
  // AUTHENTICATION
  // ==========================================================================

  async login(credentials: LoginCredentials): Promise<User | null> {
    const user = this.users.find(u => u.email === credentials.email);
    if (user) {
      this.currentUser = user;
      user.lastLogin = new Date().toISOString();
      this.logAudit('login', 'user', user.id, {}, {});
      return user;
    }
    return null;
  }

  logout(): void {
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  hasRole(roles: UserRole[]): boolean {
    return this.currentUser ? roles.includes(this.currentUser.role) : false;
  }

  // ==========================================================================
  // AUDIT LOGGING
  // ==========================================================================

  private logAudit(
    action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'login',
    entityType: string,
    entityId: string,
    oldValue?: object,
    newValue?: object,
    reason?: string
  ): void {
    const log: AuditLog = {
      id: `audit-${Date.now()}`,
      action: action as any,
      entityType,
      entityId,
      oldValue: oldValue ? JSON.stringify(oldValue) : undefined,
      newValue: newValue ? JSON.stringify(newValue) : undefined,
      performedBy: this.currentUser?.id || 'system',
      performedAt: new Date().toISOString(),
      reason,
    };
    this.auditLogs.push(log);
  }

  // ==========================================================================
  // USERS
  // ==========================================================================

  async getUsers(): Promise<User[]> {
    return this.users.filter(u => u.isActive);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.logAudit('create', 'user', newUser.id, {}, newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    const oldValue = { ...this.users[index] };
    this.users[index] = { ...this.users[index], ...updates };
    this.logAudit('update', 'user', id, oldValue, this.users[index]);
    return this.users[index];
  }

  // ==========================================================================
  // AUDIT LOGS
  // ==========================================================================

  async getAuditLogs(): Promise<AuditLog[]> {
    return this.auditLogs
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
      .map(log => ({
        ...log,
        performedByUser: this.users.find(u => u.id === log.performedBy),
      }));
  }

  // ==========================================================================
  // VENDORS
  // ==========================================================================

  async getVendors(): Promise<Vendor[]> {
    return this.vendors.filter(v => v.isActive);
  }

  async getVendorById(id: string): Promise<Vendor | undefined> {
    return this.vendors.find(v => v.id === id);
  }

  async createVendor(vendor: Omit<Vendor, 'id' | 'createdAt' | 'totalTransactions' | 'totalKgPurchased'>): Promise<Vendor> {
    const newVendor: Vendor = {
      ...vendor,
      id: `vendor-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalTransactions: 0,
      totalKgPurchased: 0,
    };
    this.vendors.push(newVendor);
    this.logAudit('create', 'vendor', newVendor.id, {}, newVendor);
    return newVendor;
  }

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | undefined> {
    const index = this.vendors.findIndex(v => v.id === id);
    if (index === -1) return undefined;
    
    const oldValue = { ...this.vendors[index] };
    this.vendors[index] = { ...this.vendors[index], ...updates };
    this.logAudit('update', 'vendor', id, oldValue, this.vendors[index]);
    return this.vendors[index];
  }

  // ==========================================================================
  // BUYERS
  // ==========================================================================

  async getBuyers(): Promise<Buyer[]> {
    return this.buyers.filter(b => b.isActive);
  }

  async getBuyerById(id: string): Promise<Buyer | undefined> {
    return this.buyers.find(b => b.id === id);
  }

  async createBuyer(buyer: Omit<Buyer, 'id' | 'createdAt' | 'totalTransactions' | 'totalKgSold'>): Promise<Buyer> {
    const newBuyer: Buyer = {
      ...buyer,
      id: `buyer-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalTransactions: 0,
      totalKgSold: 0,
    };
    this.buyers.push(newBuyer);
    this.logAudit('create', 'buyer', newBuyer.id, {}, newBuyer);
    return newBuyer;
  }

  // ==========================================================================
  // PURCHASE LOTS
  // ==========================================================================

  async getLots(): Promise<PurchaseLot[]> {
    return this.lots.map(lot => ({
      ...lot,
      vendor: this.vendors.find(v => v.id === lot.vendorId),
    }));
  }

  async getLotById(id: string): Promise<PurchaseLot | undefined> {
    const lot = this.lots.find(l => l.id === id);
    if (lot) {
      return { ...lot, vendor: this.vendors.find(v => v.id === lot.vendorId) };
    }
    return undefined;
  }

  async getLotsByVendor(vendorId: string): Promise<PurchaseLot[]> {
    return this.lots
      .filter(l => l.vendorId === vendorId)
      .map(lot => ({ ...lot, vendor: this.vendors.find(v => v.id === lot.vendorId) }));
  }

  async createLot(input: CreateLotInput): Promise<PurchaseLot> {
    const vendor = await this.getVendorById(input.vendorId);
    if (!vendor) throw new Error('Vendor not found');

    const netWeight = input.grossWeight - input.tareWeight;
    const moistureDeduction = netWeight * (input.moistureAdjustment / 100);
    const contaminationDeduction = netWeight * (input.contaminationAdjustment / 100);
    const adjustedWeight = netWeight - moistureDeduction - contaminationDeduction;
    
    const finalPricePerKg = input.basePricePerKg + input.gradeAdjustment;
    const totalCost = adjustedWeight * finalPricePerKg;

    const newLot: PurchaseLot = {
      id: `lot-${Date.now()}`,
      lotNumber: `LOT-${new Date().getFullYear()}-${String(this.lots.length + 1).padStart(4, '0')}`,
      vendorId: input.vendorId,
      materialType: input.materialType,
      grade: input.grade,
      grossWeight: input.grossWeight,
      tareWeight: input.tareWeight,
      netWeight: adjustedWeight,
      basePricePerKg: input.basePricePerKg,
      gradeAdjustment: input.gradeAdjustment,
      moistureAdjustment: input.moistureAdjustment,
      contaminationAdjustment: input.contaminationAdjustment,
      finalPricePerKg,
      totalCost,
      paymentStatus: 'pending',
      amountPaid: 0,
      notes: input.notes,
      createdBy: this.currentUser?.id || 'system',
      createdAt: new Date().toISOString(),
      handlingCosts: 0,
      logisticsCosts: 0,
      landedCostPerKg: finalPricePerKg,
    };

    this.lots.push(newLot);
    
    // Update vendor stats
    vendor.totalTransactions++;
    vendor.totalKgPurchased += adjustedWeight;
    
    this.logAudit('create', 'lot', newLot.id, {}, newLot);
    return { ...newLot, vendor };
  }

  async updateLotPayment(id: string, amount: number): Promise<PurchaseLot | undefined> {
    const lot = this.lots.find(l => l.id === id);
    if (!lot) return undefined;

    const oldValue = { ...lot };
    lot.amountPaid += amount;
    
    if (lot.amountPaid >= lot.totalCost) {
      lot.paymentStatus = 'paid';
    } else if (lot.amountPaid > 0) {
      lot.paymentStatus = 'partial';
    }

    this.logAudit('update', 'lot', id, oldValue, lot, 'Payment update');
    return { ...lot, vendor: this.vendors.find(v => v.id === lot.vendorId) };
  }

  // ==========================================================================
  // BATCHES
  // ==========================================================================

  async getBatches(): Promise<Batch[]> {
    return this.batches.map(batch => ({
      ...batch,
      sourceLots: this.lots.filter(l => batch.sourceLotIds.includes(l.id)),
    }));
  }

  async getBatchById(id: string): Promise<Batch | undefined> {
    const batch = this.batches.find(b => b.id === id);
    if (batch) {
      return {
        ...batch,
        sourceLots: this.lots.filter(l => batch.sourceLotIds.includes(l.id)),
      };
    }
    return undefined;
  }

  async createBatch(input: CreateBatchInput): Promise<Batch> {
    const sourceLots = this.lots.filter(l => input.sourceLotIds.includes(l.id));
    if (sourceLots.length === 0) throw new Error('No valid lots found');

    const materialCost = sourceLots.reduce((sum, lot) => sum + lot.totalCost, 0);

    const newBatch: Batch = {
      id: `batch-${Date.now()}`,
      batchNumber: `BATCH-${new Date().getFullYear()}-${String(this.batches.length + 1).padStart(4, '0')}`,
      sourceLotIds: input.sourceLotIds,
      currentState: 'unsorted_pet',
      weights: {
        initialWeight: input.initialWeight,
        sortedPetWeight: 0,
        capsWeight: 0,
        labelsWeight: 0,
        sortingRejectsWeight: 0,
        groundFlakesWeight: 0,
        washedFlakesWeight: 0,
        dewateredFlakesWeight: 0,
        finalDryFlakesWeight: 0,
        sortingYieldPercent: 0,
        grindingYieldPercent: 0,
        washingLossPercent: 0,
        totalYieldPercent: 0,
      },
      costs: {
        materialCost,
        sortingCost: 0,
        grindingCost: 0,
        washingCost: 0,
        handlingCost: 0,
        logisticsCost: 0,
        dieselAllocation: 0,
        powerAllocation: 0,
        maintenanceCost: 0,
        chemicalsCost: 0,
        totalCost: materialCost,
        costPerKg: Math.floor(materialCost / input.initialWeight),
      },
      status: 'active',
      createdBy: this.currentUser?.id || 'system',
      createdAt: new Date().toISOString(),
    };

    this.batches.push(newBatch);
    this.logAudit('create', 'batch', newBatch.id, {}, newBatch);
    return { ...newBatch, sourceLots };
  }

  async updateBatchWeights(id: string, weights: Partial<Batch['weights']>): Promise<Batch | undefined> {
    const batch = this.batches.find(b => b.id === id);
    if (!batch) return undefined;

    const oldValue = { ...batch.weights };
    batch.weights = { ...batch.weights, ...weights };
    
    // Recalculate yields
    if (batch.weights.sortedPetWeight > 0) {
      batch.weights.sortingYieldPercent = (batch.weights.sortedPetWeight / batch.weights.initialWeight) * 100;
    }
    if (batch.weights.groundFlakesWeight > 0 && batch.weights.sortedPetWeight > 0) {
      batch.weights.grindingYieldPercent = (batch.weights.groundFlakesWeight / batch.weights.sortedPetWeight) * 100;
    }
    if (batch.weights.finalDryFlakesWeight > 0 && batch.weights.groundFlakesWeight > 0) {
      batch.weights.washingLossPercent = ((batch.weights.groundFlakesWeight - batch.weights.finalDryFlakesWeight) / batch.weights.groundFlakesWeight) * 100;
      batch.weights.totalYieldPercent = (batch.weights.finalDryFlakesWeight / batch.weights.initialWeight) * 100;
    }

    this.logAudit('update', 'batch', id, oldValue, batch.weights, 'Weight update');
    return this.getBatchById(id);
  }

  // ==========================================================================
  // TRIPS
  // ==========================================================================

  async getTrips(): Promise<Trip[]> {
    return this.trips;
  }

  async getTripById(id: string): Promise<Trip | undefined> {
    return this.trips.find(t => t.id === id);
  }

  async createTrip(trip: Omit<Trip, 'id' | 'createdAt'>): Promise<Trip> {
    const newTrip: Trip = {
      ...trip,
      id: `trip-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.trips.push(newTrip);
    this.logAudit('create', 'trip', newTrip.id, {}, newTrip);
    return newTrip;
  }

  async updateTripStatus(id: string, status: Trip['status']): Promise<Trip | undefined> {
    const trip = this.trips.find(t => t.id === id);
    if (!trip) return undefined;

    const oldValue = { ...trip };
    trip.status = status;
    
    if (status === 'arrived' || status === 'completed') {
      trip.arrivalTime = new Date().toISOString();
    }

    this.logAudit('update', 'trip', id, oldValue, trip, 'Status update');
    return trip;
  }

  // ==========================================================================
  // HANDLING
  // ==========================================================================

  async getHandlingTypes(): Promise<HandlingType[]> {
    return this.handlingTypes.filter(ht => ht.isActive);
  }

  async getHandlingEvents(): Promise<HandlingEvent[]> {
    return this.handlingEvents.map(event => ({
      ...event,
      handlingType: this.handlingTypes.find(ht => ht.id === event.handlingTypeId),
    }));
  }

  async createHandlingEvent(event: Omit<HandlingEvent, 'id' | 'createdAt' | 'amount'>): Promise<HandlingEvent> {
    const amount = event.quantity * event.rate;
    
    const newEvent: HandlingEvent = {
      ...event,
      id: `handling-${Date.now()}`,
      amount,
      createdAt: new Date().toISOString(),
    };
    
    this.handlingEvents.push(newEvent);
    
    // Update linked entity costs
    if (event.linkedType === 'lot') {
      const lot = this.lots.find(l => l.id === event.linkedId);
      if (lot) {
        lot.handlingCosts += amount;
        lot.landedCostPerKg = (lot.totalCost + lot.handlingCosts + lot.logisticsCosts) / lot.netWeight;
      }
    } else if (event.linkedType === 'batch') {
      const batch = this.batches.find(b => b.id === event.linkedId);
      if (batch) {
        batch.costs.handlingCost += amount;
        this.recalculateBatchCosts(batch);
      }
    } else if (event.linkedType === 'dispatch') {
      const dispatch = this.dispatches.find(d => d.id === event.linkedId);
      if (dispatch) {
        dispatch.handlingCost += amount;
        dispatch.totalCost += amount;
        dispatch.profit = dispatch.totalValue - dispatch.totalCost;
        dispatch.profitMargin = (dispatch.profit / dispatch.totalValue) * 100;
      }
    }
    
    this.logAudit('create', 'handling_event', newEvent.id, {}, newEvent);
    return { ...newEvent, handlingType: this.handlingTypes.find(ht => ht.id === event.handlingTypeId) };
  }

  private recalculateBatchCosts(batch: Batch): void {
    batch.costs.totalCost = 
      batch.costs.materialCost + 
      batch.costs.sortingCost + 
      batch.costs.grindingCost + 
      batch.costs.washingCost +
      batch.costs.handlingCost +
      batch.costs.logisticsCost +
      batch.costs.dieselAllocation +
      batch.costs.powerAllocation +
      batch.costs.maintenanceCost +
      batch.costs.chemicalsCost;
    
    const finalWeight = batch.weights.finalDryFlakesWeight || batch.weights.groundFlakesWeight || batch.weights.sortedPetWeight;
    if (finalWeight > 0) {
      batch.costs.costPerKg = Math.floor(batch.costs.totalCost / finalWeight);
    }
  }

  // ==========================================================================
  // WORKERS
  // ==========================================================================

  async getWorkers(): Promise<Worker[]> {
    return this.workers.filter(w => w.isActive);
  }

  async getWorkerById(id: string): Promise<Worker | undefined> {
    return this.workers.find(w => w.id === id);
  }

  async createWorker(worker: Omit<Worker, 'id' | 'joinedAt' | 'totalKgSorted' | 'totalWagesEarned'>): Promise<Worker> {
    const newWorker: Worker = {
      ...worker,
      id: `worker-${Date.now()}`,
      joinedAt: new Date().toISOString(),
      totalKgSorted: 0,
      totalWagesEarned: 0,
    };
    this.workers.push(newWorker);
    this.logAudit('create', 'worker', newWorker.id, {}, newWorker);
    return newWorker;
  }

  // ==========================================================================
  // SORTING OPERATIONS
  // ==========================================================================

  async getSortingOperations(): Promise<SortingOperation[]> {
    return this.sortingOperations.map(op => ({
      ...op,
      batch: this.batches.find(b => b.id === op.batchId),
      workers: this.workers.filter(w => op.workerIds.includes(w.id)),
    }));
  }

  async createSortingOperation(input: CreateSortingInput): Promise<SortingOperation> {
    const batch = await this.getBatchById(input.batchId);
    if (!batch) throw new Error('Batch not found');

    const yieldPercent = (input.sortedPetWeight / input.inputWeight) * 100;
    const rejectPercent = (input.rejectsWeight / input.inputWeight) * 100;
    const byproductPercent = ((input.capsWeight + input.labelsWeight) / input.inputWeight) * 100;

    const newOperation: SortingOperation = {
      id: `sorting-${Date.now()}`,
      batchId: input.batchId,
      inputWeight: input.inputWeight,
      sortedPetWeight: input.sortedPetWeight,
      capsWeight: input.capsWeight,
      labelsWeight: input.labelsWeight,
      rejectsWeight: input.rejectsWeight,
      yieldPercent,
      rejectPercent,
      byproductPercent,
      teamLeader: this.workers.find(w => w.id === input.workerIds[0])?.name || '',
      workerIds: input.workerIds,
      startTime: input.startTime,
      endTime: input.endTime,
      durationMinutes: Math.floor((new Date(input.endTime).getTime() - new Date(input.startTime).getTime()) / 60000),
      notes: input.notes,
      createdBy: this.currentUser?.id || 'system',
      createdAt: new Date().toISOString(),
    };

    this.sortingOperations.push(newOperation);

    // Update batch weights
    await this.updateBatchWeights(input.batchId, {
      sortedPetWeight: input.sortedPetWeight,
      capsWeight: input.capsWeight,
      labelsWeight: input.labelsWeight,
      sortingRejectsWeight: input.rejectsWeight,
    });

    // Update batch state
    batch.currentState = 'sorted_pet';

    // Update worker stats
    input.workerIds.forEach(workerId => {
      const worker = this.workers.find(w => w.id === workerId);
      if (worker) {
        worker.totalKgSorted += input.sortedPetWeight / input.workerIds.length;
      }
    });

    this.logAudit('create', 'sorting_operation', newOperation.id, {}, newOperation);
    return { 
      ...newOperation, 
      batch,
      workers: this.workers.filter(w => input.workerIds.includes(w.id)),
    };
  }

  // ==========================================================================
  // WAGE ENTRIES
  // ==========================================================================

  async getWageEntries(): Promise<WageEntry[]> {
    return this.wageEntries.map(entry => ({
      ...entry,
      worker: this.workers.find(w => w.id === entry.workerId),
    }));
  }

  async createWageEntry(entry: Omit<WageEntry, 'id' | 'createdAt'>): Promise<WageEntry> {
    const newEntry: WageEntry = {
      ...entry,
      id: `wage-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    this.wageEntries.push(newEntry);
    
    // Update worker earnings
    const worker = this.workers.find(w => w.id === entry.workerId);
    if (worker) {
      worker.totalWagesEarned += entry.amount;
    }
    
    this.logAudit('create', 'wage_entry', newEntry.id, {}, newEntry);
    return { ...newEntry, worker };
  }

  // ==========================================================================
  // EXPENSES
  // ==========================================================================

  async getExpenses(): Promise<Expense[]> {
    return this.expenses;
  }

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const newExpense: Expense = {
      ...expense,
      id: `expense-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    this.expenses.push(newExpense);
    
    // Allocate to batch if specified
    if (expense.allocatedTo === 'batch' && expense.batchId) {
      const batch = this.batches.find(b => b.id === expense.batchId);
      if (batch) {
        switch (expense.category) {
          case 'maintenance':
            batch.costs.maintenanceCost += expense.amount;
            break;
          case 'chemicals':
            batch.costs.chemicalsCost += expense.amount;
            break;
          case 'diesel':
            batch.costs.dieselAllocation += expense.amount;
            break;
          case 'power':
            batch.costs.powerAllocation += expense.amount;
            break;
        }
        this.recalculateBatchCosts(batch);
      }
    }
    
    this.logAudit('create', 'expense', newExpense.id, {}, newExpense);
    return newExpense;
  }

  // ==========================================================================
  // DISPATCHES
  // ==========================================================================

  async getDispatches(): Promise<Dispatch[]> {
    return this.dispatches.map(dispatch => ({
      ...dispatch,
      buyer: this.buyers.find(b => b.id === dispatch.buyerId),
      batches: this.batches.filter(b => dispatch.batchIds.includes(b.id)),
      trip: this.trips.find(t => t.id === dispatch.tripId),
    }));
  }

  async getDispatchById(id: string): Promise<Dispatch | undefined> {
    const dispatch = this.dispatches.find(d => d.id === id);
    if (dispatch) {
      return {
        ...dispatch,
        buyer: this.buyers.find(b => b.id === dispatch.buyerId),
        batches: this.batches.filter(b => dispatch.batchIds.includes(b.id)),
        trip: this.trips.find(t => t.id === dispatch.tripId),
      };
    }
    return undefined;
  }

  async createDispatch(input: CreateDispatchInput): Promise<Dispatch> {
    const buyer = await this.getBuyerById(input.buyerId);
    if (!buyer) throw new Error('Buyer not found');

    const batches = this.batches.filter(b => input.batchIds.includes(b.id));
    if (batches.length === 0) throw new Error('No valid batches found');

    const totalValue = input.factoryWeight * input.pricePerKg;
    
    // Calculate cost of goods
    let costOfGoods = 0;
    batches.forEach(batch => {
      const batchWeight = batch.weights.finalDryFlakesWeight || batch.weights.groundFlakesWeight;
      const weightRatio = batchWeight / input.factoryWeight;
      costOfGoods += batch.costs.totalCost * weightRatio;
    });

    const totalCost = costOfGoods + input.handlingCost + input.deliveryCost;
    const profit = totalValue - totalCost;
    const profitMargin = (profit / totalValue) * 100;

    const newDispatch: Dispatch = {
      id: `dispatch-${Date.now()}`,
      dispatchNumber: `DISP-${new Date().getFullYear()}-${String(this.dispatches.length + 1).padStart(4, '0')}`,
      buyerId: input.buyerId,
      batchIds: input.batchIds,
      totalWeight: input.factoryWeight,
      pricePerKg: input.pricePerKg,
      totalValue,
      handlingCost: input.handlingCost,
      deliveryCost: input.deliveryCost,
      totalCost,
      factoryWeight: input.factoryWeight,
      buyerConfirmedWeight: 0,
      varianceKg: 0,
      variancePercent: 0,
      status: 'preparing',
      paymentStatus: 'pending',
      amountPaid: 0,
      profit,
      profitMargin,
      tripId: input.tripId,
      dispatchedAt: new Date().toISOString(),
      notes: '',
      createdBy: this.currentUser?.id || 'system',
      createdAt: new Date().toISOString(),
    };

    this.dispatches.push(newDispatch);
    
    // Update batch status
    batches.forEach(batch => {
      batch.status = 'dispatched';
    });
    
    // Update buyer stats
    buyer.totalTransactions++;
    buyer.totalKgSold += input.factoryWeight;
    
    this.logAudit('create', 'dispatch', newDispatch.id, {}, newDispatch);
    return { 
      ...newDispatch, 
      buyer,
      batches,
      trip: input.tripId ? this.trips.find(t => t.id === input.tripId) : undefined,
    };
  }

  async confirmBuyerWeight(id: string, confirmedWeight: number): Promise<Dispatch | undefined> {
    const dispatch = this.dispatches.find(d => d.id === id);
    if (!dispatch) return undefined;

    const oldValue = { ...dispatch };
    
    dispatch.buyerConfirmedWeight = confirmedWeight;
    dispatch.varianceKg = confirmedWeight - dispatch.factoryWeight;
    dispatch.variancePercent = (dispatch.varianceKg / dispatch.factoryWeight) * 100;
    dispatch.status = 'confirmed';
    dispatch.confirmedAt = new Date().toISOString();

    // Adjust total value based on confirmed weight
    const originalValue = dispatch.totalValue;
    dispatch.totalValue = confirmedWeight * dispatch.pricePerKg;
    dispatch.profit = dispatch.totalValue - dispatch.totalCost;
    dispatch.profitMargin = (dispatch.profit / dispatch.totalValue) * 100;

    this.logAudit('update', 'dispatch', id, oldValue, dispatch, 'Buyer weight confirmation');
    return this.getDispatchById(id);
  }

  // ==========================================================================
  // ALERTS
  // ==========================================================================

  async getAlerts(): Promise<Alert[]> {
    return this.alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUnreadAlerts(): Promise<Alert[]> {
    return this.alerts.filter(a => !a.isRead).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markAlertAsRead(id: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.isRead = true;
    }
  }

  async createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert> {
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.alerts.push(newAlert);
    return newAlert;
  }

  // ==========================================================================
  // DASHBOARD & REPORTS
  // ==========================================================================

  async getDashboardKPIs() {
    const totalInput = this.lots.reduce((sum, lot) => sum + lot.netWeight, 0);
    const totalOutput = this.dispatches.reduce((sum, d) => sum + (d.buyerConfirmedWeight || d.factoryWeight), 0);
    const overallYield = totalInput > 0 ? (totalOutput / totalInput) * 100 : 0;

    const revenue = this.dispatches.reduce((sum, d) => sum + d.totalValue, 0);
    const totalCosts = 
      this.lots.reduce((sum, lot) => sum + lot.totalCost, 0) +
      this.expenses.reduce((sum, e) => sum + e.amount, 0) +
      this.trips.reduce((sum, t) => sum + t.totalCost, 0) +
      this.handlingEvents.reduce((sum, h) => sum + h.amount, 0);
    
    const grossProfit = revenue - totalCosts;
    const avgCostPerKg = totalOutput > 0 ? totalCosts / totalOutput : 0;

    // Stock on hand by state
    const stockOnHand: Record<InventoryState, number> = {
      unsorted_pet: 0,
      sorted_pet: 0,
      caps: 0,
      labels: 0,
      ground_flakes: 0,
      washed_flakes: 0,
      final_flakes: 0,
      rejects: 0,
    };

    this.batches.forEach(batch => {
      if (batch.status !== 'dispatched') {
        stockOnHand[batch.currentState] += batch.weights.finalDryFlakesWeight || 
                                           batch.weights.groundFlakesWeight || 
                                           batch.weights.sortedPetWeight || 
                                           batch.weights.initialWeight;
      }
    });

    const activeWorkers = this.workers.filter(w => w.isActive).length;
    const todayWages = this.wageEntries
      .filter(w => new Date(w.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, w) => sum + w.amount, 0);
    
    const avgProductivity = this.workers.reduce((sum, w) => sum + (w.totalKgSorted / (w.totalWagesEarned / 50 || 1)), 0) / (this.workers.length || 1);

    return {
      totalInputKg: totalInput,
      totalOutputKg: totalOutput,
      overallYield,
      revenue,
      totalCosts,
      grossProfit,
      avgCostPerKg,
      stockOnHand,
      activeWorkers,
      totalWagesToday: todayWages,
      avgProductivity,
      alerts: await this.getUnreadAlerts(),
    };
  }

  async getProductionReport(startDate: string, endDate: string) {
    const batches = this.batches.filter(b => {
      const created = new Date(b.createdAt);
      return created >= new Date(startDate) && created <= new Date(endDate);
    });

    const totalInput = batches.reduce((sum, b) => sum + b.weights.initialWeight, 0);
    const totalOutput = batches.reduce((sum, b) => sum + (b.weights.finalDryFlakesWeight || b.weights.groundFlakesWeight || 0), 0);

    return {
      period: `${startDate} to ${endDate}`,
      batches,
      totalInput,
      totalOutput,
      yieldByStage: {
        sorting: batches.reduce((sum, b) => sum + b.weights.sortingYieldPercent, 0) / (batches.length || 1),
        grinding: batches.reduce((sum, b) => sum + b.weights.grindingYieldPercent, 0) / (batches.length || 1),
        washing: batches.reduce((sum, b) => sum + b.weights.washingLossPercent, 0) / (batches.length || 1),
      },
    };
  }

  async getFinancialReport(startDate: string, endDate: string) {
    const dispatches = this.dispatches.filter(d => {
      const created = new Date(d.createdAt);
      return created >= new Date(startDate) && created <= new Date(endDate);
    });

    const expenses = this.expenses.filter(e => {
      const created = new Date(e.createdAt);
      return created >= new Date(startDate) && created <= new Date(endDate);
    });

    const revenue = dispatches.reduce((sum, d) => sum + d.totalValue, 0);
    const materialCosts = this.lots.reduce((sum, l) => sum + l.totalCost, 0);
    const labourCosts = expenses.filter(e => e.category === 'labour').reduce((sum, e) => sum + e.amount, 0);
    const logisticsCosts = this.trips.reduce((sum, t) => sum + t.totalCost, 0) + expenses.filter(e => e.category === 'logistics').reduce((sum, e) => sum + e.amount, 0);
    const handlingCosts = this.handlingEvents.reduce((sum, h) => sum + h.amount, 0);
    const otherCosts = expenses.filter(e => !['labour', 'logistics'].includes(e.category)).reduce((sum, e) => sum + e.amount, 0);

    const totalCosts = materialCosts + labourCosts + logisticsCosts + handlingCosts + otherCosts;
    const grossProfit = revenue - totalCosts;

    return {
      period: `${startDate} to ${endDate}`,
      revenue,
      materialCosts,
      labourCosts,
      logisticsCosts,
      handlingCosts,
      otherCosts,
      grossProfit,
      netProfit: grossProfit,
      costPerKg: revenue > 0 ? totalCosts / (revenue / 400) : 0, // Approximate
    };
  }

  // ==========================================================================
  // TICKETS - Production Problem Solving
  // ==========================================================================

  private tickets: Ticket[] = [
    {
      id: 'ticket-1',
      ticketNumber: 'TKT-001',
      title: 'Grinder blade worn out',
      description: 'Main grinder showing reduced output. Blade needs replacement.',
      category: 'equipment_failure',
      priority: 'high',
      status: 'in_progress',
      linkedBatchId: 'batch-1',
      assignedTo: '6',
      comments: [
        { id: 'c1', text: 'Ordered new blade from supplier', userId: '6', userName: 'Production Supervisor', timestamp: '2024-01-16T10:00:00Z' },
      ],
      createdBy: '6',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-16T10:00:00Z',
    },
    {
      id: 'ticket-2',
      ticketNumber: 'TKT-002',
      title: 'Water pressure low in wash line',
      description: 'Water pressure dropped below operational level. Check pump.',
      category: 'maintenance',
      priority: 'medium',
      status: 'open',
      comments: [],
      createdBy: '6',
      createdAt: '2024-01-17T09:30:00Z',
    },
    {
      id: 'ticket-3',
      ticketNumber: 'TKT-003',
      title: 'Sorting yield below target',
      description: 'Batch BATCH-2024-0005 showing 85% yield vs target 92%.',
      category: 'quality_issue',
      priority: 'critical',
      status: 'resolved',
      linkedBatchId: 'batch-3',
      assignedTo: '5',
      comments: [
        { id: 'c2', text: 'Investigating material quality', userId: '5', userName: 'Sorting Supervisor', timestamp: '2024-01-14T11:00:00Z' },
        { id: 'c3', text: 'Issue traced to contaminated input lot', userId: '5', userName: 'Sorting Supervisor', timestamp: '2024-01-15T14:00:00Z' },
      ],
      resolution: 'Contaminated lot identified and separated. Future lots require pre-inspection.',
      resolvedAt: '2024-01-15T14:00:00Z',
      resolvedBy: '5',
      createdBy: '5',
      createdAt: '2024-01-14T10:00:00Z',
      updatedAt: '2024-01-15T14:00:00Z',
    },
  ];

  async getTickets(): Promise<Ticket[]> {
    return this.tickets.map(ticket => ({
      ...ticket,
      createdByUser: this.users.find(u => u.id === ticket.createdBy),
      assignedToUser: this.users.find(u => u.id === ticket.assignedTo),
      linkedBatch: this.batches.find(b => b.id === ticket.linkedBatchId),
      comments: ticket.comments?.map(c => ({
        ...c,
        userName: c.userName || this.users.find(u => u.id === c.userId)?.name || 'Unknown',
      })),
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTicketById(id: string): Promise<Ticket | undefined> {
    const ticket = this.tickets.find(t => t.id === id);
    if (ticket) {
      return {
        ...ticket,
        createdByUser: this.users.find(u => u.id === ticket.createdBy),
        assignedToUser: this.users.find(u => u.id === ticket.assignedTo),
        linkedBatch: this.batches.find(b => b.id === ticket.linkedBatchId),
        comments: ticket.comments?.map(c => ({
          ...c,
          userName: c.userName || this.users.find(u => u.id === c.userId)?.name || 'Unknown',
        })),
      };
    }
    return undefined;
  }

  async createTicket(ticket: Omit<Ticket, 'id' | 'ticketNumber' | 'status' | 'createdAt' | 'comments'>): Promise<Ticket> {
    const newTicket: Ticket = {
      ...ticket,
      id: `ticket-${Date.now()}`,
      ticketNumber: `TKT-${String(this.tickets.length + 1).padStart(3, '0')}`,
      status: 'open',
      comments: [],
      createdAt: new Date().toISOString(),
    };
    this.tickets.push(newTicket);
    this.logAudit('create', 'ticket', newTicket.id, {}, newTicket);
    
    // Create alert for critical/high priority
    if (ticket.priority === 'critical' || ticket.priority === 'high') {
      this.createAlert({
        type: 'ticket_created',
        severity: ticket.priority === 'critical' ? 'critical' : 'high',
        message: `New ${ticket.priority} priority ticket: ${ticket.title}`,
        entityType: 'ticket',
        entityId: newTicket.id,
        isRead: false,
      });
    }
    
    return this.getTicketById(newTicket.id)!;
  }

  async updateTicketStatus(id: string, status: Ticket['status'], userId: string): Promise<Ticket | undefined> {
    const ticket = this.tickets.find(t => t.id === id);
    if (!ticket) return undefined;

    const oldStatus = ticket.status;
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    
    if (status === 'resolved') {
      ticket.resolvedAt = new Date().toISOString();
      ticket.resolvedBy = userId;
    }

    this.logAudit('update', 'ticket', id, { status: oldStatus }, { status }, `Status changed to ${status}`);
    return this.getTicketById(id);
  }

  async addTicketComment(ticketId: string, comment: Omit<TicketComment, 'id'>): Promise<Ticket | undefined> {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) return undefined;

    const newComment: TicketComment = {
      ...comment,
      id: `comment-${Date.now()}`,
    };
    
    if (!ticket.comments) ticket.comments = [];
    ticket.comments.push(newComment);
    ticket.updatedAt = new Date().toISOString();

    this.logAudit('update', 'ticket', ticketId, {}, { commentAdded: true }, 'Comment added');
    return this.getTicketById(ticketId);
  }

  // ==========================================================================
  // UTILITY
  // ==========================================================================

  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  formatCurrency(amount: number): string {
    return `₦${amount.toLocaleString('en-NG')}`;
  }

  formatWeight(kg: number): string {
    return `${kg.toLocaleString('en-NG')} kg`;
  }
}

// Export singleton instance
export const db = new DatabaseService();

