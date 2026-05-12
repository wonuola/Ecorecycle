// @ts-nocheck
// ============================================================================
// DATABASE SERVICE - Supabase Backend (Live Database)
// ============================================================================

import { supabase, isSupabaseConfigured } from './supabase'

// ============================================================================
// AUTHENTICATION
// ============================================================================

export async function login(credentials: { email: string; password: string }) {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', credentials.email)
    .eq('is_active', true)
    .single()

  if (error || !data) return null

  if (data.password_hash === credentials.password) {
    await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', data.id)
    const user = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      phone: data.phone || undefined,
      isActive: data.is_active,
      createdAt: data.created_at,
      lastLogin: data.last_login
    }
    localStorage.setItem('ecorecycle_user', JSON.stringify(user))
    return user
  }
  return null
}

export async function logout() {
  localStorage.removeItem('ecorecycle_user')
}

export async function getCurrentUser() {
  const userStr = localStorage.getItem('ecorecycle_user')
  return userStr ? JSON.parse(userStr) : null
}

// ============================================================================
// USERS
// ============================================================================

export async function getUsers() {
  if (!isSupabaseConfigured) return []
  const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
  return (data || []).map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, phone: u.phone, isActive: u.is_active, createdAt: u.created_at, lastLogin: u.last_login }))
}

export async function createUser(user: any) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from('users').insert({ email: user.email, password_hash: user.password || 'changeme123', name: user.name, role: user.role, phone: user.phone, is_active: user.isActive }).select().single()
  if (error) throw error
  return { id: data.id, email: data.email, name: data.name, role: data.role, phone: data.phone, isActive: data.is_active, createdAt: data.created_at }
}

export async function updateUser(id: string, updates: any) {
  if (!isSupabaseConfigured) return undefined
  const updateData: any = {}
  if (updates.name) updateData.name = updates.name
  if (updates.email) updateData.email = updates.email
  if (updates.phone) updateData.phone = updates.phone
  if (updates.role) updateData.role = updates.role
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive
  const { data, error } = await supabase.from('users').update(updateData).eq('id', id).select().single()
  if (error) return undefined
  return { id: data.id, email: data.email, name: data.name, role: data.role, phone: data.phone, isActive: data.is_active, createdAt: data.created_at }
}

// ============================================================================
// VENDORS
// ============================================================================

export async function getVendors() {
  if (!isSupabaseConfigured) return []
  const { data } = await supabase.from('vendors').select('*').eq('type', 'vendor').eq('is_active', true).order('name')
  return (data || []).map(v => ({ id: v.id, name: v.name, contactPerson: v.contact_person || '', phone: v.phone || '', email: v.email, location: v.address || 'Nigeria', materialTypes: ['PET'], reliabilityScore: 80, notes: v.notes, isActive: v.is_active, createdAt: v.created_at, totalTransactions: 0, totalKgPurchased: 0 }))
}

export async function createVendor(vendor: any) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from('vendors').insert({ name: vendor.name, type: 'vendor', contact_person: vendor.contactPerson, email: vendor.email, phone: vendor.phone, address: vendor.location, notes: vendor.notes }).select().single()
  if (error) throw error
  return { id: data.id, name: data.name, contactPerson: data.contact_person || '', phone: data.phone || '', email: data.email, location: data.address || 'Nigeria', materialTypes: ['PET'], reliabilityScore: 80, notes: data.notes, isActive: data.is_active, createdAt: data.created_at, totalTransactions: 0, totalKgPurchased: 0 }
}

export async function updateVendor(id: string, updates: any) {
  if (!isSupabaseConfigured) return undefined
  const updateData: any = {}
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

export async function deleteVendor(id: string) {
  if (!isSupabaseConfigured) return
  await supabase.from('vendors').update({ is_active: false }).eq('id', id)
}

// ============================================================================
// BUYERS
// ============================================================================

export async function getBuyers() {
  if (!isSupabaseConfigured) return []
  const { data } = await supabase.from('vendors').select('*').eq('type', 'buyer').eq('is_active', true).order('name')
  return (data || []).map(v => ({ id: v.id, name: v.name, contactPerson: v.contact_person || '', phone: v.phone || '', email: v.email, location: v.address || 'Nigeria', pricingHistory: [], isActive: v.is_active, createdAt: v.created_at, totalTransactions: 0, totalKgSold: 0 }))
}

export async function createBuyer(buyer: any) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from('vendors').insert({ name: buyer.name, type: 'buyer', contact_person: buyer.contactPerson, email: buyer.email, phone: buyer.phone, address: buyer.location }).select().single()
  if (error) throw error
  return { id: data.id, name: data.name, contactPerson: data.contact_person || '', phone: data.phone || '', email: data.email, location: data.address || 'Nigeria', pricingHistory: [], isActive: data.is_active, createdAt: data.created_at, totalTransactions: 0, totalKgSold: 0 }
}

