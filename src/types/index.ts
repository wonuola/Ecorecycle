// ============================================================================
// RECYCLING FACTORY MANAGEMENT SYSTEM - TYPE DEFINITIONS
// ============================================================================

// ----------------------------------------------------------------------------
// USER & AUTHENTICATION
// ----------------------------------------------------------------------------

export type UserRole = 
  | 'admin' 
  | 'owner' 
  | 'procurement' 
  | 'warehouse_officer' 
  | 'sorting_supervisor' 
  | 'production_supervisor' 
  | 'logistics_officer' 
  | 'finance' 
  | 'auditor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ----------------------------------------------------------------------------
// VENDOR & BUYER
// ----------------------------------------------------------------------------

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  location: string;
  materialTypes: MaterialType[];
  reliabilityScore: number; // 0-100
  notes?: string;
  isActive: boolean;
  createdAt: string;
  totalTransactions: number;
  totalKgPurchased: number;
}

export interface Buyer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  location: string;
  pricingHistory: BuyerPricing[];
  isActive: boolean;
  createdAt: string;
  totalTransactions: number;
  totalKgSold: number;
}

export interface BuyerPricing {
  id: string;
  buyerId: string;
  materialType: MaterialType;
  pricePerKg: number;
  effectiveDate: string;
  endDate?: string;
}

// ----------------------------------------------------------------------------
// MATERIAL TYPES & GRADES
// ----------------------------------------------------------------------------

export type MaterialType = 'PET' | 'HDPE' | 'PP' | 'LDPE' | 'PVC' | 'MIXED';

export type MaterialGrade = 'A' | 'B' | 'C';

export type InventoryState = 
  | 'unsorted_pet'
  | 'sorted_pet'
  | 'caps'
  | 'labels'
  | 'ground_flakes'
  | 'washed_flakes'
  | 'final_flakes'
  | 'rejects';

// ----------------------------------------------------------------------------
// PURCHASE LOT
// ----------------------------------------------------------------------------

export interface PurchaseLot {
  id: string;
  lotNumber: string;
  vendorId: string;
  vendor?: Vendor;
  materialType: MaterialType;
  grade: MaterialGrade;
  
  // Weight measurements
  grossWeight: number; // kg
  tareWeight: number; // kg
  netWeight: number; // kg (calculated)
  
  // Pricing
  basePricePerKg: number;
  gradeAdjustment: number; // +/- naira
  moistureAdjustment: number; // percentage deduction
  contaminationAdjustment: number; // percentage deduction
  finalPricePerKg: number;
  totalCost: number;
  
  // Status
  paymentStatus: 'pending' | 'partial' | 'paid';
  amountPaid: number;
  
  // Links
  tripId?: string;
  
  // Metadata
  receiptPhoto?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  
  // Cost tracking (accumulated)
  handlingCosts: number;
  logisticsCosts: number;
  landedCostPerKg: number; // total cost / netWeight
}

// ----------------------------------------------------------------------------
// BATCH (Production Unit)
// ----------------------------------------------------------------------------

export interface Batch {
  id: string;
  batchNumber: string;
  sourceLotIds: string[]; // Can merge multiple lots
  sourceLots?: PurchaseLot[];
  
  // Current state
  currentState: InventoryState;
  
  // Weight tracking at each stage
  weights: BatchWeights;
  
  // Costs accumulated
  costs: BatchCosts;
  
  // Status
  status: 'active' | 'completed' | 'dispatched';
  
  // Metadata
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

export interface BatchWeights {
  // Input
  initialWeight: number;
  
  // Sorting outputs
  sortedPetWeight: number;
  capsWeight: number;
  labelsWeight: number;
  sortingRejectsWeight: number;
  
  // Grinding output
  groundFlakesWeight: number;
  
  // Washing outputs
  washedFlakesWeight: number;
  dewateredFlakesWeight: number;
  finalDryFlakesWeight: number;
  
  // Calculated yields
  sortingYieldPercent: number;
  grindingYieldPercent: number;
  washingLossPercent: number;
  totalYieldPercent: number;
}

export interface BatchCosts {
  // Material cost (from lots)
  materialCost: number;
  
  // Processing costs
  sortingCost: number;
  grindingCost: number;
  washingCost: number;
  
