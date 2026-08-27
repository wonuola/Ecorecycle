// @ts-nocheck
// ============================================================================
// DATABASE SERVICE — Supabase + In-Memory Fallback
// ============================================================================

import { supabase, isSupabaseConfigured } from './supabase'

// ============================================================================
// IN-MEMORY STORES (used when Supabase is offline)
// ============================================================================

let _users = [
  { id: '1', email: 'owner@ecorecycle.com', password_hash: 'owner123', name: 'Business Owner', role: 'owner', phone: '+2348000000001', is_active: true, created_at: '2024-01-01', last_login: null },
  { id: '2', email: 'admin@ecorecycle.com', password_hash: 'admin123', name: 'System Administrator', role: 'admin', phone: '+2348000000002', is_active: true, created_at: '2024-01-01', last_login: null },
  { id: '3', email: 'procurement@ecorecycle.com', password_hash: 'procure123', name: 'Procurement Officer', role: 'procurement', phone: '+2348000000003', is_active: true, created_at: '2024-01-01', last_login: null },
  { id: '4', email: 'warehouse@ecorecycle.com', password_hash: 'warehouse123', name: 'Warehouse Officer', role: 'warehouse_officer', phone: '+2348000000004', is_active: true, created_at: '2024-01-01', last_login: null },
  { id: '5', email: 'sorting@ecorecycle.com', password_hash: 'sorting123', name: 'Sorting Supervisor', role: 'sorting_supervisor', phone: '+2348000000005', is_active: true, created_at: '2024-01-01', last_login: null },
  { id: '6', email: 'production@ecorecycle.com', password_hash: 'production123', name: 'Production Supervisor', role: 'production_supervisor', phone: '+2348000000006', is_active: true, created_at: '2024-01-01', last_login: null },
  { id: '7', email: 'logistics@ecorecycle.com', password_hash: 'logistics123', name: 'Logistics Officer', role: 'logistics_officer', phone: '+2348000000007', is_active: true, created_at: '2024-01-01', last_login: null },
  { id: '8', email: 'finance@ecorecycle.com', password_hash: 'finance123', name: 'Finance Officer', role: 'finance', phone: '+2348000000008', is_active: true, created_at: '2024-01-01', last_login: null },
  { id: '9', email: 'auditor@ecorecycle.com', password_hash: 'auditor123', name: 'System Auditor', role: 'auditor', phone: '+2348000000009', is_active: true, created_at: '2024-01-01', last_login: null },
];

let _vendors = [
  { id: 'v1', name: 'Adebayo Musa', type: 'vendor', contact_person: 'Adebayo Musa', email: 'adebayo@example.com', phone: '+2348012345671', address: 'Osogbo, Osun State', notes: 'Reliable PET supplier', is_active: true, created_at: '2024-01-01', reliability_score: 92, material_types: ['PET Green','PET Clear'], total_transactions: 45, total_kg_purchased: 125000 },
  { id: 'v2', name: 'Olaoluwa Plastics', type: 'vendor', contact_person: 'Olaoluwa Ade', email: 'ola@example.com', phone: '+2348012345672', address: 'Ibadan, Oyo State', notes: 'Premium PET Clear', is_active: true, created_at: '2024-02-01', reliability_score: 88, material_types: ['PET Clear'], total_transactions: 32, total_kg_purchased: 98000 },
  { id: 'v3', name: 'Iya Kemi', type: 'vendor', contact_person: 'Kemi Adeola', email: 'kemi@example.com', phone: '+2348012345673', address: 'Ile-Ife, Osun State', notes: 'HDPE drums specialist', is_active: true, created_at: '2024-03-01', reliability_score: 75, material_types: ['HDPE'], total_transactions: 28, total_kg_purchased: 65000 },
  { id: 'v4', name: 'RecycleHub', type: 'vendor', contact_person: 'Tunde Bakare', email: 'tunde@example.com', phone: '+2348012345674', address: 'Lagos, Lagos State', notes: 'Mixed plastics collector', is_active: true, created_at: '2024-03-15', reliability_score: 82, material_types: ['HDPE','PP'], total_transactions: 20, total_kg_purchased: 45000 },
];

let _buyers = [
  { id: 'b1', name: 'GreenBuy Industries', type: 'buyer', contact_person: 'John Green', email: 'john@greenbuy.ng', phone: '+2348023456781', address: 'Lagos, Lagos State', notes: 'Major flake buyer', is_active: true, created_at: '2024-01-01', total_transactions: 38, total_kg_sold: 210000 },
  { id: 'b2', name: 'RecycleCorp International', type: 'buyer', contact_person: 'Sarah Chen', email: 'sarah@recyclecorp.com', phone: '+2348023456782', address: 'Apapa, Lagos State', notes: 'Export buyer', is_active: true, created_at: '2024-02-01', total_transactions: 25, total_kg_sold: 150000 },
  { id: 'b3', name: 'Plastics Nigeria Ltd', type: 'buyer', contact_person: 'Emeka Okafor', email: 'emeka@plasticsng.com', phone: '+2348023456783', address: 'Aba, Abia State', notes: 'Local manufacturer', is_active: true, created_at: '2024-03-01', total_transactions: 15, total_kg_sold: 80000 },
];

let _lots = [
  { id: 'l1', lot_number: 'LOT-2025-001', vendor_id: 'v1', purchase_date: '2025-07-01', expected_kg: 4000, actual_kg: 4000, price_per_kg: 95, total_cost: 380000, status: 'completed', notes: 'Clean load', created_by: '3', created_at: '2025-07-01T08:00:00Z' },
  { id: 'l2', lot_number: 'LOT-2025-002', vendor_id: 'v2', purchase_date: '2025-07-03', expected_kg: 2500, actual_kg: 2500, price_per_kg: 110, total_cost: 275000, status: 'completed', notes: '', created_by: '3', created_at: '2025-07-03T10:00:00Z' },
  { id: 'l3', lot_number: 'LOT-2025-003', vendor_id: 'v3', purchase_date: '2025-07-05', expected_kg: 1500, actual_kg: null, price_per_kg: 88, total_cost: 132000, status: 'pending_delivery', notes: 'Higher moisture', created_by: '3', created_at: '2025-07-05T09:00:00Z' },
  { id: 'l4', lot_number: 'LOT-2025-004', vendor_id: 'v4', purchase_date: '2025-07-06', expected_kg: 1300, actual_kg: 1300, price_per_kg: 90, total_cost: 117000, status: 'completed', notes: 'Good HDPE drums', created_by: '3', created_at: '2025-07-06T11:00:00Z' },
];

let _trips = [
  { id: 't1', trip_number: 'TRIP-2025-001', lot_id: 'l1', type: 'pickup', driver_name: 'Jide Ogunleye', driver_phone: '+2348034567891', vehicle_number: 'LAG-234-XA', pickup_location: 'Osogbo Collection Point', delivery_location: 'EcoRecycle Factory', logistics_cost: 25000, fuel_cost: 12000, driver_wage: 8000, other_costs: 5000, status: 'completed', scheduled_date: '2025-07-01', completed_date: '2025-07-01', account_number: '1234567890', payment_timing: 'after', payment_status: 'unpaid', created_at: '2025-07-01T06:00:00Z' },
  { id: 't2', trip_number: 'TRIP-2025-002', lot_id: 'l2', type: 'pickup', driver_name: 'Taiwo Adeleke', driver_phone: '+2348034567892', vehicle_number: 'OSR-567-YB', pickup_location: 'Ibadan Depot', delivery_location: 'EcoRecycle Factory', logistics_cost: 32000, fuel_cost: 15000, driver_wage: 10000, other_costs: 7000, status: 'completed', scheduled_date: '2025-07-03', completed_date: '2025-07-03', account_number: '', payment_timing: 'before', payment_status: 'paid', created_at: '2025-07-03T06:00:00Z' },
];

let _handling = [
  { id: 'h1', lot_id: 'l1', offloader_name: 'Sikiru Bello', handling_cost: 5000, offloading_date: '2025-07-01', notes: 'Quick offload', account_number: '0123456789', payment_timing: 'after', payment_status: 'paid', created_at: '2025-07-01T09:00:00Z' },
  { id: 'h2', lot_id: 'l2', offloader_name: 'Dayo Ajayi', handling_cost: 4500, offloading_date: '2025-07-03', notes: '', account_number: '', payment_timing: 'before', payment_status: 'paid', created_at: '2025-07-03T11:00:00Z' },
];

let _batches = [
  { id: 'batch-001', batch_number: 'B-PET-2025-001', lot_id: 'l1', initial_weight: 5000, sorted_pet_weight: 4850, caps_weight: 30, labels_weight: 25, ground_flakes_weight: 5100, washed_flakes_weight: 5450, final_dry_flakes_weight: 3920, rejects_weight: 80, total_yield_percent: 78.4, material_cost: 380000, labour_cost: 48000, logistics_cost: 25000, handling_cost: 5000, other_cost: 10000, cost_per_kg: 95, current_state: 'final_dry_flakes', status: 'completed', created_at: '2025-07-01T14:00:00Z', updated_at: '2025-07-02T22:00:00Z' },
  { id: 'batch-002', batch_number: 'B-PET-2025-002', lot_id: 'l2', initial_weight: 5200, sorted_pet_weight: 5080, caps_weight: 20, labels_weight: 15, ground_flakes_weight: 5300, washed_flakes_weight: 5620, final_dry_flakes_weight: null, rejects_weight: null, total_yield_percent: null, material_cost: 275000, labour_cost: 31000, logistics_cost: 32000, handling_cost: 4500, other_cost: 6000, cost_per_kg: 110, current_state: 'washed_flakes', status: 'active', created_at: '2025-07-03T14:00:00Z', updated_at: '2025-07-04T12:00:00Z' },
  { id: 'batch-003', batch_number: 'B-HDPE-2025-001', lot_id: 'l4', initial_weight: 3000, sorted_pet_weight: 2920, caps_weight: 0, labels_weight: 0, ground_flakes_weight: null, washed_flakes_weight: null, final_dry_flakes_weight: null, rejects_weight: null, total_yield_percent: null, material_cost: 117000, labour_cost: 15000, logistics_cost: 18000, handling_cost: 3000, other_cost: 0, cost_per_kg: 90, current_state: 'sorted_pet', status: 'active', created_at: '2025-07-06T15:00:00Z', updated_at: '2025-07-06T15:00:00Z' },
  { id: 'batch-004', batch_number: 'B-HDPE-2025-002', lot_id: 'l3', initial_weight: 3150, sorted_pet_weight: 3080, caps_weight: 0, labels_weight: 0, ground_flakes_weight: 3250, washed_flakes_weight: 3480, final_dry_flakes_weight: 2350, rejects_weight: 120, total_yield_percent: 74.6, material_cost: 132000, labour_cost: 41000, logistics_cost: 20000, handling_cost: 4000, other_cost: 15000, cost_per_kg: 88, current_state: 'final_dry_flakes', status: 'completed', created_at: '2025-07-02T14:30:00Z', updated_at: '2025-07-03T22:00:00Z' },
];

let _workers = [
  { id: 'w1', name: 'Adebayo F.', role: 'sorter', phone: '+2348045678901', is_active: true, created_at: '2024-01-01', total_kg_sorted: 45000, total_wages_earned: 2250000 },
  { id: 'w2', name: 'Oluwaseun K.', role: 'operator', phone: '+2348045678902', is_active: true, created_at: '2024-02-01', total_kg_sorted: 0, total_wages_earned: 180000 },
  { id: 'w3', name: 'Chioma N.', role: 'operator', phone: '+2348045678903', is_active: true, created_at: '2024-02-15', total_kg_sorted: 0, total_wages_earned: 150000 },
  { id: 'w4', name: 'Emmanuel T.', role: 'operator', phone: '+2348045678904', is_active: true, created_at: '2024-03-01', total_kg_sorted: 0, total_wages_earned: 120000 },
  { id: 'w5', name: 'Fatima A.', role: 'sorter', phone: '+2348045678905', is_active: true, created_at: '2024-03-15', total_kg_sorted: 12000, total_wages_earned: 600000 },
];

let _sortingEntries = [
  { id: 's1', batch_id: 'batch-001', worker_id: 'w1', kg_sorted: 1200, waste_kg: 35, wage_amount: 36000, date: '2025-07-01', notes: '', account_number: '0987654321', payment_timing: 'after', payment_status: 'unpaid', created_at: '2025-07-01T16:00:00Z' },
  { id: 's2', batch_id: 'batch-001', worker_id: 'w5', kg_sorted: 800, waste_kg: 25, wage_amount: 24000, date: '2025-07-01', notes: '', account_number: '', payment_timing: 'before', payment_status: 'paid', created_at: '2025-07-01T17:00:00Z' },
];

let _wageEntries = [
  { id: 'we1', worker_id: 'w1', amount: 60000, date: '2025-07-01', notes: 'Weekly sorting wages', created_by: '1', created_at: '2025-07-01T18:00:00Z' },
  { id: 'we2', worker_id: 'w5', amount: 40000, date: '2025-07-01', notes: 'Weekly sorting wages', created_by: '1', created_at: '2025-07-01T18:00:00Z' },
];

let _expenses = [
  { id: 'ex1', category: 'fuel', amount: 28000, description: 'Diesel for dryer generator', date: '2025-07-02', batch_id: 'batch-001', created_by: '1', created_at: '2025-07-02T20:00:00Z' },
  { id: 'ex2', category: 'maintenance', amount: 15000, description: 'Dryer repair DRY-02', date: '2025-07-03', batch_id: 'batch-004', created_by: '1', created_at: '2025-07-03T19:00:00Z' },
];

let _dispatches = [
  { id: 'd1', dispatch_number: 'DSP-2025-001', batch_id: 'batch-001', buyer_id: 'b1', quantity_kg: 3859, price_per_kg: 450, total_amount: 1736550, dispatch_date: '2025-07-08', delivery_status: 'delivered', payment_status: 'paid', payment_date: '2025-07-10', notes: '', created_at: '2025-07-08T06:00:00Z' },
  { id: 'd2', dispatch_number: 'DSP-2025-002', batch_id: 'batch-004', buyer_id: 'b2', quantity_kg: 2148, price_per_kg: 430, total_amount: 923640, dispatch_date: '2025-07-10', delivery_status: 'delivered', payment_status: 'partial', payment_date: '2025-07-12', notes: '', created_at: '2025-07-10T06:00:00Z' },
];