export async function updateBuyer(id: string, updates: any) {
  if (!isSupabaseConfigured) return undefined
  const updateData: any = {}
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

export async function deleteBuyer(id: string) {
  if (!isSupabaseConfigured) return
  await supabase.from('vendors').update({ is_active: false }).eq('id', id)
}

// ============================================================================
// LOTS
// ============================================================================

export async function getLots() {
  if (!isSupabaseConfigured) return []
  const { data } = await supabase.from('lots').select('*, vendors(name)').order('purchase_date', { ascending: false })
  return (data || []).map(l => ({ id: l.id, lotNumber: l.lot_number, vendorId: l.vendor_id, vendorName: l.vendors?.name || 'Unknown', purchaseDate: l.purchase_date, expectedKg: l.expected_kg, actualKg: l.actual_kg || 0, pricePerKg: l.price_per_kg, totalCost: l.total_cost, materialType: 'PET', status: l.status, notes: l.notes, createdAt: l.created_at, createdBy: l.created_by }))
}

export async function createLot(lot: any) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from('lots').insert({ lot_number: lot.lotNumber, vendor_id: lot.vendorId, purchase_date: lot.purchaseDate, expected_kg: lot.expectedKg, actual_kg: lot.actualKg || null, price_per_kg: lot.pricePerKg, total_cost: lot.totalCost, status: lot.status, notes: lot.notes, created_by: lot.createdBy }).select('*, vendors(name)').single()
  if (error) throw error
  return { id: data.id, lotNumber: data.lot_number, vendorId: data.vendor_id, vendorName: data.vendors?.name || 'Unknown', purchaseDate: data.purchase_date, expectedKg: data.expected_kg, actualKg: data.actual_kg || 0, pricePerKg: data.price_per_kg, totalCost: data.total_cost, materialType: 'PET', status: data.status, notes: data.notes, createdAt: data.created_at, createdBy: data.created_by }
}

export async function updateLot(id: string, updates: any) {
  if (!isSupabaseConfigured) return undefined
  const updateData: any = {}
  if (updates.actualKg !== undefined) updateData.actual_kg = updates.actualKg
  if (updates.status) updateData.status = updates.status
  if (updates.notes) updateData.notes = updates.notes
  const { data, error } = await supabase.from('lots').update(updateData).eq('id', id).select('*, vendors(name)').single()
  if (error) return undefined
  return { id: data.id, lotNumber: data.lot_number, vendorId: data.vendor_id, vendorName: data.vendors?.name || 'Unknown', purchaseDate: data.purchase_date, expectedKg: data.expected_kg, actualKg: data.actual_kg || 0, pricePerKg: data.price_per_kg, totalCost: data.total_cost, materialType: 'PET', status: data.status, notes: data.notes, createdAt: data.created_at, createdBy: data.created_by }
}

export async function deleteLot(id: string) {
  if (!isSupabaseConfigured) return
  await supabase.from('lots').delete().eq('id', id)
}

// ============================================================================
// TRIPS
// ============================================================================

export async function getTrips() {
  if (!isSupabaseConfigured) return []
  const { data } = await supabase.from('trips').select('*').order('scheduled_date', { ascending: false })
  return (data || []).map(t => ({ id: t.id, tripNumber: t.trip_number, lotId: t.lot_id, driverName: t.driver_name, driverPhone: t.driver_phone, vehicleNumber: t.vehicle_number, pickupLocation: t.pickup_location, deliveryLocation: t.delivery_location, cost: t.logistics_cost || 0, status: t.status, scheduledDate: t.scheduled_date, completedDate: t.completed_date, createdAt: t.created_at }))
}

export async function createTrip(trip: any) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from('trips').insert({ trip_number: trip.tripNumber, lot_id: trip.lotId, driver_name: trip.driverName, driver_phone: trip.driverPhone, vehicle_number: trip.vehicleNumber, pickup_location: trip.pickupLocation, delivery_location: trip.deliveryLocation, logistics_cost: trip.cost, status: trip.status, scheduled_date: trip.scheduledDate, completed_date: trip.completedDate }).select().single()
  if (error) throw error
  return { id: data.id, tripNumber: data.trip_number, lotId: data.lot_id, driverName: data.driver_name, driverPhone: data.driver_phone, vehicleNumber: data.vehicle_number, pickupLocation: data.pickup_location, deliveryLocation: data.delivery_location, cost: data.logistics_cost || 0, status: data.status, scheduledDate: data.scheduled_date, completedDate: data.completed_date, createdAt: data.created_at }
}

export async function deleteTrip(id: string) {
  if (!isSupabaseConfigured) return
  await supabase.from('trips').delete().eq('id', id)
}

// ============================================================================
// HANDLING
// ============================================================================

export async function getHandlingEvents() {
  if (!isSupabaseConfigured) return []
  const { data } = await supabase.from('handling').select('*').order('offloading_date', { ascending: false })
  return (data || []).map(h => ({ id: h.id, lotId: h.lot_id, offloaderName: h.offloader_name || '', handlingCost: h.handling_cost || 0, date: h.offloading_date || new Date().toISOString(), notes: h.notes, createdAt: h.created_at }))
}

export async function createHandlingEvent(event: any) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from('handling').insert({ lot_id: event.lotId, offloader_name: event.offloaderName, handling_cost: event.handlingCost, offloading_date: event.date, notes: event.notes }).select().single()
  if (error) throw error
  return { id: data.id, lotId: data.lot_id, offloaderName: data.offloader_name || '', handlingCost: data.handling_cost || 0, date: data.offloading_date || new Date().toISOString(), notes: data.notes, createdAt: data.created_at }
}