  // Overhead allocations
  handlingCost: number;
  logisticsCost: number;
  dieselAllocation: number;
  powerAllocation: number;
  maintenanceCost: number;
  chemicalsCost: number;
  
  // Totals
  totalCost: number;
  costPerKg: number;
}

// ----------------------------------------------------------------------------
// LOGISTICS - TRIPS
// ----------------------------------------------------------------------------

export type TripType = 'inbound' | 'outbound';
export type TripStatus = 'planned' | 'in_transit' | 'arrived' | 'completed';

export interface Trip {
  id: string;
  tripNumber: string;
  type: TripType;
  status: TripStatus;
  
  // Vehicle info
  vehicleNumber: string;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  
  // Route
  origin: string;
  destination: string;
  
  // Costs
  fuelCost: number;
  driverWage: number;
  otherCosts: number;
  totalCost: number;
  
  // Links
  linkedLotIds?: string[];
  linkedDispatchId?: string;
  
  // Timing
  departureTime?: string;
  arrivalTime?: string;
  
  // Metadata
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// HANDLING EVENTS
// ----------------------------------------------------------------------------

export type HandlingDirection = 'inbound' | 'internal' | 'outbound';
export type HandlingUnit = 'kg' | 'bag' | 'hour' | 'trip';

export interface HandlingType {
  id: string;
  name: string; // e.g., 'Offloading', 'Loading', 'Forklift Rental'
  direction: HandlingDirection;
  defaultUnit: HandlingUnit;
  isActive: boolean;
}

export interface HandlingEvent {
  id: string;
  handlingTypeId: string;
  handlingType?: HandlingType;
  direction: HandlingDirection;
  
  // Link to entity
  linkedType: 'trip' | 'lot' | 'batch' | 'dispatch';
  linkedId: string;
  
  // Quantity
  quantity: number;
  unit: HandlingUnit;
  rate: number; // naira per unit
  amount: number; // calculated
  
  // Payment
  paidTo: string; // worker/contractor name
  paymentMethod: 'cash' | 'transfer' | 'pending';
  isPaid: boolean;
  
  // Approval
  approvedBy?: string;
  approvedAt?: string;
  
  // Metadata
  timestamp: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// WAREHOUSE & INVENTORY
// ----------------------------------------------------------------------------

export interface InventoryItem {
  id: string;
  state: InventoryState;
  batchId?: string;
  lotId?: string;
  quantity: number; // kg
  location: string; // zone/area in warehouse
  dateReceived: string;
  agingDays: number;
}

export interface StockMovement {
  id: string;
  fromState: InventoryState;
  toState: InventoryState;
  batchId: string;
  quantity: number;
  movedBy: string;
  movedAt: string;
  reason?: string;
}

// ----------------------------------------------------------------------------
// SORTING OPERATIONS
// ----------------------------------------------------------------------------

export interface SortingOperation {
  id: string;
  batchId: string;
  batch?: Batch;
  
  // Input
  inputWeight: number;
  
  // Outputs
  sortedPetWeight: number;
  capsWeight: number;
  labelsWeight: number;
  rejectsWeight: number;
  
  // Calculated
  yieldPercent: number;
  rejectPercent: number;
  byproductPercent: number;
  
  // Team
  teamLeader: string;
  workerIds: string[];
  workers?: Worker[];
  
  // Timing
  startTime: string;
  endTime: string;
  durationMinutes: number;
  
  // Metadata
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// WORKERS & WAGES
// ----------------------------------------------------------------------------

export interface Worker {
  id: string;
  name: string;
  phone: string;
  role: 'sorter' | 'loader' | 'operator' | 'general';
  baseWageRate: number;
  isActive: boolean;
  joinedAt: string;
  