let _tickets = [
  { id: 'tk1', ticket_number: 'TKT-001', title: 'Dryer DRY-02 overheating', description: 'Temperature exceeds 85C during normal operation', category: 'maintenance', priority: 'high', status: 'open', batch_id: 'batch-004', created_by: '6', assigned_to: '4', created_at: '2025-07-03T15:00:00Z', updated_at: '2025-07-03T15:00:00Z', resolved_at: null },
  { id: 'tk2', ticket_number: 'TKT-002', title: 'Bag label printer jam', description: 'Printer stopped working during batch 003 bagging', category: 'equipment', priority: 'medium', status: 'resolved', batch_id: 'batch-003', created_by: '5', assigned_to: '4', created_at: '2025-07-06T10:00:00Z', updated_at: '2025-07-07T09:00:00Z', resolved_at: '2025-07-07T09:00:00Z' },
];

let _ticketComments = [
  { id: 'tc1', ticket_id: 'tk2', user_id: '4', user_name: 'Warehouse Officer', comment: 'Replaced roller and cleaned print head', created_at: '2025-07-07T09:00:00Z' },
];

let _auditLogs = [
  { id: 'al1', user_id: '1', action: 'login', entity_type: 'user', entity_id: '1', old_values: null, new_values: null, ip_address: '192.168.1.1', created_at: '2025-07-01T06:00:00Z' },
];

let _grns = [];