export async function deleteHandlingEvent(id: string) {
  if (!isSupabaseConfigured) return
  await supabase.from('handling').delete().eq('id', id)
}

// ============================================================================
// BATCHES
// ============================================================================

export async function getBatches() {
  if (!isSupabaseConfigured) return []
  const { data } = await supabase.from('batches').select('*, lots(lot_number, vendors(name))').order('created_at', { ascending: false })
  return (data || []).map(b => ({ id: b.id, batchNumber: b.batch_number, lotId: b.lot_id, lotNumber: b.lots?.lot_number || 'Unknown', vendorName: b.lots?.vendors?.name || 'Unknown', materialType: 'PET', initialWeight: b.initial_weight, currentWeight: b.final_dry_flakes_weight || b.washed_flakes_weight || b.ground_flakes_weight || b.sorted_pet_weight || b.initial_weight, targetOutputKg: Math.round(b.initial_weight * 0.88), weights: { unsortedPet: b.initial_weight, sortedPet: b.sorted_pet_weight || 0, caps: b.caps_weight || 0, labels: b.labels_weight || 0, groundFlakes: b.ground_flakes_weight || 0, washedFlakes: b.washed_flakes_weight || 0, finalDryFlakes: b.final_dry_flakes_weight || 0, rejects: b.rejects_weight || 0 }, costPerKg: b.cost_per_kg || 0, currentState: b.current_state, status: b.status, checkpoints: [], productionStartDate: b.created_at, estimatedCompletionDate: undefined, actualCompletionDate: undefined, notes: undefined, createdAt: b.created_at, updatedAt: b.updated_at }))
}

export async function createBatch(batch: any) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from('batches').insert({ batch_number: batch.batchNumber, lot_id: batch.lotId, initial_weight: batch.initialWeight, sorted_pet_weight: batch.weights?.sortedPet || 0, caps_weight: batch.weights?.caps || 0, labels_weight: batch.weights?.labels || 0, ground_flakes_weight: batch.weights?.groundFlakes || 0, washed_flakes_weight: batch.weights?.washedFlakes || 0, final_dry_flakes_weight: batch.weights?.finalDryFlakes || 0, rejects_weight: batch.weights?.rejects || 0, total_yield_percent: 0, material_cost: 0, labour_cost: 0, logistics_cost: 0, handling_cost: 0, other_cost: 0, cost_per_kg: 0, current_state: batch.currentState || 'unsorted_pet', status: batch.status || 'active' }).select('*, lots(lot_number, vendors(name))').single()
  if (error) throw error
  return { id: data.id, batchNumber: data.batch_number, lotId: data.lot_id, lotNumber: data.lots?.lot_number || 'Unknown', vendorName: data.lots?.vendors?.name || 'Unknown', materialType: 'PET', initialWeight: data.initial_weight, currentWeight: data.final_dry_flakes_weight || data.initial_weight, targetOutputKg: Math.round(data.initial_weight * 0.88), weights: { unsortedPet: data.initial_weight, sortedPet: data.sorted_pet_weight || 0, caps: data.caps_weight || 0, labels: data.labels_weight || 0, groundFlakes: data.ground_flakes_weight || 0, washedFlakes: data.washed_flakes_weight || 0, finalDryFlakes: data.final_dry_flakes_weight || 0, rejects: data.rejects_weight || 0 }, costPerKg: data.cost_per_kg || 0, currentState: data.current_state, status: data.status, checkpoints: [], productionStartDate: data.created_at, estimatedCompletionDate: undefined, actualCompletionDate: undefined, notes: undefined, createdAt: data.created_at, updatedAt: data.updated_at }
}

export async function updateBatch(id: string, updates: any) {
  if (!isSupabaseConfigured) return undefined
  const updateData: any = {}
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
  return { id: data.id, batchNumber: data.batch_number, lotId: data.lot_id, lotNumber: data.lots?.lot_number || 'Unknown', vendorName: data.lots?.vendors?.name || 'Unknown', materialType: 'PET', initialWeight: data.initial_weight, currentWeight: data.final_dry_flakes_weight || data.initial_weight, targetOutputKg: Math.round(data.initial_weight * 0.88), weights: { unsortedPet: data.initial_weight, sortedPet: data.sorted_pet_weight || 0, caps: data.caps_weight || 0, labels: data.labels_weight || 0, groundFlakes: data.ground_flakes_weight || 0, washedFlakes: data.washed_flakes_weight || 0, finalDryFlakes: data.final_dry_flakes_weight || 0, rejects: data.rejects_weight || 0 }, costPerKg: data.cost_per_kg || 0, currentState: data.current_state, status: data.status, checkpoints: [], productionStartDate: data.created_at, estimatedCompletionDate: undefined, actualCompletionDate: undefined, notes: undefined, createdAt: data.created_at, updatedAt: data.updated_at }
}

export async function deleteBatch(id: string) {
  if (!isSupabaseConfigured) return
  await supabase.from('batches').delete().eq('id', id)
}

// ============================================================================
// WORKERS
// ============================================================================