  // Performance tracking
  totalKgSorted: number;
  totalWagesEarned: number;
}

export interface WagePolicy {
  id: string;
  name: string;
  taskType: 'sorting' | 'loading' | 'grinding' | 'washing';
  ratePerUnit: number;
  unit: 'kg_input' | 'kg_output' | 'hour' | 'day';
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface WageEntry {
  id: string;
  workerId: string;
  worker?: Worker;
  policyId: string;
  policy?: WagePolicy;
  
  // Link to work
  operationType: 'sorting' | 'loading' | 'grinding' | 'washing';
  operationId: string;
  
  // Calculation
  quantity: number;
  rate: number;
  amount: number;
  
  // Distribution (for team work)
  isTeamSplit: boolean;
  teamSize?: number;
  
  // Payment
  isPaid: boolean;
  paidAt?: string;
  paidBy?: string;
  
  // Approval
  approvedBy: string;
  approvedAt: string;
  
  // Metadata
  periodStart: string;
  periodEnd: string;
  createdBy: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// GRINDING OPERATIONS
// ----------------------------------------------------------------------------

export interface GrindingOperation {
  id: string;
  batchId: string;
  batch?: Batch;
  
  // Input/Output
  inputWeight: number;
  outputWeight: number;
  yieldPercent: number;
  
  // Equipment
  machineId: string;
  
  // Downtime
  downtimeMinutes: number;
  downtimeReason?: string;
  
  // Maintenance cost
  bladeCost: number;
  maintenanceCost: number;
  
  // Operator
  operatorId: string;
  operator?: Worker;
  
  // Timing
  startTime: string;
  endTime: string;
  
  // Metadata
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// WASHING OPERATIONS
// ----------------------------------------------------------------------------

export interface WashingOperation {
  id: string;
  batchId: string;
  batch?: Batch;
  
  // Multi-stage weights
  inputWeight: number;
  afterWashWeight: number;
  afterDewaterWeight: number;
  finalDryWeight: number;
  
  // Loss calculations
  washLossPercent: number;
  dewaterLossPercent: number;
  totalLossPercent: number;
  
  // Costs
  chemicalsCost: number;
  waterCost: number;
  labourCost: number;
  dieselAllocation: number;
  
  // Team
  operatorIds: string[];
  operators?: Worker[];
  
  // Timing
  startTime: string;
  endTime: string;
  
  // Metadata
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// EXPENSES
// ----------------------------------------------------------------------------

export type ExpenseCategory = 
  | 'labour'
  | 'diesel'
  | 'maintenance'
  | 'logistics'
  | 'handling'
  | 'packaging'
  | 'chemicals'
  | 'admin'
  | 'power'
  | 'other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  receiptPhoto?: string;
  
  // Allocation
  allocatedTo?: 'batch' | 'department' | 'shift';
  batchId?: string;
  department?: string;
  shiftDate?: string;
  
  // Approval
  approvedBy?: string;
  approvedAt?: string;
  
  // Payment
  isPaid: boolean;
  paidAt?: string;
  
  // Metadata
  expenseDate: string;
  createdBy: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// SALES & DISPATCH
// ----------------------------------------------------------------------------

export interface Dispatch {
  id: string;
  dispatchNumber: string;
  buyerId: string;
  buyer?: Buyer;
  
  // Batches included
  batchIds: string[];
  batches?: Batch[];
  totalWeight: number;
  
  // Pricing
  pricePerKg: number;
  totalValue: number;
  
  // Handling & logistics
  handlingCost: number;
  deliveryCost: number;
  totalCost: number;
  
  // Weight variance
  factoryWeight: number;
  buyerConfirmedWeight: number;
  varianceKg: number;
  variancePercent: number;
  
  // Status
  status: 'preparing' | 'in_transit' | 'delivered' | 'confirmed' | 'invoiced' | 'paid';
  
  // Invoice
  invoiceNumber?: string;
  invoicedAt?: string;
  
  // Payment
  paymentStatus: 'pending' | 'partial' | 'paid';
  amountPaid: number;
  
  // Profit
  profit: number;
  profitMargin: number;
  
  // Trip link
  tripId?: string;
  trip?: Trip;
  
  // Metadata
  dispatchedAt: string;
  deliveredAt?: string;
  confirmedAt?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// WEIGHT CHECKPOINTS
// ----------------------------------------------------------------------------

export interface WeightCheckpoint {
  id: string;
  entityType: 'lot' | 'batch' | 'trip' | 'dispatch';
  entityId: string;
  
  // Weight data
  weight: number;
  stage: string;
  
  // Audit
  timestamp: string;
  recordedBy: string;
  user?: User;
  
  // Optional
  photoUrl?: string;
  scaleId?: string;
  notes?: string;
  
  // For edits
  isEdit: boolean;
  originalValue?: number;
  editReason?: string;
  approvedBy?: string;
}

// ----------------------------------------------------------------------------
// AUDIT LOGS
// ----------------------------------------------------------------------------

export interface AuditLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'login';
  entityType: string;
  entityId: string;
  
  // Change details
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  
  // User
  performedBy: string;
  performedByUser?: User;
  
  // Timestamp
  performedAt: string;
  
  // Context
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}

// ----------------------------------------------------------------------------
// TICKETS - Production Problem Solving
// ----------------------------------------------------------------------------

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = 
  | 'equipment_failure'
  | 'quality_issue'
  | 'safety_concern'
  | 'process_delay'
  | 'material_shortage'
  | 'power_outage'
  | 'maintenance'
  | 'other';

export interface TicketComment {
  id: string;
  text: string;
  userId: string;
  userName?: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  
  // Links
  linkedBatchId?: string;
  linkedBatch?: Batch;
  
  // Assignment
  assignedTo?: string;
  assignedToUser?: User;
  
  // Comments
  comments: TicketComment[];
  
  // Resolution
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  
  // Audit
  createdBy: string;
  createdByUser?: User;
  createdAt: string;
  updatedAt?: string;
}

// ----------------------------------------------------------------------------
// PAYMENTS
// ----------------------------------------------------------------------------

export interface Payment {
  id: string;
  paymentType: 'vendor' | 'worker' | 'expense' | 'buyer_receipt';
  entityId: string; // vendorId, workerId, expenseId, dispatchId
  
  amount: number;
  currency: 'NGN';
  
  method: 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque';
  reference?: string;
  
  status: 'pending' | 'completed' | 'failed';
  
  // Timing
  paymentDate: string;
  processedAt?: string;
  processedBy?: string;
  
  // Metadata
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// DASHBOARD & REPORTS
// ----------------------------------------------------------------------------

export interface DashboardKPIs {
  // Production
  totalInputKg: number;
  totalOutputKg: number;
  overallYield: number;
  
  // Financial
  revenue: number;
  totalCosts: number;
  grossProfit: number;
  avgCostPerKg: number;
  
  // Inventory
  stockOnHand: Record<InventoryState, number>;
  
  // Workforce
  activeWorkers: number;
  totalWagesToday: number;
  avgProductivity: number;
  
  // Alerts
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'loss_threshold' | 'missing_checkpoint' | 'negative_stock' | 'margin_compression' | 'low_stock' | 'ticket_created';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  isRead: boolean;
}

export interface ProductionReport {
  period: string;
  batches: Batch[];
  totalInput: number;
  totalOutput: number;
  yieldByStage: {
    sorting: number;
    grinding: number;
    washing: number;
  };
}

export interface FinancialReport {
  period: string;
  revenue: number;
  materialCosts: number;
  labourCosts: number;
  logisticsCosts: number;
  handlingCosts: number;
  otherCosts: number;
  grossProfit: number;
  netProfit: number;
  costPerKg: number;
}

export interface WorkerProductivityReport {
  workerId: string;
  workerName: string;
  period: string;
  kgSorted: number;
  hoursWorked: number;
  kgPerHour: number;
  wagesEarned: number;
  ranking: number;
}

// ----------------------------------------------------------------------------
// FORM INPUT TYPES
// ----------------------------------------------------------------------------

export interface CreateLotInput {
  vendorId: string;
  materialType: MaterialType;
  grade: MaterialGrade;
  grossWeight: number;
  tareWeight: number;
  basePricePerKg: number;
  gradeAdjustment: number;
  moistureAdjustment: number;
  contaminationAdjustment: number;
  receiptPhoto?: File;
  notes?: string;
}

export interface CreateBatchInput {
  sourceLotIds: string[];
  initialWeight: number;
}

export interface CreateSortingInput {
  batchId: string;
  inputWeight: number;
  sortedPetWeight: number;
  capsWeight: number;
  labelsWeight: number;
  rejectsWeight: number;
  workerIds: string[];
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface CreateDispatchInput {
  buyerId: string;
  batchIds: string[];
  factoryWeight: number;
  pricePerKg: number;
  handlingCost: number;
  deliveryCost: number;
  tripId?: string;
}

// ----------------------------------------------------------------------------
// FILTER & QUERY TYPES
// ----------------------------------------------------------------------------

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
