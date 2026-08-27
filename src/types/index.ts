/*
 * File: /mnt/okcomputer/output/app/src/types/index.ts
 */

export type UserRole = 'owner' | 'production_manager' | 'inventory_manager' | 'driver' | 'sorting_staff' | 'cleaning_staff' | 'security' | 'admin' | 'viewer' | 'procurement' | 'warehouse_officer' | 'sorting_supervisor' | 'production_supervisor' | 'logistics_officer' | 'finance' | 'auditor';

export type Permission =
  | 'view_dashboard' | 'manage_users' | 'view_users'
  | 'create_purchase' | 'view_purchases' | 'edit_purchase' | 'delete_purchase'
  | 'create_batch' | 'view_batches' | 'edit_batch' | 'delete_batch'
  | 'create_sorting' | 'view_sorting' | 'edit_sorting'
  | 'create_expense' | 'view_expenses' | 'edit_expense' | 'delete_expense'
  | 'create_dispatch' | 'view_dispatches' | 'edit_dispatch' | 'delete_dispatch'
  | 'create_wage' | 'view_wages' | 'edit_wage'
  | 'create_worker' | 'view_workers' | 'edit_worker' | 'delete_worker'
  | 'create_trip' | 'view_trips' | 'edit_trip' | 'delete_trip'
  | 'create_handling' | 'view_handling' | 'edit_handling'
  | 'create_ticket' | 'view_tickets' | 'edit_ticket' | 'delete_ticket'
  | 'create_vendor' | 'view_vendors' | 'edit_vendor' | 'delete_vendor'
  | 'create_buyer' | 'view_buyers' | 'edit_buyer' | 'delete_buyer'
  | 'view_reports' | 'view_audit_logs' | 'export_data'
  | 'manage_settings' | 'backup_data' | 'view_finance'
  ;

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    'view_dashboard', 'manage_users', 'view_users',
    'create_purchase', 'view_purchases', 'edit_purchase', 'delete_purchase',
    'create_batch', 'view_batches', 'edit_batch', 'delete_batch',
    'create_sorting', 'view_sorting', 'edit_sorting',
    'create_expense', 'view_expenses', 'edit_expense', 'delete_expense',
    'create_dispatch', 'view_dispatches', 'edit_dispatch', 'delete_dispatch',
    'create_wage', 'view_wages', 'edit_wage',
    'create_worker', 'view_workers', 'edit_worker', 'delete_worker',
    'create_trip', 'view_trips', 'edit_trip', 'delete_trip',
    'create_handling', 'view_handling', 'edit_handling',
    'create_ticket', 'view_tickets', 'edit_ticket', 'delete_ticket',
    'create_vendor', 'view_vendors', 'edit_vendor', 'delete_vendor',
    'create_buyer', 'view_buyers', 'edit_buyer', 'delete_buyer',
    'view_reports', 'view_audit_logs', 'export_data',
    'manage_settings', 'backup_data', 'view_finance',
  ],
  production_manager: [
    'view_dashboard',
    'create_batch', 'view_batches', 'edit_batch',
    'create_sorting', 'view_sorting', 'edit_sorting',
    'create_worker', 'view_workers', 'edit_worker',
    'create_wage', 'view_wages', 'edit_wage',
    'create_expense', 'view_expenses', 'edit_expense',
    'create_trip', 'view_trips', 'edit_trip',
    'create_handling', 'view_handling', 'edit_handling',
    'create_ticket', 'view_tickets', 'edit_ticket',
    'view_reports', 'view_finance',
  ],
  inventory_manager: [
    'view_dashboard',
    'create_purchase', 'view_purchases', 'edit_purchase',
    'view_batches', 'edit_batch',
    'create_dispatch', 'view_dispatches', 'edit_dispatch',
    'create_vendor', 'view_vendors', 'edit_vendor',
    'create_buyer', 'view_buyers', 'edit_buyer',
    'view_reports', 'view_finance',
  ],
  driver: ['view_dashboard', 'create_trip', 'view_trips', 'edit_trip'],
  sorting_staff: ['view_dashboard', 'create_sorting', 'view_sorting'],
  cleaning_staff: ['view_dashboard', 'create_sorting', 'view_sorting'],
  security: ['view_dashboard', 'view_batches', 'view_dispatches', 'view_tickets'],
  admin: [
    'view_dashboard', 'manage_users', 'view_users',
    'create_purchase', 'view_purchases', 'edit_purchase', 'delete_purchase',
    'create_batch', 'view_batches', 'edit_batch', 'delete_batch',
    'create_sorting', 'view_sorting', 'edit_sorting',
    'create_expense', 'view_expenses', 'edit_expense', 'delete_expense',
    'create_dispatch', 'view_dispatches', 'edit_dispatch', 'delete_dispatch',
    'create_wage', 'view_wages', 'edit_wage',
    'create_worker', 'view_workers', 'edit_worker', 'delete_worker',
    'create_trip', 'view_trips', 'edit_trip', 'delete_trip',
    'create_handling', 'view_handling', 'edit_handling',
    'create_ticket', 'view_tickets', 'edit_ticket', 'delete_ticket',
    'create_vendor', 'view_vendors', 'edit_vendor', 'delete_vendor',
    'create_buyer', 'view_buyers', 'edit_buyer', 'delete_buyer',
    'view_reports', 'view_audit_logs', 'export_data',
    'manage_settings', 'backup_data', 'view_finance',
  ],
  viewer: ['view_dashboard', 'view_purchases', 'view_batches', 'view_sorting', 'view_expenses', 'view_dispatches', 'view_wages', 'view_workers', 'view_trips', 'view_handling', 'view_tickets', 'view_vendors', 'view_buyers', 'view_reports'],
};

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