export async function getWorkers() {
  if (!isSupabaseConfigured) return []
  const { data } = await supabase.from('workers').select('*').eq('is_active', true).order('name')
  return (data || []).map(w => ({ id: w.id, name: w.name, role: w.role, phone: w.phone, baseWageRate: 50, isActive: w.is_active, joinedAt: w.created_at, totalKgSorted: w.total_kg_sorted || 0, totalWagesEarned: w.total_wages_earned || 0 }))
}

export async function createWorker(worker: any) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from('workers').insert({ name: worker.name, role: worker.role, phone: worker.phone }).select().single()
  if (error) throw error
  return { id: data.id, name: data.name, role: data.role, phone: data.phone, baseWageRate: 50, isActive: data.is_active, joinedAt: data.created_at, totalKgSorted: data.total_kg_sorted || 0, totalWagesEarned: data.total_wages_earned || 0 }
}

export async function updateWorker(id: string, updates: any) {
  if (!isSupabaseConfigured) return undefined
  const updateData: any = {}
  if (updates.name) updateData.name = updates.name
  if (updates.role) updateData.role = updates.role
  if (updates.phone) updateData.phone = updates.phone
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive
  const { data, error } = await supabase.from('workers').update(updateData).eq('id', id).select().single()
  if (error) return undefined
  return { id: data.id, name: data.name, role: data.role, phone: data.phone, baseWageRate: 50, isActive: data.is_active, joinedAt: data.created_at, totalKgSorted: data.total_kg_sorted || 0, totalWagesEarned: data.total_wages_earned || 0 }
}

export async function deleteWorker(id: string) {
  if (!isSupabaseConfigured) return
  await supabase.from('workers').update({ is_active: false }).eq('id', id)
}

// ============================================================================
// SORTING
// ============================================================================

export async function getSortingOperations() {
  if (!isSupabaseConfigured) return []
  const { data } = await supabase.from('sorting_entries').select('*, workers(name), batches(batch_number)').order('date', { ascending: false })
  return (data || []).map(s => ({ id: s.id, batchId: s.batch_id, batchNumber: s.batches?.batch_number || 'Unknown', workerId: s.worker_id, workerName: s.workers?.name || 'Unknown', kgSorted: s.kg_sorted, wasteKg: s.waste_kg || 0, date: s.date, wageAmount: Math.round(s.kg_sorted * 50), notes: s.notes, createdAt: s.created_at }))
}

export async function createSortingOperation(op: any) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from('sorting_entries').insert({ batch_id: op.batchId, worker_id: op.workerId, kg_sorted: op.kgSorted, waste_kg: op.wasteKg || 0, date: op.date, notes: op.notes }).select('*, workers(name), batches(batch_number)').single()
  if (error) throw error
  await supabase.rpc('update_worker_stats', { worker_id: op.workerId })
  return { id: data.id, batchId: data.batch_id, batchNumber: data.batches?.batch_number || 'Unknown', workerId: data.worker_id, workerName: data.workers?.name || 'Unknown', kgSorted: data.kg_sorted, wasteKg: data.waste_kg || 0, date: data.date, wageAmount: Math.round(data.kg_sorted * 50), notes: data.notes, createdAt: data.created_at }
}

export async function deleteSortingOperation(id: string) {
  if (!isSupabaseConfigured) return
  await supabase.from('sorting_entries').delete().eq('id', id)
}

// ============================================================================
// WAGES
// ============================================================================

export async function getWagePolicies() {
  return [{ id: '1', role: 'sorter', baseRatePerKg: 50, minimumDailyWage: 1500, overtimeRate: 1.5, effectiveDate: '2024-01-01', isActive: true }, { id: '2', role: 'loader', baseRatePerKg: 0, minimumDailyWage: 2000, overtimeRate: 1.5, effectiveDate: '2024-01-01', isActive: true }, { id: '3', role: 'operator', baseRatePerKg: 0, minimumDailyWage: 5000, overtimeRate: 1.5, effectiveDate: '2024-01-01', isActive: true }]
}

export async function getWageEntries() {
  if (!isSupabaseConfigured) return []
  const { data } = await supabase.from('wage_entries').select('*, workers(name)').order('date', { ascending: false })
  return (data || []).map(w => ({ id: w.id, workerId: w.worker_id, workerName: w.workers?.name || 'Unknown', amount: w.amount, date: w.date, paymentMethod: 'cash', notes: w.notes, isPaid: true, paidAt: w.created_at, paidBy: w.created_by, createdAt: w.created_at }))
}

export async function createWageEntry(entry: any) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from('wage_entries').insert({ worker_id: entry.workerId, amount: entry.amount, date: entry.date, notes: entry.notes, created_by: entry.paidBy }).select('*, workers(name)').single()
  if (error) throw error
  await supabase.rpc('update_worker_stats', { worker_id: entry.workerId })
  return { id: data.id, workerId: data.worker_id, workerName: data.workers?.name || 'Unknown', amount: data.amount, date: data.date, paymentMethod: 'cash', notes: data.notes, isPaid: true, paidAt: data.created_at, paidBy: data.created_by, createdAt: data.created_at }
}

export async function deleteWageEntry(id: string) {
  if (!isSupabaseConfigured) return
  await supabase.from('wage_entries').delete().eq('id', id)
}

