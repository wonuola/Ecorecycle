-- ============================================================================
-- ECORECYCLE FACTORY MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USERS
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'procurement',
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- 2. VENDORS (suppliers & buyers in one table)
-- ============================================================================
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('vendor', 'buyer')),
    contact_person VARCHAR(255),
    location VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    bank_name VARCHAR(255),
    bank_account VARCHAR(100),
    notes TEXT,
    material_types TEXT[],
    reliability_score INTEGER DEFAULT 80,
    total_transactions INTEGER DEFAULT 0,
    total_kg_purchased DECIMAL(12,2) DEFAULT 0,
    total_kg_sold DECIMAL(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_vendors_type ON vendors(type);
CREATE INDEX idx_vendors_active ON vendors(is_active);

-- ============================================================================
-- 3. LOTS (purchase orders)
-- ============================================================================
CREATE TABLE lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id UUID REFERENCES vendors(id),
    purchase_date DATE NOT NULL,
    expected_kg DECIMAL(10,2) NOT NULL,
    actual_kg DECIMAL(10,2),
    gross_weight DECIMAL(10,2),
    tare_weight DECIMAL(10,2),
    price_per_kg DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    material_type VARCHAR(50),
    grade VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
    amount_paid DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_lots_vendor ON lots(vendor_id);
CREATE INDEX idx_lots_status ON lots(status);

-- ============================================================================
-- 3b. GRNs (Goods Receipt Notes)
-- ============================================================================
CREATE TABLE grns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_number VARCHAR(50) UNIQUE NOT NULL,
    lot_id UUID REFERENCES lots(id),
    vendor_id UUID REFERENCES vendors(id),
    grn_date DATE NOT NULL,
    material_type VARCHAR(50),
    grade VARCHAR(50),
    gross_weight DECIMAL(10,2),
    tare_weight DECIMAL(10,2),
    net_weight DECIMAL(10,2),
    sample_wet_weight DECIMAL(10,2),
    sample_dry_weight DECIMAL(10,2),
    price_per_kg DECIMAL(10,2),
    total_cost DECIMAL(12,2),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
    amount_paid DECIMAL(12,2) DEFAULT 0,
    paid_date DATE,
    payment_method VARCHAR(50),
    paid_into_account VARCHAR(255),
    account_name VARCHAR(255),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_grns_lot ON grns(lot_id);
CREATE INDEX idx_grns_vendor ON grns(vendor_id);

-- ============================================================================
-- 4. TRIPS (logistics)
-- ============================================================================
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_number VARCHAR(50) UNIQUE NOT NULL,
    lot_id UUID REFERENCES lots(id),
    type VARCHAR(20) DEFAULT 'pickup' CHECK (type IN ('pickup', 'delivery', 'transfer')),
    driver_name VARCHAR(255) NOT NULL,
    driver_phone VARCHAR(20),
    vehicle_number VARCHAR(50),
    pickup_location TEXT,
    delivery_location TEXT,
    origin VARCHAR(255),
    destination VARCHAR(255),
    logistics_cost DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    fuel_cost DECIMAL(10,2) DEFAULT 0,
    driver_wage DECIMAL(10,2) DEFAULT 0,
    other_costs DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_transit', 'completed', 'cancelled')),
    scheduled_date DATE,
    completed_date DATE,
    departure_time TIMESTAMP WITH TIME ZONE,
    arrival_time TIMESTAMP WITH TIME ZONE,
    account_number VARCHAR(100),
    payment_timing VARCHAR(20) CHECK (payment_timing IN ('before', 'after', 'pending')),
    payment_status VARCHAR(20) CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_trips_lot ON trips(lot_id);
CREATE INDEX idx_trips_status ON trips(status);

-- ============================================================================
-- 5. HANDLING
-- ============================================================================
CREATE TABLE handling (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_id UUID REFERENCES lots(id),
    offloader_name VARCHAR(255),
    handling_cost DECIMAL(10,2) DEFAULT 0,
    offloading_date DATE,
    notes TEXT,
    account_number VARCHAR(100),
    payment_timing VARCHAR(20) CHECK (payment_timing IN ('before', 'after', 'pending')),
    payment_status VARCHAR(20) CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_handling_lot ON handling(lot_id);

-- ============================================================================
-- 6. BATCHES (warehouse)
-- ============================================================================
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_number VARCHAR(50) UNIQUE NOT NULL,
    lot_id UUID REFERENCES lots(id),
    initial_weight DECIMAL(10,2) NOT NULL,
    sorted_pet_weight DECIMAL(10,2) DEFAULT 0,
    caps_weight DECIMAL(10,2) DEFAULT 0,
    labels_weight DECIMAL(10,2) DEFAULT 0,
    ground_flakes_weight DECIMAL(10,2) DEFAULT 0,
    washed_flakes_weight DECIMAL(10,2) DEFAULT 0,
    final_dry_flakes_weight DECIMAL(10,2) DEFAULT 0,
    rejects_weight DECIMAL(10,2) DEFAULT 0,
    total_yield_percent DECIMAL(5,2) DEFAULT 0,
    material_cost DECIMAL(12,2) DEFAULT 0,
    labour_cost DECIMAL(12,2) DEFAULT 0,
    logistics_cost DECIMAL(12,2) DEFAULT 0,
    handling_cost DECIMAL(12,2) DEFAULT 0,
    other_cost DECIMAL(12,2) DEFAULT 0,
    cost_per_kg DECIMAL(10,2) DEFAULT 0,
    current_state VARCHAR(50) DEFAULT 'unsorted_pet',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'dispatched', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_batches_lot ON batches(lot_id);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_batches_state ON batches(current_state);

-- ============================================================================
-- 7. WORKERS
-- ============================================================================
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'sorter',
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    total_kg_sorted DECIMAL(10,2) DEFAULT 0,
    total_wages_earned DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_workers_active ON workers(is_active);

-- ============================================================================
-- 8. SORTING ENTRIES
-- ============================================================================
CREATE TABLE sorting_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES workers(id),
    kg_sorted DECIMAL(10,2) NOT NULL,
    waste_kg DECIMAL(10,2) DEFAULT 0,
    wage_amount DECIMAL(10,2) DEFAULT 0,
    date DATE NOT NULL,
    notes TEXT,
    account_number VARCHAR(100),
    payment_timing VARCHAR(20) CHECK (payment_timing IN ('before', 'after', 'pending')),
    payment_status VARCHAR(20) CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_sorting_batch ON sorting_entries(batch_id);
CREATE INDEX idx_sorting_worker ON sorting_entries(worker_id);
CREATE INDEX idx_sorting_date ON sorting_entries(date);

-- ============================================================================
-- 9. WAGE ENTRIES
-- ============================================================================
CREATE TABLE wage_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID REFERENCES workers(id),
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_wages_worker ON wage_entries(worker_id);
CREATE INDEX idx_wages_date ON wage_entries(date);

-- ============================================================================
-- 10. EXPENSES
-- ============================================================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    expense_date DATE,
    batch_id UUID REFERENCES batches(id),
    allocated_to VARCHAR(100),
    account_name VARCHAR(255),
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
    amount_paid DECIMAL(10,2) DEFAULT 0,
    is_paid BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date ON expenses(date);

-- ============================================================================
-- 11. DISPATCHES
-- ============================================================================
CREATE TABLE dispatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatch_number VARCHAR(50) UNIQUE NOT NULL,
    batch_id UUID REFERENCES batches(id),
    batch_ids UUID[] DEFAULT '{}',
    buyer_id UUID REFERENCES vendors(id),
    buyer_name VARCHAR(255),
    quantity_kg DECIMAL(10,2) NOT NULL,
    total_weight DECIMAL(10,2) DEFAULT 0,
    price_per_kg DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    total_value DECIMAL(12,2) DEFAULT 0,
    handling_cost DECIMAL(10,2) DEFAULT 0,
    delivery_cost DECIMAL(10,2) DEFAULT 0,
    profit DECIMAL(12,2) DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,
    cost_per_kg DECIMAL(10,2) DEFAULT 0,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    amount_outstanding DECIMAL(12,2) DEFAULT 0,
    dispatch_date DATE,
    delivery_status VARCHAR(20) DEFAULT 'preparing' CHECK (delivery_status IN ('preparing', 'dispatched', 'in_transit', 'delivered', 'confirmed')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
    payment_date DATE,
    payment_received_date DATE,
    received_into_account VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_dispatches_batch ON dispatches(batch_id);
CREATE INDEX idx_dispatches_buyer ON dispatches(buyer_id);
CREATE INDEX idx_dispatches_status ON dispatches(delivery_status);

-- ============================================================================
-- 12. TICKETS
-- ============================================================================
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    batch_id UUID REFERENCES batches(id),
    created_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_batch ON tickets(batch_id);

-- ============================================================================
-- 13. TICKET COMMENTS
-- ============================================================================
CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    comment TEXT NOT NULL,
    user_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_comments_ticket ON ticket_comments(ticket_id);

-- ============================================================================
-- 14. AUDIT LOGS
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    details JSONB,
    field_name VARCHAR(255),
    reason TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: update_worker_stats
-- ============================================================================

CREATE OR REPLACE FUNCTION update_worker_stats(worker_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE workers
    SET 
        total_kg_sorted = COALESCE((SELECT SUM(kg_sorted) FROM sorting_entries WHERE sorting_entries.worker_id = workers.id), 0),
        total_wages_earned = COALESCE((SELECT SUM(amount) FROM wage_entries WHERE wage_entries.worker_id = workers.id), 0)
    WHERE workers.id = worker_id;
END;
$$ language 'plpgsql';

-- ============================================================================
-- DEFAULT USERS (Owner can delete, Admin cannot)
-- ============================================================================

INSERT INTO users (email, password_hash, name, role, is_active) VALUES
('owner@ecorecycle.com', 'owner123', 'Business Owner', 'owner', true),
('admin@ecorecycle.com', 'admin123', 'System Administrator', 'admin', true),
('procurement@ecorecycle.com', 'procure123', 'Procurement Officer', 'procurement', true),
('warehouse@ecorecycle.com', 'warehouse123', 'Warehouse Officer', 'warehouse_officer', true),
('sorting@ecorecycle.com', 'sorting123', 'Sorting Supervisor', 'sorting_supervisor', true),
('production@ecorecycle.com', 'production123', 'Production Supervisor', 'production_supervisor', true),
('logistics@ecorecycle.com', 'logistics123', 'Logistics Officer', 'logistics_officer', true),
('finance@ecorecycle.com', 'finance123', 'Finance Officer', 'finance', true),
('auditor@ecorecycle.com', 'auditor123', 'System Auditor', 'auditor', true);