export type VendorType = 'vendor' | 'buyer';

export interface Vendor {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  location?: string;
  type: VendorType;
  isActive: boolean;
  rating?: number;
  reliabilityScore?: number;
  materialTypes?: string[];
  notes?: string;
  totalTransactions?: number;
  totalKgPurchased?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Buyer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  location?: string;
  type: VendorType;
  isActive: boolean;
  totalTransactions?: number;
  totalKgSold?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PurchaseLot {
  id: string;
  lotNumber: string;
  vendorId: string;
  vendorName: string;
  vendor?: { name: string };
  purchaseDate: string;
  expectedKg: number;
  actualKg?: number;
  netWeight?: number;
  pricePerKg: number;
  basePricePerKg?: number;
  finalPricePerKg?: number;
  totalCost: number;
  status: 'pending_delivery' | 'delivered' | 'inspected' | 'rejected' | 'stored';
  paymentStatus?: 'pending' | 'partial' | 'paid';
  amountPaid?: number;
  notes?: string;
  materialType?: string;
  grade?: string;
  grossWeight?: number;
  tareWeight?: number;
  createdAt: string;
  createdBy: string;
}

export type TripStatus = 'scheduled' | 'in_transit' | 'completed' | 'cancelled' | 'planned' | 'arrived';
export type TripType = 'pickup' | 'delivery' | 'internal';

export interface Trip {
  id: string;
  tripNumber: string;
  lotId?: string;
  lotNumber?: string;
  type?: TripType;
  status: TripStatus;
  origin?: string;
  destination?: string;
  pickupLocation?: string;
  deliveryLocation?: string;
  driverName: string;
  driverPhone?: string;
  vehicleNumber: string;
  vehicleType?: string;
  cost: number;
  totalCost?: number;
  fuelCost?: number;
  driverWage?: number;
  otherCosts?: number;
  scheduledDate: string;
  departureTime?: string;
  arrivalTime?: string;
  completedDate?: string;
  notes?: string;
  accountNumber?: string;
  paymentTiming?: 'before' | 'after' | 'pending';
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
  createdAt: string;
}

export interface HandlingEvent {
  id: string;
  lotId: string;
  lotNumber?: string;
  handlingType?: string;
  typeName?: string;
  offloaderName: string;
  handlingCost: number;
  cost?: number;
  amount?: number;
  paidTo?: string;
  isPaid?: boolean;
  date: string;
  notes?: string;
  direction?: string;
  linkedType?: string;
  quantity?: number;
  unit?: string;
  rate?: number;
  accountNumber?: string;
  paymentTiming?: 'before' | 'after' | 'pending';
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
  createdAt: string;
}

export type MaterialType = 'PET' | 'HDPE' | 'PP' | 'LDPE' | 'PVC' | 'Mixed' | 'Other';
export type ProductionState = 'unsorted_pet' | 'sorted_pet' | 'ground_flakes' | 'washed_flakes' | 'final_dry_flakes';

export interface ProductionStage {
  id: string;
  batchId: string;
  stage: 'sorting' | 'grinding' | 'washing' | 'drying' | 'bagging';
  weightIn: number;
  weightOut: number;
  moistureIn: number;
  moistureOut: number;
  dryWeightIn: number;
  dryWeightOut: number;
  lossKg: number;
  lossPercent: number;
  yieldPercent: number;
  operatorName: string;
  machineId?: string;
  startTime: string;
  endTime: string;
  qualityCheck: 'pass' | 'fail' | 'pending';
  notes?: string;
  createdAt: string;
}

export interface BatchWeights {
  unsortedPet: number;
  sortedPet: number;
  caps: number;
  labels: number;
  groundFlakes: number;
  washedFlakes: number;
  finalDryFlakes: number;
  rejects: number;
}

export interface BatchCosts {
  materials: number;
  labour: number;
  utilities: number;
  logistics: number;
  handling: number;
  other: number;
  total: number;
}

export interface Batch {
  id: string;
  batchNumber: string;
  lotId: string;
  lotNumber: string;
  vendorName: string;
  materialType: string;
  initialWeight: number;
  currentWeight: number;
  targetOutputKg: number;
  weights: BatchWeights;
  costs?: BatchCosts;
  costPerKg: number;
  currentState: ProductionState;
  status: 'active' | 'paused' | 'completed' | 'dispatched' | 'cancelled';
  checkpoints?: any[];
  productionStartDate: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  stickerPrinted?: boolean;
  totalYield?: number;
}

export interface SortingEntry {
  id: string;
  batchId: string;
  workerId: string;
  workerName: string;
  kgSorted: number;
  wasteKg?: number;
  wageAmount?: number;
  date: string;
  notes?: string;
  accountNumber?: string;
  paymentTiming?: 'before' | 'after' | 'pending';
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
  createdAt: string;
}

export interface WageEntry {
  id: string;
  workerId: string;
  workerName: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory = 'materials' | 'labour' | 'utilities' | 'fuel' | 'maintenance' | 'logistics' | 'handling' | 'packaging' | 'chemicals' | 'power' | 'admin' | 'diesel' | 'other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  expenseDate?: string;
  batchId?: string;
  batchNumber?: string;
  createdBy?: string;
  createdAt: string;
  accountName?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  amountPaid?: number;
  isPaid?: boolean;
  allocatedTo?: string;
}

export type DispatchStatus = 'pending' | 'dispatched' | 'in_transit' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'unpaid';

export interface FinDispatch {
  id: string;
  dispatchNumber: string;
  batchIds?: string[];
  batches?: string[];
  batchId?: string;
  batchNumber?: string;
  buyerId?: string;
  buyerName: string;
  totalWeight?: number;
  quantityKg?: number;
  pricePerKg?: number;
  totalValue?: number;
  totalAmount?: number;
  handlingCost?: number;
  deliveryCost?: number;
  profit?: number;
  profitMargin?: number;
  costPerKg?: number;
  paymentReceivedDate?: string;
  receivedIntoAccount?: string;
  dispatchDate?: string;
  paymentStatus?: PaymentStatus;
  paymentDate?: string;
  status?: DispatchStatus;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  comment: string;
  text?: string;
  timestamp?: string;
  createdAt: string;
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  batchId?: string;
  linkedBatchId?: string;
  linkedBatchNumber?: string;
  createdBy: string;
  createdByUser?: { name: string };
  assignedTo?: string;
  assignedToUser?: { name: string };
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  comments?: TicketComment[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName?: string;
  performedBy?: string;
  performedByUser?: { name: string };
  performedAt?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  details?: any;
  fieldName?: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface GRNRecord {
  id: string;
  grnNumber: string;
  lotId: string;
  lotNumber: string;
  batchNumber: string;
  vendorId: string;
  vendorName: string;
  receiptDate: string;
  totalKg: number;
  pricePerKg: number;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
  paymentMethod?: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  moistureContent: number;
  sampleWetWeight?: number;
  sampleDryWeight?: number;
  foreignParticles: number;
  notes: string;
  createdBy: string;
  createdAt: string;
}

export interface DashboardKPI {
  totalBatches: number;
  activeBatches: number;
  totalDispatchedKg: number;
  averageYieldPercent: number;
  totalExpenses: number;
  totalRevenue: number;
  netProfit: number;
  totalWorkers: number;
  totalVendors: number;
  totalBuyers: number;
  pendingTickets: number;
  overdueDispatches: number;
}

export interface BagRecord {
  id: string;
  bagNumber: number;
  batchId: string;
  batchNumber: string;
  tollId: string;
  tollNumber: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  grade: string;
  materialType: string;
  productionDate: string;
  weighedBy: string;
  isReprint: boolean;
  qrData: string;
  createdAt: string;
}

export type HandlingDirection = 'inbound' | 'outbound';

export interface HandlingType {
  id: string;
  name: string;
  label?: string;
  direction?: HandlingDirection;
  defaultUnit?: string;
  unit?: string;
}

export type QualityGrade = 'A' | 'B' | 'C' | 'D';

export interface PayrollEntry {
  id: string;
  workerId: string;
  workerName: string;
  basePay: number;
  bonus: number;
  deductions: number;
  netPay: number;
  periodStart: string;
  periodEnd: string;
  status: 'draft' | 'approved' | 'paid';
  paidAt?: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  type: 'loss_threshold' | 'margin_compression' | 'low_stock' | 'missing_checkpoint' | 'negative_stock' | 'quality_issue' | 'payment_overdue' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  batchId?: string;
  batchNumber?: string;
  entityType?: string;
  entityId?: string;
  resolved: boolean;
  createdAt: string;
}

export interface DailyAttendance {
  id: string;
  workerId: string;
  workerName: string;
  date: string;
  present: boolean;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
  notes?: string;
  createdAt: string;
}