// ============================================================================
// EXPENSES
// ============================================================================

export async function getExpenses() {
  if (!isSupabaseConfigured) return []
  const { data } = await supabase.from('expenses').select('*, batches(batch_number), users(name)').order('date', { ascending: false })
  return (data || []).map(e => ({ id: e.id, category: e.category, amount: e.amount, description: e.description || '', date: e.date, batchId: e.batch_id, batchNumber: e.batches?.batch_number, createdBy: e.created_by, createdByName: e.users?.name, createdAt: e.created_at }))
}

export async function createExpense(expense: any) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from('expenses').insert({ category: expense.category, amount: expense.amount, description: expense.description, date: expense.date, batch_id: expense.batchId, created_by: expense.createdBy }).select('*, batches(batch_number), users(name)').single()
  if (error) throw error
  return { id: data.id, category: data.category, amount: data.amount, description: data.description || '', date: data.date, batchId: data.batch_id, batchNumber: data.batches?.batch_number, createdBy: data.created_by, createdByName: data.users?.name, createdAt: data.created_at }
}

export async function deleteExpense(id: string) {
  if (!isSupabaseConfigured) return
  await supabase.from('expenses').delete().eq('id', id)
}

// ============================================================================
// DISPATCHES
// ============================================================================

export async function getDispatches() {
  if (!isSupabaseConfigured) return []
  const { data } = await supabase.from('dispatches').select('*, batches(batch_number), vendors(name)').order('created_at', { ascending: false })
  return (data || []).map(d => ({ id: d.id, dispatchNumber: d.dispatch_number, batchIds: [d.batch_id], batches: d.batch_id ? [{ id: d.batch_id, batchNumber: d.batches?.batch_number || 'Unknown' }] : [], buyerId: d.buyer_id, buyer: d.buyer_id ? { id: d.buyer_id, name: d.vendors?.name || 'Unknown' } : undefined, totalWeight: d.quantity_kg, pricePerKg: d.price_per_kg, totalValue: d.total_amount, handlingCost: 0, deliveryCost: 0, totalCost: d.total_amount, factoryWeight: d.quantity_kg, buyerConfirmedWeight: d.quantity_kg, varianceKg: 0, variancePercent: 0, status: d.delivery_status, invoiceNumber: undefined, invoicedAt: undefined, paymentStatus: d.payment_status, amountPaid: d.payment_status === 'paid' ? d.total_amount : 0, profit: 0, profitMargin: 0, tripId: undefined, trip: undefined, dispatchedAt: d.dispatch_date || d.created_at, deliveredAt: undefined, confirmedAt: undefined, notes: d.notes, createdAt: d.created_at }))
}

export async function createDispatch(dispatch: any) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data, error } = await supabase.from('dispatches').insert({ dispatch_number: dispatch.dispatchNumber, batch_id: dispatch.batchIds?.[0], buyer_id: dispatch.buyerId, quantity_kg: dispatch.totalWeight, price_per_kg: dispatch.pricePerKg, total_amount: dispatch.totalValue, dispatch_date: dispatch.dispatchedAt, delivery_status: dispatch.status || 'preparing', payment_status: dispatch.paymentStatus || 'pending', payment_date: dispatch.paymentDate, notes: dispatch.notes }).select('*, batches(batch_number), vendors(name)').single()
  if (error) throw error
  return { id: data.id, dispatchNumber: data.dispatch_number, batchIds: [data.batch_id], batches: data.batch_id ? [{ id: data.batch_id, batchNumber: data.batches?.batch_number || 'Unknown' }] : [], buyerId: data.buyer_id, buyer: data.buyer_id ? { id: data.buyer_id, name: data.vendors?.name || 'Unknown' } : undefined, totalWeight: data.quantity_kg, pricePerKg: data.price_per_kg, totalValue: data.total_amount, handlingCost: 0, deliveryCost: 0, totalCost: data.total_amount, factoryWeight: data.quantity_kg, buyerConfirmedWeight: data.quantity_kg, varianceKg: 0, variancePercent: 0, status: data.delivery_status, invoiceNumber: undefined, invoicedAt: undefined, paymentStatus: data.payment_status, amountPaid: data.payment_status === 'paid' ? data.total_amount : 0, profit: 0, profitMargin: 0, tripId: undefined, trip: undefined, dispatchedAt: data.dispatch_date || data.created_at, deliveredAt: undefined, confirmedAt: undefined, notes: data.notes, createdAt: data.created_at }
}