function nextId(prefix = '') {
  return `${prefix}${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

const DEFAULT_USERS = [..._users];

export async function login(credentials) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('users').select('*').eq('email', credentials.email).eq('is_active', true).single()
    if (!error && data && data.password_hash === credentials.password) {
      await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', data.id)
      const user = { id: data.id, email: data.email, name: data.name, role: data.role, phone: data.phone || undefined, isActive: data.is_active, createdAt: data.created_at, lastLogin: data.last_login }
      localStorage.setItem('ecorecycle_user', JSON.stringify(user))
      return user
    }
  }
  const user = DEFAULT_USERS.find(u => u.email === credentials.email && u.password_hash === credentials.password && u.is_active)
  if (user) {
    const userObj = { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone || undefined, isActive: user.is_active, createdAt: user.created_at, lastLogin: new Date().toISOString() }
    localStorage.setItem('ecorecycle_user', JSON.stringify(userObj))
    return userObj
  }
  return null
}

export async function logout() { localStorage.removeItem('ecorecycle_user') }

export async function getCurrentUser() {
  const userStr = localStorage.getItem('ecorecycle_user')
  return userStr ? JSON.parse(userStr) : null
}

// ============================================================================
// USERS
// ============================================================================

export async function getUsers() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    return (data || []).map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, phone: u.phone, isActive: u.is_active, createdAt: u.created_at, lastLogin: u.last_login }))
  }
  return _users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, phone: u.phone, isActive: u.is_active, createdAt: u.created_at, lastLogin: u.last_login }))
}

export async function createUser(user) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('users').insert({ email: user.email, password_hash: user.password || 'changeme123', name: user.name, role: user.role, phone: user.phone, is_active: user.isActive }).select().single()
    if (error) throw error
    return { id: data.id, email: data.email, name: data.name, role: data.role, phone: data.phone, isActive: data.is_active, createdAt: data.created_at }
  }
  const newUser = { id: nextId('u'), email: user.email, password_hash: user.password || 'changeme123', name: user.name, role: user.role, phone: user.phone || null, is_active: user.isActive !== false, created_at: new Date().toISOString(), last_login: null }
  _users.push(newUser)
  return { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, phone: newUser.phone, isActive: newUser.is_active, createdAt: newUser.created_at }
}

export async function updateUser(id, updates) {
  if (isSupabaseConfigured) {
    const updateData = {}
    if (updates.name) updateData.name = updates.name
    if (updates.email) updateData.email = updates.email
    if (updates.phone) updateData.phone = updates.phone
    if (updates.role) updateData.role = updates.role
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    const { data, error } = await supabase.from('users').update(updateData).eq('id', id).select().single()
    if (error) return undefined
    return { id: data.id, email: data.email, name: data.name, role: data.role, phone: data.phone, isActive: data.is_active, createdAt: data.created_at }
  }
  const idx = _users.findIndex(u => u.id === id)
  if (idx < 0) return undefined
  if (updates.name) _users[idx].name = updates.name
  if (updates.email) _users[idx].email = updates.email
  if (updates.phone) _users[idx].phone = updates.phone
  if (updates.role) _users[idx].role = updates.role
  if (updates.isActive !== undefined) _users[idx].is_active = updates.isActive
  const u = _users[idx]
  return { id: u.id, email: u.email, name: u.name, role: u.role, phone: u.phone, isActive: u.is_active, createdAt: u.created_at }
}

// ============================================================================
// VENDORS
// ============================================================================

export async function getVendors() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('vendors').select('*').eq('type', 'vendor').eq('is_active', true).order('name')
    return (data || []).map(v => ({ id: v.id, name: v.name, contactPerson: v.contact_person || '', phone: v.phone || '', email: v.email, location: v.address || 'Nigeria', materialTypes: v.material_types || ['PET'], reliabilityScore: v.reliability_score || 80, notes: v.notes, isActive: v.is_active, createdAt: v.created_at, totalTransactions: v.total_transactions || 0, totalKgPurchased: v.total_kg_purchased || 0 }))
  }
  return _vendors.filter(v => v.type === 'vendor' && v.is_active).map(v => ({ id: v.id, name: v.name, contactPerson: v.contact_person || '', phone: v.phone || '', email: v.email, location: v.address || 'Nigeria', materialTypes: v.material_types || ['PET'], reliabilityScore: v.reliability_score || 80, notes: v.notes, isActive: v.is_active, createdAt: v.created_at, totalTransactions: v.total_transactions || 0, totalKgPurchased: v.total_kg_purchased || 0 }))
}

export async function createVendor(vendor) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('vendors').insert({ name: vendor.name, type: 'vendor', contact_person: vendor.contactPerson, email: vendor.email, phone: vendor.phone, address: vendor.location, notes: vendor.notes }).select().single()
    if (error) throw error
    return { id: data.id, name: data.name, contactPerson: data.contact_person || '', phone: data.phone || '', email: data.email, location: data.address || 'Nigeria', materialTypes: ['PET'], reliabilityScore: 80, notes: data.notes, isActive: data.is_active, createdAt: data.created_at, totalTransactions: 0, totalKgPurchased: 0 }
  }
  const newV = { id: nextId('v'), name: vendor.name, type: 'vendor', contact_person: vendor.contactPerson || vendor.name, email: vendor.email || '', phone: vendor.phone || '', address: vendor.location || 'Nigeria', notes: vendor.notes || '', is_active: true, created_at: new Date().toISOString(), reliability_score: 80, material_types: ['PET'], total_transactions: 0, total_kg_purchased: 0 }
  _vendors.push(newV)
  return { id: newV.id, name: newV.name, contactPerson: newV.contact_person || '', phone: newV.phone || '', email: newV.email, location: newV.address || 'Nigeria', materialTypes: ['PET'], reliabilityScore: 80, notes: newV.notes, isActive: newV.is_active, createdAt: newV.created_at, totalTransactions: 0, totalKgPurchased: 0 }
}

export async function updateVendor(id, updates) {
  if (isSupabaseConfigured) {
    const updateData = {}
    if (updates.name) updateData.name = updates.name
    if (updates.contactPerson) updateData.contact_person = updates.contactPerson
    if (updates.phone) updateData.phone = updates.phone
    if (updates.email) updateData.email = updates.email
    if (updates.location) updateData.address = updates.location
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    const { data, error } = await supabase.from('vendors').update(updateData).eq('id', id).select().single()
    if (error) return undefined
    return { id: data.id, name: data.name, contactPerson: data.contact_person || '', phone: data.phone || '', email: data.email, location: data.address || 'Nigeria', materialTypes: ['PET'], reliabilityScore: 80, notes: data.notes, isActive: data.is_active, createdAt: data.created_at, totalTransactions: 0, totalKgPurchased: 0 }
  }
  const idx = _vendors.findIndex(v => v.id === id)
  if (idx < 0) return undefined
  if (updates.name) _vendors[idx].name = updates.name
  if (updates.contactPerson) _vendors[idx].contact_person = updates.contactPerson
  if (updates.phone) _vendors[idx].phone = updates.phone
  if (updates.email) _vendors[idx].email = updates.email
  if (updates.location) _vendors[idx].address = updates.location
  if (updates.isActive !== undefined) _vendors[idx].is_active = updates.isActive
  const v = _vendors[idx]
  return { id: v.id, name: v.name, contactPerson: v.contact_person || '', phone: v.phone || '', email: v.email, location: v.address || 'Nigeria', materialTypes: v.material_types || ['PET'], reliabilityScore: v.reliability_score || 80, notes: v.notes, isActive: v.is_active, createdAt: v.created_at, totalTransactions: v.total_transactions || 0, totalKgPurchased: v.total_kg_purchased || 0 }
}

export async function deleteVendor(id) {
  if (isSupabaseConfigured) { await supabase.from('vendors').update({ is_active: false }).eq('id', id); return }
  const idx = _vendors.findIndex(v => v.id === id)
  if (idx >= 0) _vendors[idx].is_active = false
}

// ============================================================================
// BUYERS
// ============================================================================

export async function getBuyers() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('vendors').select('*').eq('type', 'buyer').eq('is_active', true).order('name')
    return (data || []).map(v => ({ id: v.id, name: v.name, contactPerson: v.contact_person || '', phone: v.phone || '', email: v.email, location: v.address || 'Nigeria', pricingHistory: [], isActive: v.is_active, createdAt: v.created_at, totalTransactions: v.total_transactions || 0, totalKgSold: v.total_kg_sold || 0 }))
  }
  return _buyers.filter(b => b.is_active).map(v => ({ id: v.id, name: v.name, contactPerson: v.contact_person || '', phone: v.phone || '', email: v.email, location: v.address || 'Nigeria', pricingHistory: [], isActive: v.is_active, createdAt: v.created_at, totalTransactions: v.total_transactions || 0, totalKgSold: v.total_kg_sold || 0 }))
}

export async function createBuyer(buyer) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('vendors').insert({ name: buyer.name, type: 'buyer', contact_person: buyer.contactPerson, email: buyer.email, phone: buyer.phone, address: buyer.location }).select().single()
    if (error) throw error
    return { id: data.id, name: data.name, contactPerson: data.contact_person || '', phone: data.phone || '', email: data.email, location: data.address || 'Nigeria', pricingHistory: [], isActive: data.is_active, createdAt: data.created_at, totalTransactions: 0, totalKgSold: 0 }
  }
  const newB = { id: nextId('b'), name: buyer.name, type: 'buyer', contact_person: buyer.contactPerson || buyer.name, email: buyer.email || '', phone: buyer.phone || '', address: buyer.location || 'Nigeria', notes: buyer.notes || '', is_active: true, created_at: new Date().toISOString(), total_transactions: 0, total_kg_sold: 0 }
  _buyers.push(newB)
  return { id: newB.id, name: newB.name, contactPerson: newB.contact_person || '', phone: newB.phone || '', email: newB.email, location: newB.address || 'Nigeria', pricingHistory: [], isActive: newB.is_active, createdAt: newB.created_at, totalTransactions: 0, totalKgSold: 0 }
}

export async function updateBuyer(id, updates) {
  if (isSupabaseConfigured) {
    const updateData = {}
    if (updates.name) updateData.name = updates.name
    if (updates.contactPerson) updateData.contact_person = updates.contactPerson
    if (updates.phone) updateData.phone = updates.phone
    if (updates.email) updateData.email = updates.email
    if (updates.location) updateData.address = updates.location
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    const { data, error } = await supabase.from('vendors').update(updateData).eq('id', id).select().single()
    if (error) return undefined
    return { id: data.id, name: data.name, contactPerson: data.contact_person || '', phone: data.phone || '', email: data.email, location: data.address || 'Nigeria', pricingHistory: [], isActive: data.is_active, createdAt: data.created_at, totalTransactions: 0, totalKgSold: 0 }
  }
  const idx = _buyers.findIndex(b => b.id === id)
  if (idx < 0) return undefined
  if (updates.name) _buyers[idx].name = updates.name
  if (updates.contactPerson) _buyers[idx].contact_person = updates.contactPerson
  if (updates.phone) _buyers[idx].phone = updates.phone
  if (updates.email) _buyers[idx].email = updates.email
  if (updates.location) _buyers[idx].address = updates.location
  if (updates.isActive !== undefined) _buyers[idx].is_active = updates.isActive
  const b = _buyers[idx]
  return { id: b.id, name: b.name, contactPerson: b.contact_person || '', phone: b.phone || '', email: b.email, location: b.address || 'Nigeria', pricingHistory: [], isActive: b.is_active, createdAt: b.created_at, totalTransactions: b.total_transactions || 0, totalKgSold: b.total_kg_sold || 0 }
}

export async function deleteBuyer(id) {
  if (isSupabaseConfigured) { await supabase.from('vendors').update({ is_active: false }).eq('id', id); return }
  const idx = _buyers.findIndex(b => b.id === id)
  if (idx >= 0) _buyers[idx].is_active = false
}


// ============================================================================
// LOTS
// ============================================================================

export async function getLots() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('lots').select('*, vendors(name)').order('purchase_date', { ascending: false })
    return (data || []).map(l => ({ id: l.id, lotNumber: l.lot_number, vendorId: l.vendor_id, vendorName: l.vendors?.name || 'Unknown', vendor: { name: l.vendors?.name || 'Unknown' }, purchaseDate: l.purchase_date, expectedKg: l.expected_kg, actualKg: l.actual_kg || 0, netWeight: l.actual_kg || l.expected_kg || 0, pricePerKg: l.price_per_kg, finalPricePerKg: l.price_per_kg, basePricePerKg: l.price_per_kg, totalCost: l.total_cost, status: l.status, paymentStatus: l.payment_status || 'pending', amountPaid: l.amount_paid || 0, notes: l.notes, materialType: l.material_type || 'PET', grade: l.grade || 'A', grossWeight: l.gross_weight || (l.actual_kg || l.expected_kg || 0), tareWeight: l.tare_weight || 0, createdAt: l.created_at, createdBy: l.created_by }))
  }
  return _lots.map(l => {
    const vendor = _vendors.find(v => v.id === l.vendor_id)
    return { id: l.id, lotNumber: l.lot_number, vendorId: l.vendor_id, vendorName: vendor?.name || 'Unknown', vendor: { name: vendor?.name || 'Unknown' }, purchaseDate: l.purchase_date, expectedKg: l.expected_kg, actualKg: l.actual_kg || 0, netWeight: l.actual_kg || l.expected_kg || 0, pricePerKg: l.price_per_kg, finalPricePerKg: l.price_per_kg, basePricePerKg: l.price_per_kg, totalCost: l.total_cost, status: l.status, paymentStatus: l.payment_status || 'pending', amountPaid: l.amount_paid || 0, notes: l.notes, materialType: l.material_type || 'PET', grade: l.grade || 'A', grossWeight: l.gross_weight || (l.actual_kg || l.expected_kg || 0), tareWeight: l.tare_weight || 0, createdAt: l.created_at, createdBy: l.created_by }
  })
}

export async function createLot(lot) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('lots').insert({ lot_number: lot.lotNumber, vendor_id: lot.vendorId, purchase_date: lot.purchaseDate, expected_kg: lot.expectedKg, price_per_kg: lot.pricePerKg, total_cost: lot.totalCost, status: 'pending_delivery', notes: lot.notes, created_by: lot.createdBy }).select('*, vendors(name)').single()
    if (error) throw error
    return { id: data.id, lotNumber: data.lot_number, vendorId: data.vendor_id, vendorName: data.vendors?.name || 'Unknown', vendor: { name: data.vendors?.name || 'Unknown' }, purchaseDate: data.purchase_date, expectedKg: data.expected_kg, actualKg: data.actual_kg || 0, netWeight: data.actual_kg || data.expected_kg || 0, pricePerKg: data.price_per_kg, finalPricePerKg: data.price_per_kg, basePricePerKg: data.price_per_kg, totalCost: data.total_cost, status: data.status, paymentStatus: data.payment_status || 'pending', amountPaid: data.amount_paid || 0, notes: data.notes, materialType: data.material_type || 'PET', grade: data.grade || 'A', grossWeight: data.gross_weight || (data.actual_kg || data.expected_kg || 0), tareWeight: data.tare_weight || 0, createdAt: data.created_at, createdBy: data.created_by }
  }
  const vendor = _vendors.find(v => v.id === lot.vendorId)
  const newLot = { id: nextId('l'), lot_number: lot.lotNumber, vendor_id: lot.vendorId, purchase_date: lot.purchaseDate, expected_kg: lot.expectedKg || lot.netWeight || 0, actual_kg: null, price_per_kg: lot.pricePerKg || lot.finalPricePerKg || 0, total_cost: lot.totalCost || 0, status: 'pending_delivery', payment_status: 'pending', amount_paid: 0, notes: lot.notes || '', material_type: lot.materialType || 'PET', grade: lot.grade || 'A', gross_weight: lot.grossWeight || 0, tare_weight: lot.tareWeight || 0, created_by: lot.createdBy, created_at: new Date().toISOString() }
  _lots.push(newLot)
  return { id: newLot.id, lotNumber: newLot.lot_number, vendorId: newLot.vendor_id, vendorName: vendor?.name || 'Unknown', vendor: { name: vendor?.name || 'Unknown' }, purchaseDate: newLot.purchase_date, expectedKg: newLot.expected_kg, actualKg: 0, netWeight: newLot.expected_kg, pricePerKg: newLot.price_per_kg, finalPricePerKg: newLot.price_per_kg, basePricePerKg: newLot.price_per_kg, totalCost: newLot.total_cost, status: newLot.status, paymentStatus: 'pending', amountPaid: 0, notes: newLot.notes, materialType: newLot.material_type, grade: newLot.grade, grossWeight: newLot.gross_weight, tareWeight: newLot.tare_weight, createdAt: newLot.created_at, createdBy: newLot.created_by }
}

export async function updateLot(id, updates) {
  if (isSupabaseConfigured) {
    const updateData = {}
    if (updates.actualKg !== undefined) updateData.actual_kg = updates.actualKg
    if (updates.status) updateData.status = updates.status
    if (updates.notes) updateData.notes = updates.notes
    const { data, error } = await supabase.from('lots').update(updateData).eq('id', id).select('*, vendors(name)').single()
    if (error) return undefined
    return { id: data.id, lotNumber: data.lot_number, vendorId: data.vendor_id, vendorName: data.vendors?.name || 'Unknown', vendor: { name: data.vendors?.name || 'Unknown' }, purchaseDate: data.purchase_date, expectedKg: data.expected_kg, actualKg: data.actual_kg || 0, netWeight: data.actual_kg || data.expected_kg || 0, pricePerKg: data.price_per_kg, finalPricePerKg: data.price_per_kg, basePricePerKg: data.price_per_kg, totalCost: data.total_cost, status: data.status, paymentStatus: data.payment_status || 'pending', amountPaid: data.amount_paid || 0, notes: data.notes, materialType: data.material_type || 'PET', grade: data.grade || 'A', grossWeight: data.gross_weight || (data.actual_kg || data.expected_kg || 0), tareWeight: data.tare_weight || 0, createdAt: data.created_at, createdBy: data.created_by }
  }
  const idx = _lots.findIndex(l => l.id === id)
  if (idx < 0) return undefined
  if (updates.actualKg !== undefined) _lots[idx].actual_kg = updates.actualKg
  if (updates.status) _lots[idx].status = updates.status
  if (updates.notes) _lots[idx].notes = updates.notes
  const l = _lots[idx]
  const vendor = _vendors.find(v => v.id === l.vendor_id)
  return { id: l.id, lotNumber: l.lot_number, vendorId: l.vendor_id, vendorName: vendor?.name || 'Unknown', vendor: { name: vendor?.name || 'Unknown' }, purchaseDate: l.purchase_date, expectedKg: l.expected_kg, actualKg: l.actual_kg || 0, netWeight: l.actual_kg || l.expected_kg || 0, pricePerKg: l.price_per_kg, finalPricePerKg: l.price_per_kg, basePricePerKg: l.price_per_kg, totalCost: l.total_cost, status: l.status, paymentStatus: l.payment_status || 'pending', amountPaid: l.amount_paid || 0, notes: l.notes, materialType: l.material_type || 'PET', grade: l.grade || 'A', grossWeight: l.gross_weight || (l.actual_kg || l.expected_kg || 0), tareWeight: l.tare_weight || 0, createdAt: l.created_at, createdBy: l.created_by }
}

export async function updateLotPayment(id, amountPaid) {
  if (isSupabaseConfigured) {
    const { data: lot } = await supabase.from('lots').select('amount_paid, total_cost').eq('id', id).single()
    const newPaid = (lot?.amount_paid || 0) + amountPaid
    const status = newPaid >= (lot?.total_cost || 0) ? 'paid' : newPaid > 0 ? 'partial' : 'pending'
    const { data, error } = await supabase.from('lots').update({ amount_paid: newPaid, payment_status: status }).eq('id', id).select('*, vendors(name)').single()
    if (error) return undefined
    return { id: data.id, lotNumber: data.lot_number, vendorId: data.vendor_id, vendorName: data.vendors?.name || 'Unknown', vendor: { name: data.vendors?.name || 'Unknown' }, purchaseDate: data.purchase_date, expectedKg: data.expected_kg, actualKg: data.actual_kg || 0, netWeight: data.actual_kg || data.expected_kg || 0, pricePerKg: data.price_per_kg, finalPricePerKg: data.price_per_kg, basePricePerKg: data.price_per_kg, totalCost: data.total_cost, status: data.status, paymentStatus: data.payment_status || 'pending', amountPaid: data.amount_paid || 0, notes: data.notes, materialType: data.material_type || 'PET', grade: data.grade || 'A', grossWeight: data.gross_weight || (data.actual_kg || data.expected_kg || 0), tareWeight: data.tare_weight || 0, createdAt: data.created_at, createdBy: data.created_by }
  }
  const idx = _lots.findIndex(l => l.id === id)
  if (idx < 0) return undefined
  const current = _lots[idx]
  const newPaid = (current.amount_paid || 0) + amountPaid
  const status = newPaid >= (current.total_cost || 0) ? 'paid' : newPaid > 0 ? 'partial' : 'pending'
  _lots[idx].amount_paid = newPaid
  _lots[idx].payment_status = status
  const l = _lots[idx]
  const vendor = _vendors.find(v => v.id === l.vendor_id)
  return { id: l.id, lotNumber: l.lot_number, vendorId: l.vendor_id, vendorName: vendor?.name || 'Unknown', vendor: { name: vendor?.name || 'Unknown' }, purchaseDate: l.purchase_date, expectedKg: l.expected_kg, actualKg: l.actual_kg || 0, netWeight: l.actual_kg || l.expected_kg || 0, pricePerKg: l.price_per_kg, finalPricePerKg: l.price_per_kg, basePricePerKg: l.price_per_kg, totalCost: l.total_cost, status: l.status, paymentStatus: l.payment_status || 'pending', amountPaid: l.amount_paid || 0, notes: l.notes, materialType: l.material_type || 'PET', grade: l.grade || 'A', grossWeight: l.gross_weight || (l.actual_kg || l.expected_kg || 0), tareWeight: l.tare_weight || 0, createdAt: l.created_at, createdBy: l.created_by }
}

export async function deleteLot(id) {
  if (isSupabaseConfigured) { await supabase.from('lots').delete().eq('id', id); return }
  const idx = _lots.findIndex(l => l.id === id)
  if (idx >= 0) _lots.splice(idx, 1)
}

// ============================================================================
// TRIPS
// ============================================================================

export async function getTrips() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('trips').select('*').order('scheduled_date', { ascending: false })
    return (data || []).map(t => ({ id: t.id, tripNumber: t.trip_number, lotId: t.lot_id, lotNumber: t.lot_id, driverName: t.driver_name, driverPhone: t.driver_phone, vehicleNumber: t.vehicle_number, pickupLocation: t.pickup_location, deliveryLocation: t.delivery_location, origin: t.origin || t.pickup_location, destination: t.destination || t.delivery_location, type: t.type || 'pickup', status: t.status, vehicleType: t.vehicle_type || 'Truck', cost: t.logistics_cost || 0, totalCost: t.total_cost || t.logistics_cost || 0, fuelCost: t.fuel_cost || 0, driverWage: t.driver_wage || 0, otherCosts: t.other_costs || 0, scheduledDate: t.scheduled_date, departureTime: t.departure_time || '', arrivalTime: t.arrival_time || '', completedDate: t.completed_date, notes: t.notes || '', accountNumber: t.account_number || '', paymentTiming: t.payment_timing || 'pending', paymentStatus: t.payment_status || 'unpaid', createdAt: t.created_at }))
  }
  return _trips.map(t => ({ id: t.id, tripNumber: t.trip_number, lotId: t.lot_id, lotNumber: t.lot_id, driverName: t.driver_name, driverPhone: t.driver_phone, vehicleNumber: t.vehicle_number, pickupLocation: t.pickup_location, deliveryLocation: t.delivery_location, origin: t.origin || t.pickup_location, destination: t.destination || t.delivery_location, type: t.type || 'pickup', status: t.status, vehicleType: t.vehicle_type || 'Truck', cost: t.logistics_cost || 0, totalCost: t.total_cost || t.logistics_cost || 0, fuelCost: t.fuel_cost || 0, driverWage: t.driver_wage || 0, otherCosts: t.other_costs || 0, scheduledDate: t.scheduled_date, departureTime: t.departure_time || '', arrivalTime: t.arrival_time || '', completedDate: t.completed_date, notes: t.notes || '', accountNumber: t.account_number || '', paymentTiming: t.payment_timing || 'pending', paymentStatus: t.payment_status || 'unpaid', createdAt: t.created_at }))
}

export async function createTrip(trip) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('trips').insert({ trip_number: trip.tripNumber, lot_id: trip.lotId, type: trip.type || 'pickup', driver_name: trip.driverName, driver_phone: trip.driverPhone, vehicle_number: trip.vehicleNumber, pickup_location: trip.pickupLocation, delivery_location: trip.deliveryLocation, logistics_cost: trip.cost, fuel_cost: trip.fuelCost, driver_wage: trip.driverWage, other_costs: trip.otherCosts, status: trip.status, scheduled_date: trip.scheduledDate, completed_date: trip.completedDate, account_number: trip.accountNumber || '', payment_timing: trip.paymentTiming || 'pending', payment_status: trip.paymentStatus || 'unpaid' }).select().single()
    if (error) throw error
    return { id: data.id, tripNumber: data.trip_number, lotId: data.lot_id, lotNumber: data.lot_id, driverName: data.driver_name, driverPhone: data.driver_phone, vehicleNumber: data.vehicle_number, pickupLocation: data.pickup_location, deliveryLocation: data.delivery_location, origin: data.pickup_location, destination: data.delivery_location, type: data.type || 'pickup', status: data.status, vehicleType: data.vehicle_type || 'Truck', cost: data.logistics_cost || 0, totalCost: data.logistics_cost || 0, fuelCost: data.fuel_cost || 0, driverWage: data.driver_wage || 0, otherCosts: data.other_costs || 0, scheduledDate: data.scheduled_date, departureTime: data.departure_time || '', arrivalTime: data.arrival_time || '', completedDate: data.completed_date, notes: data.notes || '', accountNumber: data.account_number || '', paymentTiming: data.payment_timing || 'pending', paymentStatus: data.payment_status || 'unpaid', createdAt: data.created_at }
  }
  const newTrip = { id: nextId('t'), trip_number: trip.tripNumber, lot_id: trip.lotId, type: trip.type || 'pickup', driver_name: trip.driverName, driver_phone: trip.driverPhone, vehicle_number: trip.vehicleNumber, pickup_location: trip.pickupLocation, delivery_location: trip.deliveryLocation, logistics_cost: trip.cost, fuel_cost: trip.fuelCost || 0, driver_wage: trip.driverWage || 0, other_costs: trip.otherCosts || 0, status: trip.status || 'scheduled', scheduled_date: trip.scheduledDate, completed_date: trip.completedDate || null, account_number: trip.accountNumber || '', payment_timing: trip.paymentTiming || 'pending', payment_status: trip.paymentStatus || 'unpaid', created_at: new Date().toISOString() }
  _trips.push(newTrip)
  return { id: newTrip.id, tripNumber: newTrip.trip_number, lotId: newTrip.lot_id, lotNumber: newTrip.lot_id, driverName: newTrip.driver_name, driverPhone: newTrip.driver_phone, vehicleNumber: newTrip.vehicle_number, pickupLocation: newTrip.pickup_location, deliveryLocation: newTrip.delivery_location, origin: newTrip.pickup_location, destination: newTrip.delivery_location, type: newTrip.type || 'pickup', status: newTrip.status, vehicleType: 'Truck', cost: newTrip.logistics_cost || 0, totalCost: newTrip.logistics_cost || 0, fuelCost: newTrip.fuel_cost || 0, driverWage: newTrip.driver_wage || 0, otherCosts: newTrip.other_costs || 0, scheduledDate: newTrip.scheduled_date, departureTime: '', arrivalTime: '', completedDate: newTrip.completed_date, notes: '', accountNumber: newTrip.account_number || '', paymentTiming: newTrip.payment_timing || 'pending', paymentStatus: newTrip.payment_status || 'unpaid', createdAt: newTrip.created_at }
}

export async function deleteTrip(id) {
  if (isSupabaseConfigured) { await supabase.from('trips').delete().eq('id', id); return }
  const idx = _trips.findIndex(t => t.id === id)
  if (idx >= 0) _trips.splice(idx, 1)
}

export async function updateTripStatus(id, newStatus) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('trips').update({ status: newStatus }).eq('id', id).select().single()
    if (error) throw error
    return { id: data.id, tripNumber: data.trip_number, lotId: data.lot_id, lotNumber: data.lot_id, driverName: data.driver_name, driverPhone: data.driver_phone, vehicleNumber: data.vehicle_number, pickupLocation: data.pickup_location, deliveryLocation: data.delivery_location, origin: data.pickup_location, destination: data.delivery_location, type: data.type || 'pickup', status: data.status, vehicleType: data.vehicle_type || 'Truck', cost: data.logistics_cost || 0, totalCost: data.total_cost || data.logistics_cost || 0, fuelCost: data.fuel_cost || 0, driverWage: data.driver_wage || 0, otherCosts: data.other_costs || 0, scheduledDate: data.scheduled_date, departureTime: data.departure_time || '', arrivalTime: data.arrival_time || '', completedDate: data.completed_date, notes: data.notes || '', accountNumber: data.account_number || '', paymentTiming: data.payment_timing || 'pending', paymentStatus: data.payment_status || 'unpaid', createdAt: data.created_at }
  }
  const idx = _trips.findIndex(t => t.id === id)
  if (idx >= 0) _trips[idx].status = newStatus
}

export function getHandlingTypes() {
  return [
    { id: 'offloading', name: 'Offloading', category: 'receiving', unitCost: 50 },
    { id: 'sorting', name: 'Sorting', category: 'processing', unitCost: 30 },
    { id: 'grinding', name: 'Grinding', category: 'processing', unitCost: 40 },
    { id: 'washing', name: 'Washing', category: 'processing', unitCost: 35 },
    { id: 'drying', name: 'Drying', category: 'processing', unitCost: 25 },
    { id: 'bagging', name: 'Bagging', category: 'packaging', unitCost: 20 },
    { id: 'dispatch', name: 'Dispatch', category: 'logistics', unitCost: 60 },
  ]
}

// ============================================================================
// HANDLING
// ============================================================================

export async function getHandlingEvents() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('handling').select('*').order('offloading_date', { ascending: false })
    return (data || []).map(h => ({ id: h.id, lotId: h.lot_id, offloaderName: h.offloader_name || '', handlingCost: h.handling_cost || 0, date: h.offloading_date || new Date().toISOString(), notes: h.notes || '', accountNumber: h.account_number || '', paymentTiming: h.payment_timing || 'pending', paymentStatus: h.payment_status || 'unpaid', createdAt: h.created_at }))
  }
  return _handling.map(h => ({ id: h.id, lotId: h.lot_id, offloaderName: h.offloader_name || '', handlingCost: h.handling_cost || 0, date: h.offloading_date || new Date().toISOString(), notes: h.notes || '', accountNumber: h.account_number || '', paymentTiming: h.payment_timing || 'pending', paymentStatus: h.payment_status || 'unpaid', createdAt: h.created_at }))
}

export async function createHandlingEvent(event) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('handling').insert({ lot_id: event.lotId, offloader_name: event.offloaderName, handling_cost: event.handlingCost, offloading_date: event.date, notes: event.notes || '', account_number: event.accountNumber || '', payment_timing: event.paymentTiming || 'pending', payment_status: event.paymentStatus || 'unpaid' }).select().single()
    if (error) throw error
    return { id: data.id, lotId: data.lot_id, lotNumber: data.lot_id, handlingType: { name: 'Offloading' }, typeName: 'Offloading', offloaderName: data.offloader_name || '', handlingCost: data.handling_cost || 0, cost: data.handling_cost || 0, amount: data.handling_cost || 0, paidTo: data.offloader_name || '', isPaid: (data.payment_status === 'paid'), date: data.offloading_date || new Date().toISOString(), notes: data.notes || '', accountNumber: data.account_number || '', paymentTiming: data.payment_timing || 'pending', paymentStatus: data.payment_status || 'unpaid', direction: 'inbound', linkedType: '', quantity: 0, unit: 'kg', rate: 0, createdAt: data.created_at }
  }
  const newH = { id: nextId('h'), lot_id: event.lotId, offloader_name: event.offloaderName, handling_cost: event.handlingCost, offloading_date: event.date, notes: event.notes || '', account_number: event.accountNumber || '', payment_timing: event.paymentTiming || 'pending', payment_status: event.paymentStatus || 'unpaid', created_at: new Date().toISOString() }
  _handling.push(newH)
  return { id: newH.id, lotId: newH.lot_id, lotNumber: newH.lot_id, handlingType: { name: 'Offloading' }, typeName: 'Offloading', offloaderName: newH.offloader_name || '', handlingCost: newH.handling_cost || 0, cost: newH.handling_cost || 0, amount: newH.handling_cost || 0, paidTo: newH.offloader_name || '', isPaid: (newH.payment_status === 'paid'), date: newH.offloading_date, notes: newH.notes || '', accountNumber: newH.account_number || '', paymentTiming: newH.payment_timing || 'pending', paymentStatus: newH.payment_status || 'unpaid', direction: 'inbound', linkedType: '', quantity: 0, unit: 'kg', rate: 0, createdAt: newH.created_at }
}

export async function deleteHandlingEvent(id) {
  if (isSupabaseConfigured) { await supabase.from('handling').delete().eq('id', id); return }
  const idx = _handling.findIndex(h => h.id === id)
  if (idx >= 0) _handling.splice(idx, 1)
}

// ============================================================================
// BATCHES
// ============================================================================

export async function getBatches() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('batches').select('*, lots(lot_number, vendors(name))').order('created_at', { ascending: false })
    return (data || []).map(b => ({ id: b.id, batchNumber: b.batch_number, lotId: b.lot_id, lotNumber: b.lots?.lot_number || 'Unknown', vendorName: b.lots?.vendors?.name || 'Unknown', materialType: 'PET', initialWeight: b.initial_weight, currentWeight: b.final_dry_flakes_weight || b.washed_flakes_weight || b.ground_flakes_weight || b.sorted_pet_weight || b.initial_weight, targetOutputKg: Math.round(b.initial_weight * 0.88), weights: { unsortedPet: b.initial_weight, sortedPet: b.sorted_pet_weight || 0, caps: b.caps_weight || 0, labels: b.labels_weight || 0, groundFlakes: b.ground_flakes_weight || 0, washedFlakes: b.washed_flakes_weight || 0, finalDryFlakes: b.final_dry_flakes_weight || 0, rejects: b.rejects_weight || 0 }, costs: { materials: b.material_cost || 0, labour: b.labour_cost || 0, utilities: b.utilities_cost || 0, logistics: b.logistics_cost || 0, handling: b.handling_cost || 0, other: b.other_cost || 0, total: (b.material_cost || 0) + (b.labour_cost || 0) + (b.utilities_cost || 0) + (b.logistics_cost || 0) + (b.handling_cost || 0) + (b.other_cost || 0) }, costPerKg: b.cost_per_kg || 0, currentState: b.current_state, status: b.status, checkpoints: [], productionStartDate: b.created_at, estimatedCompletionDate: undefined, actualCompletionDate: undefined, notes: b.notes || '', stickerPrinted: b.sticker_printed || false, totalYield: b.total_yield_percent || 0, createdAt: b.created_at, updatedAt: b.updated_at }))
  }
  return _batches.map(b => {
    const lot = _lots.find(l => l.id === b.lot_id)
    const vendor = _vendors.find(v => v.id === lot?.vendor_id)
    return { id: b.id, batchNumber: b.batch_number, lotId: b.lot_id, lotNumber: lot?.lot_number || 'Unknown', vendorName: vendor?.name || 'Unknown', materialType: 'PET', initialWeight: b.initial_weight, currentWeight: b.final_dry_flakes_weight || b.washed_flakes_weight || b.ground_flakes_weight || b.sorted_pet_weight || b.initial_weight, targetOutputKg: Math.round(b.initial_weight * 0.88), weights: { unsortedPet: b.initial_weight, sortedPet: b.sorted_pet_weight || 0, caps: b.caps_weight || 0, labels: b.labels_weight || 0, groundFlakes: b.ground_flakes_weight || 0, washedFlakes: b.washed_flakes_weight || 0, finalDryFlakes: b.final_dry_flakes_weight || 0, rejects: b.rejects_weight || 0 }, costs: { materials: b.material_cost || 0, labour: b.labour_cost || 0, utilities: b.utilities_cost || 0, logistics: b.logistics_cost || 0, handling: b.handling_cost || 0, other: b.other_cost || 0, total: (b.material_cost || 0) + (b.labour_cost || 0) + (b.utilities_cost || 0) + (b.logistics_cost || 0) + (b.handling_cost || 0) + (b.other_cost || 0) }, costPerKg: b.cost_per_kg || 0, currentState: b.current_state, status: b.status, checkpoints: [], productionStartDate: b.created_at, estimatedCompletionDate: undefined, actualCompletionDate: undefined, notes: b.notes || '', stickerPrinted: b.sticker_printed || false, totalYield: b.total_yield_percent || 0, createdAt: b.created_at, updatedAt: b.updated_at }
  })
}

export async function createBatch(batch) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('batches').insert({ batch_number: batch.batchNumber, lot_id: batch.lotId, initial_weight: batch.initialWeight, sorted_pet_weight: batch.weights?.sortedPet || 0, caps_weight: batch.weights?.caps || 0, labels_weight: batch.weights?.labels || 0, ground_flakes_weight: batch.weights?.groundFlakes || 0, washed_flakes_weight: batch.weights?.washedFlakes || 0, final_dry_flakes_weight: batch.weights?.finalDryFlakes || 0, rejects_weight: batch.weights?.rejects || 0, total_yield_percent: 0, material_cost: 0, labour_cost: 0, logistics_cost: 0, handling_cost: 0, other_cost: 0, cost_per_kg: 0, current_state: batch.currentState || 'unsorted_pet', status: batch.status || 'active' }).select('*, lots(lot_number, vendors(name))').single()
    if (error) throw error
    return { id: data.id, batchNumber: data.batch_number, lotId: data.lot_id, lotNumber: data.lots?.lot_number || 'Unknown', vendorName: data.lots?.vendors?.name || 'Unknown', materialType: 'PET', initialWeight: data.initial_weight, currentWeight: data.final_dry_flakes_weight || data.initial_weight, targetOutputKg: Math.round(data.initial_weight * 0.88), weights: { unsortedPet: data.initial_weight, sortedPet: data.sorted_pet_weight || 0, caps: data.caps_weight || 0, labels: data.labels_weight || 0, groundFlakes: data.ground_flakes_weight || 0, washedFlakes: data.washed_flakes_weight || 0, finalDryFlakes: data.final_dry_flakes_weight || 0, rejects: data.rejects_weight || 0 }, costs: { materials: data.material_cost || 0, labour: data.labour_cost || 0, utilities: data.utilities_cost || 0, logistics: data.logistics_cost || 0, handling: data.handling_cost || 0, other: data.other_cost || 0, total: (data.material_cost || 0) + (data.labour_cost || 0) + (data.utilities_cost || 0) + (data.logistics_cost || 0) + (data.handling_cost || 0) + (data.other_cost || 0) }, costPerKg: data.cost_per_kg || 0, currentState: data.current_state, status: data.status, checkpoints: [], productionStartDate: data.created_at, estimatedCompletionDate: undefined, actualCompletionDate: undefined, notes: data.notes || '', stickerPrinted: data.sticker_printed || false, totalYield: data.total_yield_percent || 0, createdAt: data.created_at, updatedAt: data.updated_at }
  }
  const lot = _lots.find(l => l.id === batch.lotId)
  const vendor = _vendors.find(v => v.id === lot?.vendor_id)
  const newB = { id: nextId('batch-'), batch_number: batch.batchNumber, lot_id: batch.lotId, initial_weight: batch.initialWeight, sorted_pet_weight: 0, caps_weight: 0, labels_weight: 0, ground_flakes_weight: 0, washed_flakes_weight: 0, final_dry_flakes_weight: 0, rejects_weight: 0, total_yield_percent: 0, material_cost: 0, labour_cost: 0, logistics_cost: 0, handling_cost: 0, other_cost: 0, cost_per_kg: 0, current_state: batch.currentState || 'unsorted_pet', status: batch.status || 'active', sticker_printed: false, notes: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  _batches.push(newB)
  return { id: newB.id, batchNumber: newB.batch_number, lotId: newB.lot_id, lotNumber: lot?.lot_number || 'Unknown', vendorName: vendor?.name || 'Unknown', materialType: 'PET', initialWeight: newB.initial_weight, currentWeight: newB.initial_weight, targetOutputKg: Math.round(newB.initial_weight * 0.88), weights: { unsortedPet: newB.initial_weight, sortedPet: 0, caps: 0, labels: 0, groundFlakes: 0, washedFlakes: 0, finalDryFlakes: 0, rejects: 0 }, costs: { materials: 0, labour: 0, utilities: 0, logistics: 0, handling: 0, other: 0, total: 0 }, costPerKg: 0, currentState: newB.current_state, status: newB.status, checkpoints: [], productionStartDate: newB.created_at, estimatedCompletionDate: undefined, actualCompletionDate: undefined, notes: '', stickerPrinted: false, totalYield: 0, createdAt: newB.created_at, updatedAt: newB.updated_at }
}


export async function updateBatch(id, updates) {
  if (isSupabaseConfigured) {
    const updateData = {}
    if (updates.currentState) updateData.current_state = updates.currentState
    if (updates.status) updateData.status = updates.status
    if (updates.weights) {
      if (updates.weights.sortedPet !== undefined) updateData.sorted_pet_weight = updates.weights.sortedPet
      if (updates.weights.caps !== undefined) updateData.caps_weight = updates.weights.caps
      if (updates.weights.labels !== undefined) updateData.labels_weight = updates.weights.labels
      if (updates.weights.groundFlakes !== undefined) updateData.ground_flakes_weight = updates.weights.groundFlakes
      if (updates.weights.washedFlakes !== undefined) updateData.washed_flakes_weight = updates.weights.washedFlakes
      if (updates.weights.finalDryFlakes !== undefined) updateData.final_dry_flakes_weight = updates.weights.finalDryFlakes
      if (updates.weights.rejects !== undefined) updateData.rejects_weight = updates.weights.rejects
    }
    if (updates.costPerKg !== undefined) updateData.cost_per_kg = updates.costPerKg
    const { data, error } = await supabase.from('batches').update(updateData).eq('id', id).select('*, lots(lot_number, vendors(name))').single()
    if (error) return undefined
    return { id: data.id, batchNumber: data.batch_number, lotId: data.lot_id, lotNumber: data.lots?.lot_number || 'Unknown', vendorName: data.lots?.vendors?.name || 'Unknown', materialType: 'PET', initialWeight: data.initial_weight, currentWeight: data.final_dry_flakes_weight || data.initial_weight, targetOutputKg: Math.round(data.initial_weight * 0.88), weights: { unsortedPet: data.initial_weight, sortedPet: data.sorted_pet_weight || 0, caps: data.caps_weight || 0, labels: data.labels_weight || 0, groundFlakes: data.ground_flakes_weight || 0, washedFlakes: data.washed_flakes_weight || 0, finalDryFlakes: data.final_dry_flakes_weight || 0, rejects: data.rejects_weight || 0 }, costs: { materials: data.material_cost || 0, labour: data.labour_cost || 0, utilities: data.utilities_cost || 0, logistics: data.logistics_cost || 0, handling: data.handling_cost || 0, other: data.other_cost || 0, total: (data.material_cost || 0) + (data.labour_cost || 0) + (data.utilities_cost || 0) + (data.logistics_cost || 0) + (data.handling_cost || 0) + (data.other_cost || 0) }, costPerKg: data.cost_per_kg || 0, currentState: data.current_state, status: data.status, checkpoints: [], productionStartDate: data.created_at, estimatedCompletionDate: undefined, actualCompletionDate: undefined, notes: data.notes || '', stickerPrinted: data.sticker_printed || false, totalYield: data.total_yield_percent || 0, createdAt: data.created_at, updatedAt: data.updated_at }
  }
  const idx = _batches.findIndex(b => b.id === id)
  if (idx < 0) return undefined
  if (updates.currentState) _batches[idx].current_state = updates.currentState
  if (updates.status) _batches[idx].status = updates.status
  if (updates.weights) {
    if (updates.weights.sortedPet !== undefined) _batches[idx].sorted_pet_weight = updates.weights.sortedPet
    if (updates.weights.caps !== undefined) _batches[idx].caps_weight = updates.weights.caps
    if (updates.weights.labels !== undefined) _batches[idx].labels_weight = updates.weights.labels
    if (updates.weights.groundFlakes !== undefined) _batches[idx].ground_flakes_weight = updates.weights.groundFlakes
    if (updates.weights.washedFlakes !== undefined) _batches[idx].washed_flakes_weight = updates.weights.washedFlakes
    if (updates.weights.finalDryFlakes !== undefined) _batches[idx].final_dry_flakes_weight = updates.weights.finalDryFlakes
    if (updates.weights.rejects !== undefined) _batches[idx].rejects_weight = updates.weights.rejects
  }
  if (updates.costPerKg !== undefined) _batches[idx].cost_per_kg = updates.costPerKg
  _batches[idx].updated_at = new Date().toISOString()
  const b = _batches[idx]
  const lot = _lots.find(l => l.id === b.lot_id)
  const vendor = _vendors.find(v => v.id === lot?.vendor_id)
  return { id: b.id, batchNumber: b.batch_number, lotId: b.lot_id, lotNumber: lot?.lot_number || 'Unknown', vendorName: vendor?.name || 'Unknown', materialType: 'PET', initialWeight: b.initial_weight, currentWeight: b.final_dry_flakes_weight || b.initial_weight, targetOutputKg: Math.round(b.initial_weight * 0.88), weights: { unsortedPet: b.initial_weight, sortedPet: b.sorted_pet_weight || 0, caps: b.caps_weight || 0, labels: b.labels_weight || 0, groundFlakes: b.ground_flakes_weight || 0, washedFlakes: b.washed_flakes_weight || 0, finalDryFlakes: b.final_dry_flakes_weight || 0, rejects: b.rejects_weight || 0 }, costs: { materials: b.material_cost || 0, labour: b.labour_cost || 0, utilities: b.utilities_cost || 0, logistics: b.logistics_cost || 0, handling: b.handling_cost || 0, other: b.other_cost || 0, total: (b.material_cost || 0) + (b.labour_cost || 0) + (b.utilities_cost || 0) + (b.logistics_cost || 0) + (b.handling_cost || 0) + (b.other_cost || 0) }, costPerKg: b.cost_per_kg || 0, currentState: b.current_state, status: b.status, checkpoints: [], productionStartDate: b.created_at, estimatedCompletionDate: undefined, actualCompletionDate: undefined, notes: b.notes || '', stickerPrinted: b.sticker_printed || false, totalYield: b.total_yield_percent || 0, createdAt: b.created_at, updatedAt: b.updated_at }
}

export async function deleteBatch(id) {
  if (isSupabaseConfigured) { await supabase.from('batches').delete().eq('id', id); return }
  const idx = _batches.findIndex(b => b.id === id)
  if (idx >= 0) _batches.splice(idx, 1)
}

// ============================================================================
// WORKERS
// ============================================================================

export async function getWorkers() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('workers').select('*').eq('is_active', true).order('name')
    return (data || []).map(w => ({ id: w.id, name: w.name, role: w.role, phone: w.phone || '', isActive: w.is_active, createdAt: w.created_at, totalKgSorted: w.total_kg_sorted || 0, totalWagesEarned: w.total_wages_earned || 0 }))
  }
  return _workers.filter(w => w.is_active).map(w => ({ id: w.id, name: w.name, role: w.role, phone: w.phone || '', isActive: w.is_active, createdAt: w.created_at, totalKgSorted: w.total_kg_sorted || 0, totalWagesEarned: w.total_wages_earned || 0 }))
}

export async function createWorker(worker) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('workers').insert({ name: worker.name, role: worker.role, phone: worker.phone, is_active: true }).select().single()
    if (error) throw error
    return { id: data.id, name: data.name, role: data.role, phone: data.phone || '', isActive: data.is_active, createdAt: data.created_at, totalKgSorted: 0, totalWagesEarned: 0 }
  }
  const newW = { id: nextId('w'), name: worker.name, role: worker.role, phone: worker.phone || '', is_active: true, created_at: new Date().toISOString(), total_kg_sorted: 0, total_wages_earned: 0 }
  _workers.push(newW)
  return { id: newW.id, name: newW.name, role: newW.role, phone: newW.phone || '', isActive: newW.is_active, createdAt: newW.created_at, totalKgSorted: 0, totalWagesEarned: 0 }
}

export async function updateWorker(id, updates) {
  if (isSupabaseConfigured) {
    const updateData = {}
    if (updates.name) updateData.name = updates.name
    if (updates.role) updateData.role = updates.role
    if (updates.phone) updateData.phone = updates.phone
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    const { data, error } = await supabase.from('workers').update(updateData).eq('id', id).select().single()
    if (error) return undefined
    return { id: data.id, name: data.name, role: data.role, phone: data.phone || '', isActive: data.is_active, createdAt: data.created_at, totalKgSorted: data.total_kg_sorted || 0, totalWagesEarned: data.total_wages_earned || 0 }
  }
  const idx = _workers.findIndex(w => w.id === id)
  if (idx < 0) return undefined
  if (updates.name) _workers[idx].name = updates.name
  if (updates.role) _workers[idx].role = updates.role
  if (updates.phone) _workers[idx].phone = updates.phone
  if (updates.isActive !== undefined) _workers[idx].is_active = updates.isActive
  const w = _workers[idx]
  return { id: w.id, name: w.name, role: w.role, phone: w.phone || '', isActive: w.is_active, createdAt: w.created_at, totalKgSorted: w.total_kg_sorted || 0, totalWagesEarned: w.total_wages_earned || 0 }
}

export async function deleteWorker(id) {
  if (isSupabaseConfigured) { await supabase.from('workers').update({ is_active: false }).eq('id', id); return }
  const idx = _workers.findIndex(w => w.id === id)
  if (idx >= 0) _workers[idx].is_active = false
}

// ============================================================================
// SORTING ENTRIES
// ============================================================================

export async function getSortingEntries() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('sorting_entries').select('*, workers(name)').order('created_at', { ascending: false })
    return (data || []).map(s => ({ id: s.id, batchId: s.batch_id, workerId: s.worker_id, workerName: s.workers?.name || 'Unknown', kgSorted: s.kg_sorted, wasteKg: s.waste_kg || 0, wageAmount: s.wage_amount || 0, date: s.date, notes: s.notes || '', accountNumber: s.account_number || '', paymentTiming: s.payment_timing || 'pending', paymentStatus: s.payment_status || 'unpaid', createdAt: s.created_at }))
  }
  return _sortingEntries.map(s => {
    const worker = _workers.find(w => w.id === s.worker_id)
    return { id: s.id, batchId: s.batch_id, workerId: s.worker_id, workerName: worker?.name || 'Unknown', kgSorted: s.kg_sorted, wasteKg: s.waste_kg || 0, wageAmount: s.wage_amount || 0, date: s.date, notes: s.notes || '', accountNumber: s.account_number || '', paymentTiming: s.payment_timing || 'pending', paymentStatus: s.payment_status || 'unpaid', createdAt: s.created_at }
  })
}

export async function createSortingEntry(entry) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('sorting_entries').insert({ batch_id: entry.batchId, worker_id: entry.workerId, kg_sorted: entry.kgSorted, waste_kg: entry.wasteKg, wage_amount: entry.wageAmount || 0, date: entry.date, notes: entry.notes || '', account_number: entry.accountNumber || '', payment_timing: entry.paymentTiming || 'pending', payment_status: entry.paymentStatus || 'unpaid' }).select('*, workers(name)').single()
    if (error) throw error
    return { id: data.id, batchId: data.batch_id, workerId: data.worker_id, workerName: data.workers?.name || 'Unknown', kgSorted: data.kg_sorted, wasteKg: data.waste_kg || 0, wageAmount: data.wage_amount || 0, date: data.date, notes: data.notes || '', accountNumber: data.account_number || '', paymentTiming: data.payment_timing || 'pending', paymentStatus: data.payment_status || 'unpaid', createdAt: data.created_at }
  }
  const worker = _workers.find(w => w.id === entry.workerId)
  const newS = { id: nextId('s'), batch_id: entry.batchId, worker_id: entry.workerId, kg_sorted: entry.kgSorted, waste_kg: entry.wasteKg || 0, wage_amount: entry.wageAmount || 0, date: entry.date, notes: entry.notes || '', account_number: entry.accountNumber || '', payment_timing: entry.paymentTiming || 'pending', payment_status: entry.paymentStatus || 'unpaid', created_at: new Date().toISOString() }
  _sortingEntries.push(newS)
  if (worker) { worker.total_kg_sorted = (worker.total_kg_sorted || 0) + entry.kgSorted }
  return { id: newS.id, batchId: newS.batch_id, workerId: newS.worker_id, workerName: worker?.name || 'Unknown', kgSorted: newS.kg_sorted, wasteKg: newS.waste_kg, wageAmount: newS.wage_amount, date: newS.date, notes: newS.notes || '', accountNumber: newS.account_number || '', paymentTiming: newS.payment_timing || 'pending', paymentStatus: newS.payment_status || 'unpaid', createdAt: newS.created_at }
}

// ============================================================================
// WAGE ENTRIES
// ============================================================================

export async function getWageEntries() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('wage_entries').select('*, workers(name)').order('date', { ascending: false })
    return (data || []).map(w => ({ id: w.id, workerId: w.worker_id, workerName: w.workers?.name || 'Unknown', amount: w.amount, date: w.date, notes: w.notes, createdAt: w.created_at }))
  }
  return _wageEntries.map(w => {
    const worker = _workers.find(wr => wr.id === w.worker_id)
    return { id: w.id, workerId: w.worker_id, workerName: worker?.name || 'Unknown', amount: w.amount, date: w.date, notes: w.notes, createdAt: w.created_at }
  })
}

export async function createWageEntry(entry) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('wage_entries').insert({ worker_id: entry.workerId, amount: entry.amount, date: entry.date, notes: entry.notes }).select('*, workers(name)').single()
    if (error) throw error
    return { id: data.id, workerId: data.worker_id, workerName: data.workers?.name || 'Unknown', amount: data.amount, date: data.date, notes: data.notes, createdAt: data.created_at }
  }
  const worker = _workers.find(w => w.id === entry.workerId)
  const newW = { id: nextId('we'), worker_id: entry.workerId, amount: entry.amount, date: entry.date, notes: entry.notes || '', created_by: entry.createdBy || '1', created_at: new Date().toISOString() }
  _wageEntries.push(newW)
  if (worker) { worker.total_wages_earned = (worker.total_wages_earned || 0) + entry.amount }
  return { id: newW.id, workerId: newW.worker_id, workerName: worker?.name || 'Unknown', amount: newW.amount, date: newW.date, notes: newW.notes, createdAt: newW.created_at }
}

// ============================================================================
// EXPENSES
// ============================================================================

export async function getExpenses() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false })
    return (data || []).map(e => ({ id: e.id, category: e.category, amount: e.amount, description: e.description, date: e.date, expenseDate: e.date, batchId: e.batch_id, batchNumber: e.batch_id || 'N/A', createdBy: e.created_by, createdAt: e.created_at, accountName: e.account_name || '', paymentMethod: e.payment_method || '', paymentStatus: e.payment_status || 'pending', amountPaid: e.amount_paid || 0, isPaid: (e.payment_status === 'paid'), allocatedTo: e.allocated_to || '' }))
  }
  return _expenses.map(e => {
    const batch = _batches.find(b => b.id === e.batch_id)
    return { id: e.id, category: e.category, amount: e.amount, description: e.description, date: e.date, expenseDate: e.date, batchId: e.batch_id, batchNumber: batch?.batch_number || 'N/A', createdBy: e.created_by, createdAt: e.created_at, accountName: e.account_name || '', paymentMethod: e.payment_method || '', paymentStatus: e.payment_status || 'pending', amountPaid: e.amount_paid || 0, isPaid: (e.payment_status === 'paid'), allocatedTo: e.allocated_to || '' }
  })
}

export async function createExpense(expense) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('expenses').insert({ category: expense.category, amount: expense.amount, description: expense.description, date: expense.date, batch_id: expense.batchId, created_by: expense.createdBy }).select().single()
    if (error) throw error
    return { id: data.id, category: data.category, amount: data.amount, description: data.description, date: data.date, expenseDate: data.date, batchId: data.batch_id, batchNumber: data.batch_id || 'N/A', createdBy: data.created_by, createdAt: data.created_at, accountName: data.account_name || '', paymentMethod: data.payment_method || '', paymentStatus: data.payment_status || 'pending', amountPaid: data.amount_paid || 0, isPaid: (data.payment_status === 'paid'), allocatedTo: data.allocated_to || '' }
  }
  const batch = _batches.find(b => b.id === expense.batchId)
  const newE = { id: nextId('ex'), category: expense.category, amount: expense.amount, description: expense.description, date: expense.date, batch_id: expense.batchId, created_by: expense.createdBy, created_at: new Date().toISOString() }
  _expenses.push(newE)
  return { id: newE.id, category: newE.category, amount: newE.amount, description: newE.description, date: newE.date, expenseDate: newE.date, batchId: newE.batch_id, batchNumber: batch?.batch_number || 'N/A', createdBy: newE.created_by, createdAt: newE.created_at, accountName: '', paymentMethod: '', paymentStatus: 'pending', amountPaid: 0, isPaid: false, allocatedTo: '' }
}

// ============================================================================
// DISPATCHES
// ============================================================================

export async function getDispatches() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('dispatches').select('*, buyers(name), batches(batch_number)').order('dispatch_date', { ascending: false })
    return (data || []).map(d => ({ id: d.id, dispatchNumber: d.dispatch_number, batchId: d.batch_id, batchIds: [d.batch_id], batches: [d.batches?.batch_number || 'Unknown'], batchNumber: d.batches?.batch_number || 'Unknown', buyerId: d.buyer_id, buyerName: d.buyers?.name || 'Unknown', totalWeight: d.quantity_kg, quantityKg: d.quantity_kg, pricePerKg: d.price_per_kg, totalValue: d.total_amount, totalAmount: d.total_amount, handlingCost: d.handling_cost || 0, deliveryCost: d.delivery_cost || 0, profit: d.profit || 0, profitMargin: d.profit_margin || 0, costPerKg: d.cost_per_kg || 0, dispatchDate: d.dispatch_date, status: d.delivery_status, deliveryStatus: d.delivery_status, paymentStatus: d.payment_status, paymentDate: d.payment_date, notes: d.notes, createdAt: d.created_at, createdBy: d.created_by || '' }))
  }
  return _dispatches.map(d => {
    const batch = _batches.find(b => b.id === d.batch_id)
    const buyer = _buyers.find(b => b.id === d.buyer_id)
    const profit = (d.total_amount || 0) - ((batch?.cost_per_kg || 0) * d.quantity_kg)
    return { id: d.id, dispatchNumber: d.dispatch_number, batchId: d.batch_id, batchIds: [d.batch_id], batches: [batch?.batch_number || 'Unknown'], batchNumber: batch?.batch_number || 'Unknown', buyerId: d.buyer_id, buyerName: buyer?.name || 'Unknown', totalWeight: d.quantity_kg, quantityKg: d.quantity_kg, pricePerKg: d.price_per_kg, totalValue: d.total_amount, totalAmount: d.total_amount, handlingCost: d.handling_cost || 0, deliveryCost: d.delivery_cost || 0, profit, profitMargin: d.total_amount > 0 ? (profit / d.total_amount) * 100 : 0, costPerKg: batch?.cost_per_kg || 0, dispatchDate: d.dispatch_date, status: d.delivery_status, deliveryStatus: d.delivery_status, paymentStatus: d.payment_status, paymentDate: d.payment_date, notes: d.notes, createdAt: d.created_at, createdBy: d.created_by || '' }
  })
}

export async function createDispatch(dispatch) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('dispatches').insert({ dispatch_number: dispatch.dispatchNumber, batch_id: dispatch.batchId, buyer_id: dispatch.buyerId, quantity_kg: dispatch.quantityKg, price_per_kg: dispatch.pricePerKg, total_amount: dispatch.totalAmount, dispatch_date: dispatch.dispatchDate, delivery_status: dispatch.deliveryStatus || 'dispatched', payment_status: dispatch.paymentStatus || 'pending', notes: dispatch.notes }).select('*, buyers(name), batches(batch_number)').single()
    if (error) throw error
    return { id: data.id, dispatchNumber: data.dispatch_number, batchId: data.batch_id, batchIds: [data.batch_id], batches: [data.batches?.batch_number || 'Unknown'], batchNumber: data.batches?.batch_number || 'Unknown', buyerId: data.buyer_id, buyerName: data.buyers?.name || 'Unknown', totalWeight: data.quantity_kg, quantityKg: data.quantity_kg, pricePerKg: data.price_per_kg, totalValue: data.total_amount, totalAmount: data.total_amount, handlingCost: data.handling_cost || 0, deliveryCost: data.delivery_cost || 0, profit: data.profit || 0, profitMargin: data.profit_margin || 0, costPerKg: data.cost_per_kg || 0, dispatchDate: data.dispatch_date, status: data.delivery_status, deliveryStatus: data.delivery_status, paymentStatus: data.payment_status, paymentDate: data.payment_date, notes: data.notes, createdAt: data.created_at, createdBy: data.created_by || '' }
  }
  const batch = _batches.find(b => b.id === dispatch.batchId)
  const buyer = _buyers.find(b => b.id === dispatch.buyerId)
  const profit = (dispatch.totalAmount || 0) - ((batch?.cost_per_kg || 0) * (dispatch.quantityKg || 0))
  const newD = { id: nextId('d'), dispatch_number: dispatch.dispatchNumber, batch_id: dispatch.batchId, buyer_id: dispatch.buyerId, quantity_kg: dispatch.quantityKg, price_per_kg: dispatch.pricePerKg, total_amount: dispatch.totalAmount, dispatch_date: dispatch.dispatchDate, delivery_status: dispatch.deliveryStatus || 'dispatched', payment_status: dispatch.paymentStatus || 'pending', payment_date: null, notes: dispatch.notes || '', created_by: dispatch.createdBy || '', created_at: new Date().toISOString() }
  _dispatches.push(newD)
  return { id: newD.id, dispatchNumber: newD.dispatch_number, batchId: newD.batch_id, batchIds: [newD.batch_id], batches: [batch?.batch_number || 'Unknown'], batchNumber: batch?.batch_number || 'Unknown', buyerId: newD.buyer_id, buyerName: buyer?.name || 'Unknown', totalWeight: newD.quantity_kg, quantityKg: newD.quantity_kg, pricePerKg: newD.price_per_kg, totalValue: newD.total_amount, totalAmount: newD.total_amount, handlingCost: 0, deliveryCost: 0, profit, profitMargin: newD.total_amount > 0 ? (profit / newD.total_amount) * 100 : 0, costPerKg: batch?.cost_per_kg || 0, dispatchDate: newD.dispatch_date, status: newD.delivery_status, deliveryStatus: newD.delivery_status, paymentStatus: newD.payment_status, paymentDate: newD.payment_date, notes: newD.notes, createdAt: newD.created_at, createdBy: newD.created_by }
}

export async function updateDispatch(id, updates) {
  if (isSupabaseConfigured) {
    const updateData = {}
    if (updates.deliveryStatus) updateData.delivery_status = updates.deliveryStatus
    if (updates.paymentStatus) updateData.payment_status = updates.paymentStatus
    if (updates.paymentDate) updateData.payment_date = updates.paymentDate
    const { data, error } = await supabase.from('dispatches').update(updateData).eq('id', id).select('*, buyers(name), batches(batch_number)').single()
    if (error) return undefined
    return { id: data.id, dispatchNumber: data.dispatch_number, batchId: data.batch_id, batchIds: [data.batch_id], batches: [data.batches?.batch_number || 'Unknown'], batchNumber: data.batches?.batch_number || 'Unknown', buyerId: data.buyer_id, buyerName: data.buyers?.name || 'Unknown', totalWeight: data.quantity_kg, quantityKg: data.quantity_kg, pricePerKg: data.price_per_kg, totalValue: data.total_amount, totalAmount: data.total_amount, handlingCost: data.handling_cost || 0, deliveryCost: data.delivery_cost || 0, profit: data.profit || 0, profitMargin: data.profit_margin || 0, costPerKg: data.cost_per_kg || 0, dispatchDate: data.dispatch_date, status: data.delivery_status, deliveryStatus: data.delivery_status, paymentStatus: data.payment_status, paymentDate: data.payment_date, notes: data.notes, createdAt: data.created_at, createdBy: data.created_by || '' }
  }
  const idx = _dispatches.findIndex(d => d.id === id)
  if (idx < 0) return undefined
  if (updates.deliveryStatus) _dispatches[idx].delivery_status = updates.deliveryStatus
  if (updates.paymentStatus) _dispatches[idx].payment_status = updates.paymentStatus
  if (updates.paymentDate) _dispatches[idx].payment_date = updates.paymentDate
  const d = _dispatches[idx]
  const batch = _batches.find(b => b.id === d.batch_id)
  const buyer = _buyers.find(b => b.id === d.buyer_id)
  const profit = (d.total_amount || 0) - ((batch?.cost_per_kg || 0) * (d.quantity_kg || 0))
  return { id: d.id, dispatchNumber: d.dispatch_number, batchId: d.batch_id, batchIds: [d.batch_id], batches: [batch?.batch_number || 'Unknown'], batchNumber: batch?.batch_number || 'Unknown', buyerId: d.buyer_id, buyerName: buyer?.name || 'Unknown', totalWeight: d.quantity_kg, quantityKg: d.quantity_kg, pricePerKg: d.price_per_kg, totalValue: d.total_amount, totalAmount: d.total_amount, handlingCost: d.handling_cost || 0, deliveryCost: d.delivery_cost || 0, profit, profitMargin: d.total_amount > 0 ? (profit / d.total_amount) * 100 : 0, costPerKg: batch?.cost_per_kg || 0, dispatchDate: d.dispatch_date, status: d.delivery_status, deliveryStatus: d.delivery_status, paymentStatus: d.payment_status, paymentDate: d.payment_date, notes: d.notes, createdAt: d.created_at, createdBy: d.created_by || '' }
}


// ============================================================================
// TICKETS
// ============================================================================

export async function getTickets() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false })
    return (data || []).map(t => ({ id: t.id, ticketNumber: t.ticket_number, title: t.title, description: t.description, category: t.category, priority: t.priority, status: t.status, batchId: t.batch_id, linkedBatchId: t.batch_id, linkedBatchNumber: t.batch_id, createdBy: t.created_by, createdByUser: t.created_by ? { name: 'Unknown' } : undefined, assignedTo: t.assigned_to, assignedToUser: t.assigned_to ? { name: 'Unknown' } : undefined, createdAt: t.created_at, updatedAt: t.updated_at, resolvedAt: t.resolved_at, comments: [] }))
  }
  return _tickets.map(t => {
    const batch = _batches.find(b => b.id === t.batch_id)
    const assigned = _users.find(u => u.id === t.assigned_to)
    const creator = _users.find(u => u.id === t.created_by)
    return { id: t.id, ticketNumber: t.ticket_number, title: t.title, description: t.description, category: t.category, priority: t.priority, status: t.status, batchId: t.batch_id, linkedBatchId: t.batch_id, linkedBatchNumber: batch?.batch_number || t.batch_id, createdBy: t.created_by, createdByUser: creator ? { name: creator.name } : undefined, assignedTo: t.assigned_to, assignedToUser: assigned ? { name: assigned.name } : undefined, createdAt: t.created_at, updatedAt: t.updated_at, resolvedAt: t.resolved_at, comments: [] }
  })
}

export async function createTicket(ticket) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('tickets').insert({ ticket_number: ticket.ticketNumber, title: ticket.title, description: ticket.description, category: ticket.category, priority: ticket.priority, status: ticket.status, batch_id: ticket.batchId, created_by: ticket.createdBy, assigned_to: ticket.assignedTo }).select().single()
    if (error) throw error
    return { id: data.id, ticketNumber: data.ticket_number, title: data.title, description: data.description, category: data.category, priority: data.priority, status: data.status, batchId: data.batch_id, linkedBatchId: data.batch_id, linkedBatchNumber: data.batch_id, createdBy: data.created_by, createdByUser: data.created_by ? { name: 'Unknown' } : undefined, assignedTo: data.assigned_to, assignedToUser: data.assigned_to ? { name: 'Unknown' } : undefined, createdAt: data.created_at, updatedAt: data.updated_at, resolvedAt: data.resolved_at, comments: [] }
  }
  const newT = { id: nextId('tk'), ticket_number: ticket.ticketNumber, title: ticket.title, description: ticket.description, category: ticket.category, priority: ticket.priority, status: ticket.status || 'open', batch_id: ticket.batchId, created_by: ticket.createdBy, assigned_to: ticket.assignedTo, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), resolved_at: null }
  _tickets.push(newT)
  const batch = _batches.find(b => b.id === ticket.batchId)
  const assigned = _users.find(u => u.id === ticket.assignedTo)
  const creator = _users.find(u => u.id === ticket.createdBy)
  return { id: newT.id, ticketNumber: newT.ticket_number, title: newT.title, description: newT.description, category: newT.category, priority: newT.priority, status: newT.status, batchId: newT.batch_id, linkedBatchId: newT.batch_id, linkedBatchNumber: batch?.batch_number || newT.batch_id, createdBy: newT.created_by, createdByUser: creator ? { name: creator.name } : undefined, assignedTo: newT.assigned_to, assignedToUser: assigned ? { name: assigned.name } : undefined, createdAt: newT.created_at, updatedAt: newT.updated_at, resolvedAt: newT.resolved_at, comments: [] }
}

export async function getTicketById(id) {
  const all = await getTickets()
  return all.find(t => t.id === id)
}

export async function updateTicketStatus(id, status, resolution) {
  return updateTicket(id, { status, resolution })
}

export async function addTicketComment(ticketId: string, comment: { text: string; userId: string; timestamp: string }) {
  const user = _users.find(u => u.id === comment.userId)
  return createTicketComment({ ticketId, userId: comment.userId, userName: user?.name || 'Unknown', comment: comment.text })
}

export async function updateTicket(id, updates) {
  if (isSupabaseConfigured) {
    const updateData = {}
    if (updates.status) updateData.status = updates.status
    if (updates.assignedTo) updateData.assigned_to = updates.assignedTo
    if (updates.status === 'resolved') updateData.resolved_at = new Date().toISOString()
    const { data, error } = await supabase.from('tickets').update(updateData).eq('id', id).select().single()
    if (error) return undefined
    return { id: data.id, ticketNumber: data.ticket_number, title: data.title, description: data.description, category: data.category, priority: data.priority, status: data.status, batchId: data.batch_id, linkedBatchId: data.batch_id, linkedBatchNumber: data.batch_id, createdBy: data.created_by, createdByUser: data.created_by ? { name: 'Unknown' } : undefined, assignedTo: data.assigned_to, assignedToUser: data.assigned_to ? { name: 'Unknown' } : undefined, createdAt: data.created_at, updatedAt: data.updated_at, resolvedAt: data.resolved_at, comments: [] }
  }
  const idx = _tickets.findIndex(t => t.id === id)
  if (idx < 0) return undefined
  if (updates.status) _tickets[idx].status = updates.status
  if (updates.assignedTo) _tickets[idx].assigned_to = updates.assignedTo
  if (updates.status === 'resolved') _tickets[idx].resolved_at = new Date().toISOString()
  _tickets[idx].updated_at = new Date().toISOString()
  const t = _tickets[idx]
  const batch = _batches.find(b => b.id === t.batch_id)
  return { id: t.id, ticketNumber: t.ticket_number, title: t.title, description: t.description, category: t.category, priority: t.priority, status: t.status, batchId: t.batch_id, linkedBatchId: t.batch_id, linkedBatchNumber: batch?.batch_number || t.batch_id, createdBy: t.created_by, assignedTo: t.assigned_to, createdAt: t.created_at, updatedAt: t.updated_at, resolvedAt: t.resolved_at, comments: [] }
}

export async function deleteTicket(id) {
  if (isSupabaseConfigured) { await supabase.from('tickets').delete().eq('id', id); return }
  const idx = _tickets.findIndex(t => t.id === id)
  if (idx >= 0) _tickets.splice(idx, 1)
}

export async function getTicketComments(ticketId) {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('ticket_comments').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true })
    return (data || []).map(c => ({ id: c.id, ticketId: c.ticket_id, userId: c.user_id, userName: c.user_name, comment: c.comment, createdAt: c.created_at }))
  }
  return _ticketComments.filter(c => c.ticket_id === ticketId).map(c => ({ id: c.id, ticketId: c.ticket_id, userId: c.user_id, userName: c.user_name, comment: c.comment, createdAt: c.created_at }))
}

export async function createTicketComment(comment) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('ticket_comments').insert({ ticket_id: comment.ticketId, user_id: comment.userId, user_name: comment.userName, comment: comment.comment }).select().single()
    if (error) throw error
    return { id: data.id, ticketId: data.ticket_id, userId: data.user_id, userName: data.user_name, comment: data.comment, createdAt: data.created_at }
  }
  const newC = { id: nextId('tc'), ticket_id: comment.ticketId, user_id: comment.userId, user_name: comment.userName, comment: comment.comment, created_at: new Date().toISOString() }
  _ticketComments.push(newC)
  return { id: newC.id, ticketId: newC.ticket_id, userId: newC.user_id, userName: newC.user_name, comment: newC.comment, createdAt: newC.created_at }
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

export async function getAuditLogs() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false })
    return (data || []).map(l => ({ id: l.id, userId: l.user_id, userName: l.users?.name || 'System', performedBy: l.users?.name || 'System', performedByUser: { name: l.users?.name || 'System' }, action: l.action, entityType: l.entity_type, entityId: l.entity_id, oldValues: l.old_values, newValues: l.new_values, details: l.details || { oldValue: l.old_values, newValue: l.new_values, reason: l.reason }, fieldName: l.field_name || '', oldValue: l.old_values, newValue: l.new_values, reason: l.reason || '', ipAddress: l.ip_address, createdAt: l.created_at }))
  }
  return _auditLogs.map(l => {
    const user = _users.find(u => u.id === l.user_id)
    const name = user?.name || 'System'
    return { id: l.id, userId: l.user_id, userName: name, performedBy: name, performedByUser: { name }, action: l.action, entityType: l.entity_type, entityId: l.entity_id, oldValues: l.old_values, newValues: l.new_values, details: { oldValue: l.old_values, newValue: l.new_values, reason: l.reason }, fieldName: l.field_name || '', oldValue: l.old_values, newValue: l.new_values, reason: l.reason || '', ipAddress: l.ip_address, createdAt: l.created_at }
  })
}

export async function createAuditLog(log) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('audit_logs').insert({ user_id: log.userId, action: log.action, entity_type: log.entityType, entity_id: log.entityId, old_values: log.oldValues, new_values: log.newValues, ip_address: log.ipAddress }).select().single()
    if (error) throw error
    const name = 'System'
    return { id: data.id, userId: data.user_id, userName: name, performedBy: name, performedByUser: { name }, action: data.action, entityType: data.entity_type, entityId: data.entity_id, oldValues: data.old_values, newValues: data.new_values, details: { oldValue: data.old_values, newValue: data.new_values, reason: data.reason }, fieldName: data.field_name || '', oldValue: data.old_values, newValue: data.new_values, reason: data.reason || '', ipAddress: data.ip_address, createdAt: data.created_at }
  }
  const user = _users.find(u => u.id === log.userId)
  const name = user?.name || 'System'
  const newL = { id: nextId('al'), user_id: log.userId, action: log.action, entity_type: log.entityType, entity_id: log.entityId, old_values: log.oldValues, newValues: log.newValues, ip_address: log.ipAddress, field_name: log.fieldName || '', reason: log.reason || '', created_at: new Date().toISOString() }
  _auditLogs.push(newL)
  return { id: newL.id, userId: newL.user_id, userName: name, performedBy: name, performedByUser: { name }, action: newL.action, entityType: newL.entity_type, entityId: newL.entity_id, oldValues: newL.old_values, newValues: newL.new_values, details: { oldValue: newL.old_values, newValue: newL.new_values, reason: newL.reason }, fieldName: newL.field_name, oldValue: newL.old_values, newValue: newL.new_values, reason: newL.reason, ipAddress: newL.ip_address, createdAt: newL.created_at }
}


// ============================================================================
// GRN (GOODS RECEIPT NOTES)
// ============================================================================

export async function getGRNs() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('grns').select('*, vendors(name), lots(lot_number)').order('created_at', { ascending: false })
    return (data || []).map(g => ({ id: g.id, grnNumber: g.grn_number, lotId: g.lot_id, lotNumber: g.lots?.lot_number || 'Unknown', batchNumber: g.batch_number || 'N/A', vendorId: g.vendor_id, vendorName: g.vendors?.name || 'Unknown', receiptDate: g.receipt_date, totalKg: g.total_kg, pricePerKg: g.price_per_kg, totalAmount: g.total_amount, amountPaid: g.amount_paid || 0, paymentStatus: g.payment_status || 'pending', paymentDate: g.payment_date, paymentMethod: g.payment_method || '', vehicleNumber: g.vehicle_number || '', driverName: g.driver_name || '', driverPhone: g.driver_phone || '', grossWeight: g.gross_weight, tareWeight: g.tare_weight, netWeight: g.net_weight, sampleWetWeight: g.sample_wet_weight || 0, sampleDryWeight: g.sample_dry_weight || 0, moistureContent: g.moisture_content || 0, foreignParticles: g.foreign_particles || 0, notes: g.notes || '', createdBy: g.created_by, createdAt: g.created_at }))
  }
  return _grns.map(g => {
    const vendor = _vendors.find(v => v.id === g.vendor_id)
    const lot = _lots.find(l => l.id === g.lot_id)
    return { id: g.id, grnNumber: g.grn_number, lotId: g.lot_id, lotNumber: lot?.lot_number || 'Unknown', batchNumber: g.batch_number || 'N/A', vendorId: g.vendor_id, vendorName: vendor?.name || 'Unknown', receiptDate: g.receipt_date, totalKg: g.total_kg, pricePerKg: g.price_per_kg, totalAmount: g.total_amount, amountPaid: g.amount_paid || 0, paymentStatus: g.payment_status || 'pending', paymentDate: g.payment_date, paymentMethod: g.payment_method || '', vehicleNumber: g.vehicle_number || '', driverName: g.driver_name || '', driverPhone: g.driver_phone || '', grossWeight: g.gross_weight, tareWeight: g.tare_weight, netWeight: g.net_weight, sampleWetWeight: g.sample_wet_weight || 0, sampleDryWeight: g.sample_dry_weight || 0, moistureContent: g.moisture_content || 0, foreignParticles: g.foreign_particles || 0, notes: g.notes || '', createdBy: g.created_by, createdAt: g.created_at }
  })
}

export async function createGRN(grn) {
  // Auto-calculate moisture content from sample weights if provided
  let moistureContent = grn.moistureContent || 0
  if (grn.sampleWetWeight && grn.sampleDryWeight && grn.sampleWetWeight > 0) {
    moistureContent = ((grn.sampleWetWeight - grn.sampleDryWeight) / grn.sampleWetWeight) * 100
    moistureContent = Math.round(moistureContent * 100) / 100 // round to 2 decimals
  }
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('grns').insert({ grn_number: grn.grnNumber, lot_id: grn.lotId, batch_number: grn.batchNumber, vendor_id: grn.vendorId, receipt_date: grn.receiptDate, total_kg: grn.totalKg, price_per_kg: grn.pricePerKg, total_amount: grn.totalAmount, amount_paid: grn.amountPaid, payment_status: grn.paymentStatus, payment_date: grn.paymentDate, payment_method: grn.paymentMethod, vehicle_number: grn.vehicleNumber, driver_name: grn.driverName, driver_phone: grn.driverPhone, gross_weight: grn.grossWeight, tare_weight: grn.tareWeight, net_weight: grn.netWeight, sample_wet_weight: grn.sampleWetWeight, sample_dry_weight: grn.sampleDryWeight, moisture_content: moistureContent, foreign_particles: grn.foreignParticles, notes: grn.notes, created_by: grn.createdBy }).select('*, vendors(name), lots(lot_number)').single()
    if (error) throw error
    return { id: data.id, grnNumber: data.grn_number, lotId: data.lot_id, lotNumber: data.lots?.lot_number || 'Unknown', batchNumber: data.batch_number || 'N/A', vendorId: data.vendor_id, vendorName: data.vendors?.name || 'Unknown', receiptDate: data.receipt_date, totalKg: data.total_kg, pricePerKg: data.price_per_kg, totalAmount: data.total_amount, amountPaid: data.amount_paid || 0, paymentStatus: data.payment_status || 'pending', paymentDate: data.payment_date, paymentMethod: data.payment_method || '', vehicleNumber: data.vehicle_number || '', driverName: data.driver_name || '', driverPhone: data.driver_phone || '', grossWeight: data.gross_weight, tareWeight: data.tare_weight, netWeight: data.net_weight, sampleWetWeight: data.sample_wet_weight || 0, sampleDryWeight: data.sample_dry_weight || 0, moistureContent: data.moisture_content || 0, foreignParticles: data.foreign_particles || 0, notes: data.notes || '', createdBy: data.created_by, createdAt: data.created_at }
  }
  const vendor = _vendors.find(v => v.id === grn.vendorId)
  const lot = _lots.find(l => l.id === grn.lotId)
  const newG = { id: nextId('grn-'), grn_number: grn.grnNumber, lot_id: grn.lotId, batch_number: grn.batchNumber || 'N/A', vendor_id: grn.vendorId, receipt_date: grn.receiptDate, total_kg: grn.totalKg, price_per_kg: grn.pricePerKg, total_amount: grn.totalAmount, amount_paid: grn.amountPaid || 0, payment_status: grn.paymentStatus || 'pending', payment_date: grn.paymentDate || null, payment_method: grn.paymentMethod || '', vehicle_number: grn.vehicleNumber || '', driver_name: grn.driverName || '', driver_phone: grn.driverPhone || '', gross_weight: grn.grossWeight, tare_weight: grn.tareWeight, net_weight: grn.netWeight, sample_wet_weight: grn.sampleWetWeight || 0, sample_dry_weight: grn.sampleDryWeight || 0, moisture_content: moistureContent, foreign_particles: grn.foreignParticles || 0, notes: grn.notes || '', created_by: grn.createdBy, created_at: new Date().toISOString() }
  _grns.push(newG)
  return { id: newG.id, grnNumber: newG.grn_number, lotId: newG.lot_id, lotNumber: lot?.lot_number || 'Unknown', batchNumber: newG.batch_number, vendorId: newG.vendor_id, vendorName: vendor?.name || 'Unknown', receiptDate: newG.receipt_date, totalKg: newG.total_kg, pricePerKg: newG.price_per_kg, totalAmount: newG.total_amount, amountPaid: newG.amount_paid, paymentStatus: newG.payment_status, paymentDate: newG.payment_date, paymentMethod: newG.payment_method, vehicleNumber: newG.vehicle_number, driverName: newG.driver_name, driverPhone: newG.driver_phone, grossWeight: newG.gross_weight, tareWeight: newG.tare_weight, netWeight: newG.net_weight, sampleWetWeight: newG.sample_wet_weight, sampleDryWeight: newG.sample_dry_weight, moistureContent: newG.moisture_content, foreignParticles: newG.foreign_particles, notes: newG.notes, createdBy: newG.created_by, createdAt: newG.created_at }
}

export async function updateGRN(id, updates) {
  if (isSupabaseConfigured) {
    const updateData = {}
    if (updates.amountPaid !== undefined) updateData.amount_paid = updates.amountPaid
    if (updates.paymentStatus) updateData.payment_status = updates.paymentStatus
    if (updates.paymentDate) updateData.payment_date = updates.paymentDate
    if (updates.paymentMethod) updateData.payment_method = updates.paymentMethod
    if (updates.sampleWetWeight !== undefined) updateData.sample_wet_weight = updates.sampleWetWeight
    if (updates.sampleDryWeight !== undefined) updateData.sample_dry_weight = updates.sampleDryWeight
    if (updates.sampleWetWeight !== undefined && updates.sampleDryWeight !== undefined && updates.sampleWetWeight > 0) {
      updateData.moisture_content = ((updates.sampleWetWeight - updates.sampleDryWeight) / updates.sampleWetWeight) * 100
    }
    const { data, error } = await supabase.from('grns').update(updateData).eq('id', id).select('*, vendors(name), lots(lot_number)').single()
    if (error) return undefined
    return { id: data.id, grnNumber: data.grn_number, lotId: data.lot_id, lotNumber: data.lots?.lot_number || 'Unknown', batchNumber: data.batch_number || 'N/A', vendorId: data.vendor_id, vendorName: data.vendors?.name || 'Unknown', receiptDate: data.receipt_date, totalKg: data.total_kg, pricePerKg: data.price_per_kg, totalAmount: data.total_amount, amountPaid: data.amount_paid || 0, paymentStatus: data.payment_status || 'pending', paymentDate: data.payment_date, paymentMethod: data.payment_method || '', vehicleNumber: data.vehicle_number || '', driverName: data.driver_name || '', driverPhone: data.driver_phone || '', grossWeight: data.gross_weight, tareWeight: data.tare_weight, netWeight: data.net_weight, sampleWetWeight: data.sample_wet_weight || 0, sampleDryWeight: data.sample_dry_weight || 0, moistureContent: data.moisture_content || 0, foreignParticles: data.foreign_particles || 0, notes: data.notes || '', createdBy: data.created_by, createdAt: data.created_at }
  }
  const idx = _grns.findIndex(g => g.id === id)
  if (idx < 0) return undefined
  if (updates.amountPaid !== undefined) _grns[idx].amount_paid = updates.amountPaid
  if (updates.paymentStatus) _grns[idx].payment_status = updates.paymentStatus
  if (updates.paymentDate) _grns[idx].payment_date = updates.paymentDate
  if (updates.paymentMethod) _grns[idx].payment_method = updates.paymentMethod
  if (updates.sampleWetWeight !== undefined) _grns[idx].sample_wet_weight = updates.sampleWetWeight
  if (updates.sampleDryWeight !== undefined) _grns[idx].sample_dry_weight = updates.sampleDryWeight
  if (updates.sampleWetWeight !== undefined && updates.sampleDryWeight !== undefined && updates.sampleWetWeight > 0) {
    _grns[idx].moisture_content = ((updates.sampleWetWeight - updates.sampleDryWeight) / updates.sampleWetWeight) * 100
  }
  const g = _grns[idx]
  const vendor = _vendors.find(v => v.id === g.vendor_id)
  const lot = _lots.find(l => l.id === g.lot_id)
  return { id: g.id, grnNumber: g.grn_number, lotId: g.lot_id, lotNumber: lot?.lot_number || 'Unknown', batchNumber: g.batch_number, vendorId: g.vendor_id, vendorName: vendor?.name || 'Unknown', receiptDate: g.receipt_date, totalKg: g.total_kg, pricePerKg: g.price_per_kg, totalAmount: g.total_amount, amountPaid: g.amount_paid, paymentStatus: g.payment_status, paymentDate: g.payment_date, paymentMethod: g.payment_method, vehicleNumber: g.vehicle_number, driverName: g.driver_name, driverPhone: g.driver_phone, grossWeight: g.gross_weight, tareWeight: g.tare_weight, netWeight: g.net_weight, sampleWetWeight: g.sample_wet_weight || 0, sampleDryWeight: g.sample_dry_weight || 0, moistureContent: g.moisture_content || 0, foreignParticles: g.foreign_particles, notes: g.notes, createdBy: g.created_by, createdAt: g.created_at }
}

export async function deleteGRN(id) {
  if (isSupabaseConfigured) { await supabase.from('grns').delete().eq('id', id); return }
  const idx = _grns.findIndex(g => g.id === id)
  if (idx >= 0) _grns.splice(idx, 1)
}

// ============================================================================
// DASHBOARD DATA
// ============================================================================

export async function getDashboardStats() {
  if (isSupabaseConfigured) {
    const { count: total } = await supabase.from('batches').select('*', { count: 'exact', head: true })
    const { count: active } = await supabase.from('batches').select('*', { count: 'exact', head: true }).eq('status', 'active')
    const { count: completed } = await supabase.from('batches').select('*', { count: 'exact', head: true }).eq('status', 'completed')
    const { data: dispatches } = await supabase.from('dispatches').select('quantity_kg')
    const totalDispatched = (dispatches || []).reduce((s, d) => s + (d.quantity_kg || 0), 0)
    return { totalBatches: total || 0, activeBatches: active || 0, completedBatches: completed || 0, totalDispatchedKg: totalDispatched, averageYieldPercent: 76.5 }
  }
  return { totalBatches: _batches.length, activeBatches: _batches.filter(b => b.status === 'active').length, completedBatches: _batches.filter(b => b.status === 'completed').length, totalDispatchedKg: _dispatches.reduce((s, d) => s + d.quantity_kg, 0), averageYieldPercent: 76.5 }
}

export async function getDashboardKPIs() {
  const stats = await getDashboardStats()
  const expenses = await getExpenses()
  const dispatches = await getDispatches()
  const workers = await getWorkers()
  const vendors = await getVendors()
  const buyers = await getBuyers()
  const tickets = await getTickets()
  const batches = await getBatches()
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalRevenue = dispatches.reduce((s, d) => s + d.totalAmount, 0)
  const totalInputKg = batches.reduce((s, b) => s + b.initialWeight, 0)
  const totalOutputKg = batches.reduce((s, b) => s + (b.weights.finalDryFlakes || 0), 0)
  const stockOnHand = batches.filter(b => b.status === 'active').reduce((s, b) => s + b.currentWeight, 0)
  return {
    totalBatches: stats.totalBatches,
    activeBatches: stats.activeBatches,
    totalDispatchedKg: stats.totalDispatchedKg,
    averageYieldPercent: stats.averageYieldPercent,
    totalExpenses,
    totalRevenue,
    netProfit: totalRevenue - totalExpenses,
    totalWorkers: workers.length,
    totalVendors: vendors.length,
    totalBuyers: buyers.length,
    pendingTickets: tickets.filter(t => t.status === 'open').length,
    overdueDispatches: dispatches.filter(d => d.status === 'pending').length,
    totalInputKg,
    totalOutputKg,
    overallYield: totalInputKg > 0 ? (totalOutputKg / totalInputKg) * 100 : 0,
    revenue: totalRevenue,
    totalCosts: totalExpenses,
    grossProfit: totalRevenue - totalExpenses,
    avgCostPerKg: totalOutputKg > 0 ? totalExpenses / totalOutputKg : 0,
    stockOnHand,
    activeWorkers: workers.filter(w => w.isActive).length,
    totalWagesToday: 0,
    avgProductivity: 0,
    alerts: [],
  }
}

export async function getMonthlyDispatchData() {
  return [{ month: 'Jan', total: 15000 }, { month: 'Feb', total: 18500 }, { month: 'Mar', total: 22000 }, { month: 'Apr', total: 19500 }, { month: 'May', total: 25000 }, { month: 'Jun', total: 28000 }, { month: 'Jul', total: 12000 }]
}

export async function getMonthlyExpenseData() {
  return [{ month: 'Jan', materials: 800000, labour: 200000, utilities: 150000 }, { month: 'Feb', materials: 950000, labour: 220000, utilities: 160000 }, { month: 'Mar', materials: 1100000, labour: 250000, utilities: 180000 }, { month: 'Apr', materials: 900000, labour: 210000, utilities: 155000 }, { month: 'May', materials: 1200000, labour: 280000, utilities: 200000 }, { month: 'Jun', materials: 1350000, labour: 300000, utilities: 220000 }, { month: 'Jul', materials: 600000, labour: 150000, utilities: 100000 }]
}

export async function getBatchStatesOverview() {
  return [
    { state: 'Unsorted PET', count: _batches.filter(b => b.current_state === 'unsorted_pet').length },
    { state: 'Sorted PET', count: _batches.filter(b => b.current_state === 'sorted_pet').length },
    { state: 'Ground Flakes', count: _batches.filter(b => b.current_state === 'ground_flakes').length },
    { state: 'Washed Flakes', count: _batches.filter(b => b.current_state === 'washed_flakes').length },
    { state: 'Final Dry Flakes', count: _batches.filter(b => b.current_state === 'final_dry_flakes').length },
    { state: 'Completed', count: _batches.filter(b => b.status === 'completed').length },
  ]
}

// ============================================================================
// REPORTS
// ============================================================================

export async function getBatchPerformanceReport() {
  return _batches.map(b => {
    const lot = _lots.find(l => l.id === b.lot_id)
    const vendor = _vendors.find(v => v.id === lot?.vendor_id)
    return { batchId: b.id, batchNumber: b.batch_number, vendorName: vendor?.name || 'Unknown', materialType: 'PET', inputWeight: b.initial_weight, outputWeight: b.final_dry_flakes_weight || 0, yieldPercent: b.total_yield_percent || 0, materialCost: b.material_cost || 0, labourCost: b.labour_cost || 0, totalCost: (b.material_cost || 0) + (b.labour_cost || 0) + (b.logistics_cost || 0) + (b.handling_cost || 0) + (b.other_cost || 0), costPerKg: b.cost_per_kg || 0, status: b.status, completionDate: b.status === 'completed' ? b.updated_at : undefined }
  })
}

export async function getFinancialSummaryReport() {
  const totalMaterialCost = _expenses.filter(e => e.category === 'materials').reduce((s, e) => s + e.amount, 0)
  const totalLabourCost = _expenses.filter(e => e.category === 'labour').reduce((s, e) => s + e.amount, 0)
  const totalUtilitiesCost = _expenses.filter(e => e.category === 'utilities').reduce((s, e) => s + e.amount, 0)
  const totalFuelCost = _expenses.filter(e => e.category === 'fuel').reduce((s, e) => s + e.amount, 0)
  const totalMaintenanceCost = _expenses.filter(e => e.category === 'maintenance').reduce((s, e) => s + e.amount, 0)
  const totalRevenue = _dispatches.reduce((s, d) => s + d.total_amount, 0)
  const totalExpenses = _expenses.reduce((s, e) => s + e.amount, 0)
  return { totalMaterialCost, totalLabourCost, totalUtilitiesCost, totalFuelCost, totalMaintenanceCost, totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses, totalDispatchedKg: _dispatches.reduce((s, d) => s + d.quantity_kg, 0), totalActiveBatches: _batches.filter(b => b.status === 'active').length, totalCompletedBatches: _batches.filter(b => b.status === 'completed').length }
}

export async function getProductionEfficiencyReport() {
  return _batches.filter(b => b.status === 'completed').map(b => {
    const sortedToGroundLoss = b.ground_flakes_weight ? ((1 - (b.ground_flakes_weight / b.sorted_pet_weight)) * 100).toFixed(1) : 0
    const groundToFinalLoss = b.final_dry_flakes_weight ? ((1 - (b.final_dry_flakes_weight / b.ground_flakes_weight)) * 100).toFixed(1) : 0
    return { batchNumber: b.batch_number, inputWeight: b.initial_weight, sortedWeight: b.sorted_pet_weight, groundWeight: b.ground_flakes_weight, finalWeight: b.final_dry_flakes_weight, totalYield: b.total_yield_percent || 0, sortedToGroundLoss: sortedToGroundLoss + '%', groundToFinalLoss: groundToFinalLoss + '%', rejectionRate: b.rejects_weight ? ((b.rejects_weight / b.initial_weight) * 100).toFixed(1) + '%' : '0%' }
  })
}

export async function getVendorPerformanceReport() {
  return _vendors.filter(v => v.type === 'vendor' && v.is_active).map(v => {
    const vendorLots = _lots.filter(l => l.vendor_id === v.id)
    const totalKg = vendorLots.reduce((s, l) => s + (l.actual_kg || l.expected_kg || 0), 0)
    const totalCost = vendorLots.reduce((s, l) => s + (l.total_cost || 0), 0)
    return { vendorName: v.name, totalLots: vendorLots.length, totalKg, totalCost, avgPricePerKg: totalKg > 0 ? totalCost / totalKg : 0, reliabilityScore: v.reliability_score || 80, avgDeliveryTime: 2.5 }
  })
}

export async function getProductionReport(_startDate?: string, _endDate?: string) {
  return getBatchPerformanceReport()
}

export async function getFinancialReport(_startDate?: string, _endDate?: string) {
  return getFinancialSummaryReport()
}

export async function getAlerts() {
  const alerts = []
  _batches.forEach(b => {
    if (b.status === 'active' && b.current_state === 'unsorted_pet' && new Date(b.created_at) < new Date(Date.now() - 7 * 86400000)) {
      alerts.push({ id: `al-${b.id}`, type: 'missing_checkpoint', severity: 'medium', message: `Batch ${b.batch_number} stuck in ${b.current_state} for over 7 days`, batchId: b.id, batchNumber: b.batch_number, entityType: 'batch', entityId: b.id, resolved: false, createdAt: new Date().toISOString() })
    }
  })
  return alerts
}

// ============================================================================
// OFFLINE QUEUE
// ============================================================================

export function getOfflineQueue() {
  try { return JSON.parse(localStorage.getItem('offline_queue') || '[]') } catch { return [] }
}

export function addToOfflineQueue(entry) {
  const q = getOfflineQueue()
  q.push({ id: Date.now(), action: entry.action, table: entry.table, data: entry.data, timestamp: new Date().toISOString() })
  localStorage.setItem('offline_queue', JSON.stringify(q))
}

export function clearOfflineQueue() { localStorage.removeItem('offline_queue') }

export function getPendingQueueCount() { return getOfflineQueue().length }

export function syncOfflineQueue() {
  const q = getOfflineQueue()
  if (q.length === 0 || !isSupabaseConfigured) return 0
  clearOfflineQueue()
  return q.length
}

// ============================================================================
// BATCH CONTROL HELPERS
// ============================================================================

export function getMaterialBatchSize(materialType) { return { 'PET Green': 5000, 'PET Clear': 5000, HDPE: 3000, PP: 4000, LDPE: 2500 }[materialType] || 5000 }

export function validateTollEntryLocal(toll) {
  const errors = []
  if (toll.grossWeight <= 0) errors.push('Gross weight must be positive')
  if (toll.tareWeight < 0) errors.push('Tare weight cannot be negative')
  if (toll.tareWeight >= toll.grossWeight) errors.push('Tare weight cannot exceed gross weight')
  const netWeight = toll.grossWeight - toll.tareWeight
  if (netWeight <= 0) errors.push('Net weight must be positive')
  return { valid: errors.length === 0, errors, netWeight }
}

export function checkStageReconciliation(batch, stage) {
  const reconciliations = []
  const weightOut = batch.weights[stage] || 0
  const prevStage = stage === 'sortedPet' ? 'unsortedPet' : stage === 'groundFlakes' ? 'sortedPet' : stage === 'washedFlakes' ? 'groundFlakes' : stage === 'finalDryFlakes' ? 'washedFlakes' : 'unsortedPet'
  const weightIn = batch.weights[prevStage] || 0
  if (weightIn > 0 && weightOut > 0) {
    const loss = weightIn - weightOut
    const lossPercent = (loss / weightIn) * 100
    if (lossPercent > 5) reconciliations.push({ stage, type: 'high_loss', message: `Loss of ${lossPercent.toFixed(1)}% from ${prevStage} to ${stage}`, weightIn, weightOut, loss, lossPercent })
  }
  return reconciliations
}

// ============================================================================
// DB EXPORT
// ============================================================================

export const db = {
  login, logout, getCurrentUser, getUsers, createUser, updateUser, deleteUser: () => Promise.resolve(),
  getVendors, createVendor, updateVendor, deleteVendor,
  getBuyers, createBuyer, updateBuyer, deleteBuyer,
  getLots, createLot, updateLot, updateLotPayment, deleteLot,
  getTrips, createTrip, deleteTrip,
  getHandlingEvents, createHandlingEvent, deleteHandlingEvent,
  getBatches, createBatch, updateBatch, deleteBatch,
  getWorkers, createWorker, updateWorker, deleteWorker,
  getSortingEntries, createSortingEntry,
  getWageEntries, createWageEntry,
  getExpenses, createExpense,
  getDispatches, createDispatch, updateDispatch,
  getTickets, createTicket, updateTicket, deleteTicket, getTicketComments, createTicketComment,
  getAuditLogs, createAuditLog,
  getDashboardStats, getDashboardKPIs, getMonthlyDispatchData, getMonthlyExpenseData, getBatchStatesOverview,
  getBatchPerformanceReport, getFinancialSummaryReport, getProductionEfficiencyReport, getVendorPerformanceReport,
  getProductionReport, getFinancialReport, getAlerts,
  getGRNs, createGRN, updateGRN, deleteGRN,
  getHandlingTypes, updateTripStatus,
  getTicketById, updateTicketStatus, addTicketComment,
  getOfflineQueue, addToOfflineQueue, clearOfflineQueue, syncOfflineQueue, getPendingQueueCount,
}