export async function updateDispatch(id: string, updates: any) {
  if (!isSupabaseConfigured) return undefined
  const updateData: any = {}
  if (updates.status) updateData.delivery_status = updates.status
  if (updates.paymentStatus) updateData.payment_status = updates.paymentStatus
  if (updates.paymentDate) updateData.payment_date = updates.paymentDate
  if (updates.notes) updateData.notes = updates.notes
  const { data, error } = await supabase.from('dispatches').update(updateData).eq('id', id).select('*, batches(batch_number), vendors(name)').single()
  if (error) return undefined
  return { id: data.id, dispatchNumber: data.dispatch_number, batchIds: [data.batch_id], batches: data.batch_id ? [{ id: data.batch_id, batchNumber: data.batches?.batch_number || 'Unknown' }] : [], buyerId: data.buyer_id, buyer: data.buyer_id ? { id: data.buyer_id, name: data.vendors?.name || 'Unknown' } : undefined, totalWeight: data.quantity_kg, pricePerKg: data.price_per_kg, totalValue: data.total_amount, handlingCost: 0, deliveryCost: 0, totalCost: data.total_amount, factoryWeight: data.quantity_kg, buyerConfirmedWeight: data.quantity_kg, varianceKg: 0, variancePercent: 0, status: data.delivery_status, invoiceNumber: undefined, invoicedAt: undefined, paymentStatus: data.payment_status, amountPaid: data.payment_status === 'paid' ? data.total_amount : 0, profit: 0, profitMargin: 0, tripId: undefined, trip: undefined, dispatchedAt: data.dispatch_date || data.created_at, deliveredAt: undefined, confirmedAt: undefined, notes: data.notes, createdAt: data.created_at }
}

export async function deleteDispatch(id: string) {
  if (!isSupabaseConfigured) return
  await supabase.from('dispatches').delete().eq('id', id)
}

// ============================================================================
// TICKETS
// ============================================================================

export async function getTickets() {
  if (!isSupabaseConfigured) return []
  const { data } = await supabase.from('tickets').select('*, batches(batch_number), creator:created_by(name), assignee:assigned_to(name)').order('created_at', { ascending: false })
  return (data || []).map(t => ({ id: t.id, ticketNumber: t.ticket_number, title: t.title, description: t.description || '', category: t.category, priority: t.priority, status: t.status, linkedBatchId: t.batch_id, linkedBatchNumber: t.batches?.batch_number, createdBy: t.created_by, createdByUser: { id: t.created_by, name: t.creator?.name || 'Unknown', email: '', role: 'admin', isActive: true, createdAt: t.created_at }, assignedTo: t.assigned_to, assignedToUser: t.assignee ? { id: t.assigned_to, name: t.assignee.name, email: '', role: 'admin', isActive: true, createdAt: t.created_at } : undefined, createdAt: t.created_at, updatedAt: t.updated_at, resolvedAt: t.resolved_at, resolvedBy: undefined, comments: [] }))
}

export async function createTicket(ticket: any) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const ticketNum = `TKT-${String(Date.now()).slice(-6)}`
  const { data, error } = await supabase.from('tickets').insert({ ticket_number: ticketNum, title: ticket.title, description: ticket.description, category: ticket.category, priority: ticket.priority, status: 'open', batch_id: ticket.linkedBatchId, created_by: ticket.createdBy, assigned_to: ticket.assignedTo }).select('*, batches(batch_number), creator:created_by(name), assignee:assigned_to(name)').single()
  if (error) throw error
  return { id: data.id, ticketNumber: data.ticket_number, title: data.title, description: data.description || '', category: data.category, priority: data.priority, status: data.status, linkedBatchId: data.batch_id, linkedBatchNumber: data.batches?.batch_number, createdBy: data.created_by, createdByUser: { id: data.created_by, name: data.creator?.name || 'Unknown', email: '', role: 'admin', isActive: true, createdAt: data.created_at }, assignedTo: data.assigned_to, assignedToUser: data.assignee ? { id: data.assigned_to, name: data.assignee.name, email: '', role: 'admin', isActive: true, createdAt: data.created_at } : undefined, createdAt: data.created_at, updatedAt: data.updated_at, resolvedAt: data.resolved_at, resolvedBy: undefined, comments: [] }
}

export async function updateTicketStatus(id: string, status: string, userId?: string) {
  if (!isSupabaseConfigured) return undefined
  const updates: any = { status }
  if (status === 'resolved') updates.resolved_at = new Date().toISOString()
  const { data, error } = await supabase.from('tickets').update(updates).eq('id', id).select('*, batches(batch_number), creator:created_by(name), assignee:assigned_to(name)').single()
  if (error) return undefined
  return { id: data.id, ticketNumber: data.ticket_number, title: data.title, description: data.description || '', category: data.category, priority: data.priority, status: data.status, linkedBatchId: data.batch_id, linkedBatchNumber: data.batches?.batch_number, createdBy: data.created_by, createdByUser: { id: data.created_by, name: data.creator?.name || 'Unknown', email: '', role: 'admin', isActive: true, createdAt: data.created_at }, assignedTo: data.assigned_to, assignedToUser: data.assignee ? { id: data.assigned_to, name: data.assignee.name, email: '', role: 'admin', isActive: true, createdAt: data.created_at } : undefined, createdAt: data.created_at, updatedAt: data.updated_at, resolvedAt: data.resolved_at, resolvedBy: userId, comments: [] }
}

export async function addTicketComment(ticketId: string, comment: any) {
  if (!isSupabaseConfigured) return undefined
  await supabase.from('ticket_comments').insert({ ticket_id: ticketId, user_id: comment.userId, comment: comment.text, user_name: comment.userName })
  return getTicketById(ticketId)
}

export async function getTicketById(id: string) {
  if (!isSupabaseConfigured) return undefined
  const { data, error } = await supabase.from('tickets').select('*, batches(batch_number), creator:created_by(name), assignee:assigned_to(name), ticket_comments(*)').eq('id', id).single()
  if (error || !data) return undefined
  return { id: data.id, ticketNumber: data.ticket_number, title: data.title, description: data.description || '', category: data.category, priority: data.priority, status: data.status, linkedBatchId: data.batch_id, linkedBatchNumber: data.batches?.batch_number, createdBy: data.created_by, createdByUser: { id: data.created_by, name: data.creator?.name || 'Unknown', email: '', role: 'admin', isActive: true, createdAt: data.created_at }, assignedTo: data.assigned_to, assignedToUser: data.assignee ? { id: data.assigned_to, name: data.assignee.name, email: '', role: 'admin', isActive: true, createdAt: data.created_at } : undefined, createdAt: data.created_at, updatedAt: data.updated_at, resolvedAt: data.resolved_at, resolvedBy: undefined, comments: (data.ticket_comments || []).map((c: any) => ({ id: c.id, ticketId: c.ticket_id, userId: c.user_id, userName: c.user_name || 'Unknown', text: c.comment, createdAt: c.created_at })) }
}

export async function deleteTicket(id: string) {
  if (!isSupabaseConfigured) return
  await supabase.from('tickets').delete().eq('id', id)
}

// ============================================================================
// DASHBOARD
// ============================================================================

export async function getDashboardKPIs() {
  if (!isSupabaseConfigured) return { totalInputKg: 0, totalOutputKg: 0, overallYield: 0, revenue: 0, totalCosts: 0, grossProfit: 0, avgCostPerKg: 0, stockOnHand: { unsorted_pet: 0, sorted_pet: 0, caps: 0, labels: 0, ground_flakes: 0, washed_flakes: 0, final_flakes: 0, rejects: 0 }, activeWorkers: 0, totalWagesToday: 0, avgProductivity: 0, alerts: [] }

  const { data: batches } = await supabase.from('batches').select('*')
  const { data: workers } = await supabase.from('workers').select('*').eq('is_active', true)
  const { data: dispatches } = await supabase.from('dispatches').select('*').eq('payment_status', 'paid')

  const totalInputKg = (batches || []).reduce((sum: number, b: any) => sum + (b.initial_weight || 0), 0)
  const totalOutputKg = (batches || []).reduce((sum: number, b: any) => sum + (b.final_dry_flakes_weight || 0), 0)
  const overallYield = totalInputKg > 0 ? (totalOutputKg / totalInputKg) * 100 : 0

  const revenue = (dispatches || []).reduce((sum: number, d: any) => sum + (d.total_amount || 0), 0)
  const totalCosts = (batches || []).reduce((sum: number, b: any) => sum + (b.material_cost || 0) + (b.labour_cost || 0) + (b.logistics_cost || 0) + (b.handling_cost || 0) + (b.other_cost || 0), 0)

  const stockOnHand = {
    unsorted_pet: (batches || []).filter((b: any) => b.current_state === 'unsorted_pet').reduce((sum: number, b: any) => sum + (b.initial_weight || 0), 0),
    sorted_pet: (batches || []).filter((b: any) => b.current_state === 'sorted_pet').reduce((sum: number, b: any) => sum + (b.sorted_pet_weight || 0), 0),
    caps: (batches || []).reduce((sum: number, b: any) => sum + (b.caps_weight || 0), 0),
    labels: (batches || []).reduce((sum: number, b: any) => sum + (b.labels_weight || 0), 0),
    ground_flakes: (batches || []).filter((b: any) => b.current_state === 'ground_flakes').reduce((sum: number, b: any) => sum + (b.ground_flakes_weight || 0), 0),
    washed_flakes: (batches || []).filter((b: any) => b.current_state === 'washed_flakes').reduce((sum: number, b: any) => sum + (b.washed_flakes_weight || 0), 0),
    final_flakes: (batches || []).filter((b: any) => b.current_state === 'final_dry_flakes').reduce((sum: number, b: any) => sum + (b.final_dry_flakes_weight || 0), 0),
    rejects: (batches || []).reduce((sum: number, b: any) => sum + (b.rejects_weight || 0), 0)
  }

  const alerts: any[] = []
  if (overallYield < 85 && overallYield > 0) alerts.push({ id: 'yield', type: 'loss_threshold', severity: overallYield < 80 ? 'critical' : 'high', message: `Overall yield is ${overallYield.toFixed(1)}%`, createdAt: new Date().toISOString() })
  if (stockOnHand.final_flakes < 1000) alerts.push({ id: 'stock', type: 'low_stock', severity: stockOnHand.final_flakes < 500 ? 'critical' : 'high', message: `Final flakes stock low: ${stockOnHand.final_flakes.toFixed(0)} kg`, createdAt: new Date().toISOString() })

  return { totalInputKg, totalOutputKg, overallYield, revenue, totalCosts, grossProfit: revenue - totalCosts, avgCostPerKg: totalOutputKg > 0 ? totalCosts / totalOutputKg : 0, stockOnHand, activeWorkers: (workers || []).length, totalWagesToday: 0, avgProductivity: 0, alerts }
}

// ============================================================================
// REPORTS
// ============================================================================

export async function getProductionReport(startDate: string, endDate: string) {
  if (!isSupabaseConfigured) return { totalInput: 0, totalOutput: 0, yieldByStage: {}, batches: [] }
  const { data: batches, error } = await supabase.from('batches').select('*').gte('created_at', startDate).lte('created_at', endDate)
  if (error) return { totalInput: 0, totalOutput: 0, yieldByStage: {}, batches: [] }
  const totalInput = (batches || []).reduce((sum: number, b: any) => sum + (b.initial_weight || 0), 0)
  const totalOutput = (batches || []).reduce((sum: number, b: any) => sum + (b.final_dry_flakes_weight || 0), 0)
  return { totalInput, totalOutput, yieldByStage: { sorting: totalInput > 0 ? ((batches || []).reduce((sum: number, b: any) => sum + (b.sorted_pet_weight || 0), 0) / totalInput) * 100 : 0, grinding: totalInput > 0 ? ((batches || []).reduce((sum: number, b: any) => sum + (b.ground_flakes_weight || 0), 0) / totalInput) * 100 : 0, washing: totalInput > 0 ? ((batches || []).reduce((sum: number, b: any) => sum + (b.washed_flakes_weight || 0), 0) / totalInput) * 100 : 0 }, batches: (batches || []).map((b: any) => ({ id: b.id, batchNumber: b.batch_number, weights: { initialWeight: b.initial_weight, totalYieldPercent: b.total_yield_percent || 0 }, costs: { costPerKg: b.cost_per_kg || 0 } })) }
}

export async function getFinancialReport(startDate: string, endDate: string) {
  if (!isSupabaseConfigured) return { revenue: 0, materialCosts: 0, labourCosts: 0, logisticsCosts: 0, handlingCosts: 0, otherCosts: 0, grossProfit: 0, costPerKg: 0 }
  const { data: dispatches } = await supabase.from('dispatches').select('*').gte('dispatch_date', startDate).lte('dispatch_date', endDate).eq('payment_status', 'paid')
  const { data: batches } = await supabase.from('batches').select('*').gte('created_at', startDate).lte('created_at', endDate)
  const revenue = (dispatches || []).reduce((sum: number, d: any) => sum + (d.total_amount || 0), 0)
  const materialCosts = (batches || []).reduce((sum: number, b: any) => sum + (b.material_cost || 0), 0)
  const labourCosts = (batches || []).reduce((sum: number, b: any) => sum + (b.labour_cost || 0), 0)
  const logisticsCosts = (batches || []).reduce((sum: number, b: any) => sum + (b.logistics_cost || 0), 0)
  const handlingCosts = (batches || []).reduce((sum: number, b: any) => sum + (b.handling_cost || 0), 0)
  const otherCosts = (batches || []).reduce((sum: number, b: any) => sum + (b.other_cost || 0), 0)
  const totalCosts = materialCosts + labourCosts + logisticsCosts + handlingCosts + otherCosts
  const totalOutput = (batches || []).reduce((sum: number, b: any) => sum + (b.final_dry_flakes_weight || 0), 0)
  return { revenue, materialCosts, labourCosts, logisticsCosts, handlingCosts, otherCosts, grossProfit: revenue - totalCosts, costPerKg: totalOutput > 0 ? totalCosts / totalOutput : 0 }
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

export async function getAuditLogs() {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase.from('audit_logs').select('*, users(name)').order('created_at', { ascending: false }).limit(100)
  if (error) return []
  return (data || []).map((log: any) => ({ id: log.id, userId: log.user_id, userName: log.users?.name || 'Unknown', action: log.action, entityType: log.entity_type, entityId: log.entity_id, oldValue: log.old_values ? JSON.stringify(log.old_values) : undefined, newValue: log.new_values ? JSON.stringify(log.new_values) : undefined, details: log.new_values, ipAddress: log.ip_address, performedBy: log.user_id, performedAt: log.created_at, createdAt: log.created_at }))
}

export async function logAction(action: string, entityType: string, entityId: string, oldValues?: any, newValues?: any, userId?: string) {
  if (!isSupabaseConfigured) return
  await supabase.from('audit_logs').insert({ user_id: userId, action, entity_type: entityType, entity_id: entityId, old_values: oldValues, new_values: newValues })
}

// ============================================================================
// EXPORT
// ============================================================================

export const db = {
  login, logout, getCurrentUser,
  getUsers, createUser, updateUser,
  getVendors, createVendor, updateVendor, deleteVendor,
  getBuyers, createBuyer, updateBuyer, deleteBuyer,
  getLots, createLot, updateLot, deleteLot,
  getTrips, createTrip, deleteTrip,
  getHandlingEvents, createHandlingEvent, deleteHandlingEvent,
  getBatches, createBatch, updateBatch, deleteBatch,
  getWorkers, createWorker, updateWorker, deleteWorker,
  getSortingOperations, createSortingOperation, deleteSortingOperation,
  getWagePolicies, getWageEntries, createWageEntry, deleteWageEntry,
  getExpenses, createExpense, deleteExpense,
  getDispatches, createDispatch, updateDispatch, deleteDispatch,
  getTickets, getTicketById, createTicket, updateTicketStatus, addTicketComment, deleteTicket,
  getDashboardKPIs,
  getProductionReport, getFinancialReport,
  getAuditLogs, logAction,
  isSupabaseConfigured
}
