-- ==========================================================
-- 0. PERSIAPAN DATABASE
-- ==========================================================
DROP DATABASE IF EXISTS erp_konstruksi;
CREATE DATABASE erp_konstruksi
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE erp_konstruksi;

-- ==========================================================
-- 1. MODUL AUTENTIKASI & RBAC (Spatie Standard + Portal Type)
-- ==========================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    portal_type ENUM('Owner', 'Finance', 'Purchasing', 'PM', 'Mandor', 'Admin') NOT NULL DEFAULT 'Admin',
    guard_name VARCHAR(255) NOT NULL DEFAULT 'web',
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    guard_name VARCHAR(255) NOT NULL DEFAULT 'web',
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS role_has_permissions (
    permission_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (permission_id, role_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS model_has_roles (
    role_id BIGINT UNSIGNED NOT NULL,
    model_type VARCHAR(255) NOT NULL DEFAULT 'App\\Models\\User',
    model_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, model_id, model_type),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- 2. COMPANY SETTING & MASTER DATA INDEPENDEN
-- ==========================================================
CREATE TABLE IF NOT EXISTS companies (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(255) NULL,
    npwp VARCHAR(50) NULL,
    address TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cost_codes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS material_categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS expense_categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS income_categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS units (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    address TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS suppliers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    address TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS warehouses (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT NULL,
    manager_id BIGINT UNSIGNED NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==========================================================
-- 3. MODUL MASTER MATERIAL, EQUIPMENT, LABOR & AHSP
-- ==========================================================
CREATE TABLE IF NOT EXISTS materials (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    unit_id BIGINT UNSIGNED NOT NULL,
    purchase_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    current_stock DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
    min_stock DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
    description TEXT NULL,
    status BOOLEAN DEFAULT TRUE,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (category_id) REFERENCES material_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS equipments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    unit_id BIGINT UNSIGNED NOT NULL,
    hourly_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    description TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS labors (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    position VARCHAR(100) NOT NULL UNIQUE,
    daily_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    hourly_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    description TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ahsps (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    unit_id BIGINT UNSIGNED NOT NULL,
    cost_code_id BIGINT UNSIGNED NULL,
    total_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT,
    FOREIGN KEY (cost_code_id) REFERENCES cost_codes(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ahsp_materials (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ahsp_id BIGINT UNSIGNED NOT NULL,
    material_id BIGINT UNSIGNED NOT NULL,
    coefficient DECIMAL(10,4) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (ahsp_id) REFERENCES ahsps(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ahsp_equipments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ahsp_id BIGINT UNSIGNED NOT NULL,
    equipment_id BIGINT UNSIGNED NOT NULL,
    coefficient DECIMAL(10,4) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (ahsp_id) REFERENCES ahsps(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipments(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ahsp_labors (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ahsp_id BIGINT UNSIGNED NOT NULL,
    labor_id BIGINT UNSIGNED NOT NULL,
    coefficient DECIMAL(10,4) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (ahsp_id) REFERENCES ahsps(id) ON DELETE CASCADE,
    FOREIGN KEY (labor_id) REFERENCES labors(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ==========================================================
-- 4. MODUL PROYEK & PENDUKUNGNYA
-- ==========================================================
CREATE TABLE IF NOT EXISTS projects (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    customer_id BIGINT UNSIGNED NOT NULL,
    manager_id BIGINT UNSIGNED NOT NULL,
    project_type ENUM('Residential', 'Commercial', 'Warehouse', 'Factory', 'Interior', 'Renovation', 'Infrastructure') NOT NULL,
    building_area DECIMAL(10,2) NOT NULL,
    floor_count INT NOT NULL DEFAULT 1,
    material_class ENUM('Economy', 'Standard', 'Premium') NOT NULL,
    worker_system ENUM('Daily', 'Contract') NOT NULL,
    land_condition ENUM('Empty', 'Need Demolition', 'Need Levelling', 'Need Filling') NOT NULL,
    project_address TEXT NULL,
    contract_value DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    down_payment DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status ENUM('Planning', 'Running', 'Paused', 'Completed') DEFAULT 'Planning',
    start_date DATE NULL,
    deadline_date DATE NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS project_members (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    role VARCHAR(100) NOT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS project_timelines (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('Pending', 'In Progress', 'Completed', 'Delayed') DEFAULT 'Pending',
    description TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS project_termins (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    termin_name VARCHAR(100) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status ENUM('Pending', 'Ready to Bill', 'Billed', 'Paid') DEFAULT 'Pending',
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS media_attachments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uploader_id BIGINT UNSIGNED NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT UNSIGNED NOT NULL,
    document_type ENUM('Blueprint', 'Contract', 'Photo', 'Permit', 'Drawing', 'Invoice', 'Receipt', 'Other') NOT NULL DEFAULT 'Other',
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_media_model (model_type, model_id),
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ==========================================================
-- 5. MODUL RAB (Rencana Anggaran Biaya)
-- ==========================================================
CREATE TABLE IF NOT EXISTS rabs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    version INT NOT NULL DEFAULT 1,
    grand_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rab_versions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    rab_id BIGINT UNSIGNED NOT NULL,
    version INT NOT NULL,
    description TEXT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rab_id) REFERENCES rabs(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rab_groups (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    rab_id BIGINT UNSIGNED NOT NULL,
    cost_code_id BIGINT UNSIGNED NULL,
    name VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rab_id) REFERENCES rabs(id) ON DELETE CASCADE,
    FOREIGN KEY (cost_code_id) REFERENCES cost_codes(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rab_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT UNSIGNED NOT NULL,
    ahsp_id BIGINT UNSIGNED NULL,
    description VARCHAR(255) NOT NULL,
    volume DECIMAL(12,4) NOT NULL,
    unit_id BIGINT UNSIGNED NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    margin_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(15,2) NOT NULL,
    sort_order INT DEFAULT 0,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES rab_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (ahsp_id) REFERENCES ahsps(id) ON DELETE SET NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ==========================================================
-- 6. MODUL PURCHASING & INVENTORY PROYEK
-- ==========================================================
CREATE TABLE IF NOT EXISTS purchase_requests (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    pr_number VARCHAR(100) NOT NULL UNIQUE,
    project_id BIGINT UNSIGNED NOT NULL,
    cost_code_id BIGINT UNSIGNED NULL,
    requester_id BIGINT UNSIGNED NOT NULL,
    request_date DATE NOT NULL,
    status ENUM('Draft', 'Waiting Approval', 'Approved', 'Rejected') DEFAULT 'Draft',
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
    FOREIGN KEY (cost_code_id) REFERENCES cost_codes(id) ON DELETE SET NULL,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pr_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    pr_id BIGINT UNSIGNED NOT NULL,
    material_id BIGINT UNSIGNED NOT NULL,
    quantity DECIMAL(12,4) NOT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pr_id) REFERENCES purchase_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS purchase_orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    po_number VARCHAR(100) NOT NULL UNIQUE,
    pr_id BIGINT UNSIGNED NULL,
    project_id BIGINT UNSIGNED NOT NULL,
    cost_code_id BIGINT UNSIGNED NULL,
    supplier_id BIGINT UNSIGNED NOT NULL,
    creator_id BIGINT UNSIGNED NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status ENUM('Draft', 'Waiting Approval', 'Approved', 'Completed', 'Canceled') DEFAULT 'Draft',
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (pr_id) REFERENCES purchase_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
    FOREIGN KEY (cost_code_id) REFERENCES cost_codes(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS po_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    po_id BIGINT UNSIGNED NOT NULL,
    material_id BIGINT UNSIGNED NOT NULL,
    quantity DECIMAL(12,4) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS goods_receipts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    gr_number VARCHAR(100) NOT NULL UNIQUE,
    po_id BIGINT UNSIGNED NOT NULL,
    receiver_id BIGINT UNSIGNED NOT NULL,
    warehouse_id BIGINT UNSIGNED NULL,
    receipt_date DATE NOT NULL,
    notes TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE RESTRICT,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS gr_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    gr_id BIGINT UNSIGNED NOT NULL,
    material_id BIGINT UNSIGNED NOT NULL,
    quantity_received DECIMAL(12,4) NOT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gr_id) REFERENCES goods_receipts(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stock_movements (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    material_id BIGINT UNSIGNED NOT NULL,
    project_id BIGINT UNSIGNED NULL,
    warehouse_id BIGINT UNSIGNED NULL,
    qty DECIMAL(12,4) NOT NULL,
    type ENUM('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER') NOT NULL,
    reference_type VARCHAR(255) NULL,
    reference_id BIGINT UNSIGNED NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==========================================================
-- 7. MODUL EKSEKUSI & PROGRESS LAPANGAN
-- ==========================================================
CREATE TABLE IF NOT EXISTS daily_reports (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    mandor_id BIGINT UNSIGNED NOT NULL,
    report_date DATE NOT NULL,
    weather ENUM('Sunny', 'Cloudy', 'Rainy', 'Heavy Rain') NOT NULL,
    worker_count INT NOT NULL DEFAULT 0,
    notes TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
    FOREIGN KEY (mandor_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS material_usages (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT UNSIGNED NOT NULL,
    material_id BIGINT UNSIGNED NOT NULL,
    cost_code_id BIGINT UNSIGNED NULL,
    quantity_used DECIMAL(12,4) NOT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES daily_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT,
    FOREIGN KEY (cost_code_id) REFERENCES cost_codes(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS project_progress (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    reporter_id BIGINT UNSIGNED NOT NULL,
    report_date DATE NOT NULL,
    progress_percentage DECIMAL(5,2) NOT NULL,
    milestone_name VARCHAR(255) NULL,
    description TEXT NULL,
    status ENUM('Draft', 'Waiting Approval', 'Approved') DEFAULT 'Draft',
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ==========================================================
-- 8. MODUL FINANCE & AUDIT
-- ==========================================================
CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    project_id BIGINT UNSIGNED NOT NULL,
    progress_id BIGINT UNSIGNED NULL,
    termin_percentage DECIMAL(5,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('Unpaid', 'Partial', 'Paid', 'Overdue') DEFAULT 'Unpaid',
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
    FOREIGN KEY (progress_id) REFERENCES project_progress(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payment_histories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    termin_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(100) NULL,
    reference VARCHAR(255) NULL,
    notes TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (termin_id) REFERENCES project_termins(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cashflows (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    transaction_date DATE NOT NULL,
    cost_code_id BIGINT UNSIGNED NULL,
    reference_id BIGINT UNSIGNED NULL,
    reference_type VARCHAR(255) NULL,
    type ENUM('INCOME', 'EXPENSE') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reference (reference_type, reference_id),
    FOREIGN KEY (cost_code_id) REFERENCES cost_codes(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==========================================================
-- 9. NOTIFIKASI, AKTIVITAS & PERSETUJUAN
-- ==========================================================
CREATE TABLE IF NOT EXISTS approval_histories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    module VARCHAR(100) NOT NULL,
    reference_id BIGINT UNSIGNED NOT NULL,
    approved_by BIGINT UNSIGNED NOT NULL,
    status ENUM('Approved', 'Rejected', 'Revised') NOT NULL,
    notes TEXT NULL,
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(100) NULL,
    reference_id BIGINT UNSIGNED NULL,
    url VARCHAR(255) NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL,
    reference_id BIGINT UNSIGNED NULL,
    description TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id BIGINT UNSIGNED NOT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    widget_name VARCHAR(100) NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- 10. DUMMY DATA SEEDING (FROM MOCK DATA)
-- ==========================================================

INSERT INTO roles (id, name, portal_type, guard_name) VALUES 
(1, 'Super Admin', 'Admin', 'web'),
(2, 'Owner', 'Owner', 'web'),
(3, 'Finance Manager', 'Finance', 'web'),
(4, 'Purchasing Staff', 'Purchasing', 'web'),
(5, 'Project Manager', 'PM', 'web'),
(6, 'Mandor Lapangan', 'Mandor', 'web');

INSERT INTO users (id, name, email, password) VALUES 
(1, 'Admin Utama', 'admin@constructerp.id', '$2b$10$B0FaqojuQfAQyL6ylTMejeA.Hh6JCBp3lpIjekZEss2Hf3ibIS/vC'),
(2, 'Bapak Owner', 'owner@constructerp.id', '$2b$10$B0FaqojuQfAQyL6ylTMejeA.Hh6JCBp3lpIjekZEss2Hf3ibIS/vC'),
(3, 'Ibu Finance', 'finance@constructerp.id', '$2b$10$B0FaqojuQfAQyL6ylTMejeA.Hh6JCBp3lpIjekZEss2Hf3ibIS/vC'),
(4, 'Budi Purchasing', 'purchasing@constructerp.id', '$2b$10$B0FaqojuQfAQyL6ylTMejeA.Hh6JCBp3lpIjekZEss2Hf3ibIS/vC'),
(5, 'Agus Project Manager', 'pm@constructerp.id', '$2b$10$B0FaqojuQfAQyL6ylTMejeA.Hh6JCBp3lpIjekZEss2Hf3ibIS/vC'),
(6, 'Joko Mandor', 'mandor@constructerp.id', '$2b$10$B0FaqojuQfAQyL6ylTMejeA.Hh6JCBp3lpIjekZEss2Hf3ibIS/vC');

INSERT INTO model_has_roles (role_id, model_type, model_id) VALUES 
(1, 'App\\Models\\User', 1),
(2, 'App\\Models\\User', 2),
(3, 'App\\Models\\User', 3),
(4, 'App\\Models\\User', 4),
(5, 'App\\Models\\User', 5),
(6, 'App\\Models\\User', 6);

INSERT INTO users (id, name, email, password) VALUES (7, 'Budi Santoso', 'budi santoso@constructerp.id', '$2b$10$B0FaqojuQfAQyL6ylTMejeA.Hh6JCBp3lpIjekZEss2Hf3ibIS/vC');
INSERT INTO model_has_roles (role_id, model_type, model_id) VALUES (5, 'App\\Models\\User', 7);
INSERT INTO users (id, name, email, password) VALUES (8, 'Andi Pratama', 'andi pratama@constructerp.id', '$2b$10$B0FaqojuQfAQyL6ylTMejeA.Hh6JCBp3lpIjekZEss2Hf3ibIS/vC');
INSERT INTO model_has_roles (role_id, model_type, model_id) VALUES (5, 'App\\Models\\User', 8);
INSERT INTO users (id, name, email, password) VALUES (9, 'Reza Firmansyah', 'reza firmansyah@constructerp.id', '$2b$10$B0FaqojuQfAQyL6ylTMejeA.Hh6JCBp3lpIjekZEss2Hf3ibIS/vC');
INSERT INTO model_has_roles (role_id, model_type, model_id) VALUES (5, 'App\\Models\\User', 9);
INSERT INTO users (id, name, email, password) VALUES (10, 'Siti Nurhaliza', 'siti nurhaliza@constructerp.id', '$2b$10$B0FaqojuQfAQyL6ylTMejeA.Hh6JCBp3lpIjekZEss2Hf3ibIS/vC');
INSERT INTO model_has_roles (role_id, model_type, model_id) VALUES (5, 'App\\Models\\User', 10);
INSERT INTO users (id, name, email, password) VALUES (11, 'Fajar Nugroho', 'fajar nugroho@constructerp.id', '$2b$10$B0FaqojuQfAQyL6ylTMejeA.Hh6JCBp3lpIjekZEss2Hf3ibIS/vC');
INSERT INTO model_has_roles (role_id, model_type, model_id) VALUES (5, 'App\\Models\\User', 11);

INSERT INTO customers (id, name, company, email, phone) VALUES 
(1, 'PT. Maju Jaya Properti', 'PT. Maju Jaya Properti', 'customer1@example.com', '081200000'),
(2, 'Tn. Sanjaya Kumala', 'Personal', 'customer2@example.com', '081200001'),
(3, 'PT. Lippo Mall', 'PT. Lippo Mall Indonesia', 'customer3@example.com', '081200002'),
(4, 'PT. Rumah Sakit Permata', 'PT. Rumah Sakit Permata', 'customer4@example.com', '081200003'),
(5, 'PT. Green Property', 'PT. Green Property Indonesia', 'customer5@example.com', '081200004');

INSERT INTO projects (id, uuid, code, name, customer_id, manager_id, project_type, building_area, floor_count, material_class, worker_system, land_condition, contract_value, status) VALUES 
(1, '77fecf4b-3c07-4266-9ae1-bd257a681c55', 'PRJ-001', 'Gedung Perkantoran Sudirman', 1, 7, 'Commercial', 4500, 12, 'Premium', 'Contract', 'Empty', 18000000000, 'Running'),
(2, '3d5956ae-4f1b-4e26-82dc-e6255a2312b0', 'PRJ-002', 'Villa Residence Bali', 2, 8, 'Residential', 850, 2, 'Standard', 'Daily', 'Empty', 5200000000, 'Running'),
(3, '82100033-7276-4e3a-a91b-74d742897c9e', 'PRJ-003', 'Mall Extension Kasablanka', 3, 9, 'Commercial', 12000, 5, 'Premium', 'Contract', 'Empty', 48500000000, 'Running'),
(4, '9198e588-3a85-4545-9756-292efc5173c1', 'PRJ-004', 'Renovasi RS Permata Indah', 4, 10, 'Renovation', 2200, 4, 'Standard', 'Daily', 'Empty', 9800000000, 'Paused'),
(5, '61c01bb5-d669-4d26-bcdc-e58c8d96cbe9', 'PRJ-005', 'Apartemen Green Towers', 5, 11, 'Residential', 8500, 20, 'Standard', 'Contract', 'Empty', 32000000000, 'Completed');

INSERT INTO suppliers (id, name, contact_person, phone) VALUES 
(1, 'PT. Holcim Indonesia', 'Contact PT. Holcim Indonesia', '081111000'),
(2, 'PT. Krakatau Steel', 'Contact PT. Krakatau Steel', '081111001'),
(3, 'CV. Bata Jaya', 'Contact CV. Bata Jaya', '081111002'),
(4, 'PT. Semen Indonesia', 'Contact PT. Semen Indonesia', '081111003'),
(5, 'CV. Pasir Sejati', 'Contact CV. Pasir Sejati', '081111004'),
(6, 'PT. Roman Ceramik', 'Contact PT. Roman Ceramik', '081111005'),
(7, 'PT. Nippon Paint', 'Contact PT. Nippon Paint', '081111006'),
(8, 'PT. Wavin', 'Contact PT. Wavin', '081111007');

INSERT INTO material_categories (id, name) VALUES (1, 'Struktur'), (2, 'Dinding'), (3, 'Material'), (4, 'Finishing'), (5, 'MEP');
INSERT INTO units (id, code, name) VALUES (1, 'm3', 'Meter Kubik'), (2, 'kg', 'Kilogram'), (3, 'buah', 'Buah'), (4, 'sak', 'Sak'), (5, 'm2', 'Meter Persegi'), (6, 'liter', 'Liter'), (7, 'batang', 'Batang');

INSERT INTO materials (id, code, name, category_id, unit_id, purchase_price, selling_price, current_stock) VALUES 
(1, 'MAT-001', 'Beton K-300', 1, 1, 850000, 977500, 450),
(2, 'MAT-002', 'Besi Beton D13', 1, 2, 12500, 14000, 8500),
(3, 'MAT-003', 'Batu Bata Merah', 2, 3, 800, 960, 25000),
(4, 'MAT-004', 'Semen Portland 50kg', 3, 4, 65000, 71500, 350),
(5, 'MAT-005', 'Pasir Halus', 3, 1, 185000, 218300, 80),
(6, 'MAT-006', 'Keramik 60x60 Polished', 4, 5, 125000, 156250, 0),
(7, 'MAT-007', 'Cat Eksterior Weathershield', 4, 6, 85000, 102000, 120),
(8, 'MAT-008', 'Pipa PVC 4 inch', 5, 7, 55000, 63250, 200);

INSERT INTO invoices (id, uuid, invoice_number, project_id, termin_percentage, amount, due_date, status) VALUES 
(1, '6f12674c-e380-4fde-9828-995e4f155082', 'INV-2024-001', 1, 0, 3600000000, '2024-10-31', 'Paid'),
(2, '5e80d6c0-ad5c-4629-b1c5-423d48da9cc0', 'INV-2024-002', 2, 0, 1040000000, '2024-11-14', 'Paid'),
(3, '6af7e45d-b565-4106-ba12-f20397c1b39f', 'INV-2024-003', 3, 0, 9700000000, '2024-11-30', 'Unpaid'),
(4, '8929b5a8-5973-4a16-a0a5-a718d3235e44', 'INV-2024-004', 1, 0, 4500000000, '2024-09-30', 'Overdue'),
(5, 'ff0cd317-e40a-41f8-8b34-c198570bba10', 'INV-2024-005', 5, 0, 6400000000, '2024-12-15', 'Unpaid');

INSERT INTO cashflows (id, uuid, transaction_date, cost_code_id, type, amount, description) VALUES 
(1, '27ad7163-72ea-4b7d-9373-07cce1a96b45', '2024-06-01', null, 'INCOME', 8500000000, 'Pendapatan Jun'),
(2, '0591eb26-3d68-4355-8249-5e76a1f7b6b3', '2024-06-01', null, 'EXPENSE', 5200000000, 'Pengeluaran Jun'),
(3, '08125c3d-c712-4987-9414-c5138f40343e', '2024-07-01', null, 'INCOME', 12200000000, 'Pendapatan Jul'),
(4, '9dc0048c-7403-4690-836e-d5e1e6f8c8df', '2024-07-01', null, 'EXPENSE', 7800000000, 'Pengeluaran Jul'),
(5, '6c8f4024-5506-4aae-ae01-489e7845e8b1', '2024-08-01', null, 'INCOME', 9800000000, 'Pendapatan Aug'),
(6, 'f591bcf6-9aa6-481c-8229-5d6219b56a26', '2024-08-01', null, 'EXPENSE', 6500000000, 'Pengeluaran Aug'),
(7, '77a4af17-8d7a-42a2-bdd2-a79bd1f15a9c', '2024-09-01', null, 'INCOME', 15600000000, 'Pendapatan Sep'),
(8, '0db2292b-28b6-4572-8eac-f0d8df7a0556', '2024-09-01', null, 'EXPENSE', 9200000000, 'Pengeluaran Sep'),
(9, 'efb9914a-57c8-4778-9a87-65e55d4e92f3', '2024-10-01', null, 'INCOME', 18900000000, 'Pendapatan Okt'),
(10, '83972dd9-e939-4247-baf1-af7fba76cb5f', '2024-10-01', null, 'EXPENSE', 11500000000, 'Pengeluaran Okt'),
(11, 'fbfe9ab5-3c4d-4ef7-9738-75767d286f05', '2024-11-01', null, 'INCOME', 14200000000, 'Pendapatan Nov'),
(12, 'adba3722-8daa-4ae7-8c8b-c52d3c486cf2', '2024-11-01', null, 'EXPENSE', 8800000000, 'Pengeluaran Nov'),
(13, 'af4ca85d-4896-41b5-992d-9be90ea35349', '2024-12-01', null, 'INCOME', 22500000000, 'Pendapatan Des'),
(14, '5670745c-6dc3-46de-9c6a-8cc24e885b52', '2024-12-01', null, 'EXPENSE', 13200000000, 'Pengeluaran Des');

INSERT INTO purchase_orders (id, uuid, po_number, pr_id, project_id, supplier_id, creator_id, total_amount, status) VALUES 
(1, '91e166c4-d73c-4f5a-86e4-a3e0b73265cf', 'PR-2024-001', null, 1, 1, 4, 48750000, 'Completed'),
(2, '2407f497-f9d4-44da-aaa6-c7f18eb9ea33', 'PR-2024-002', null, 3, 2, 4, 28000000, 'Waiting Approval'),
(3, 'c0d7e654-85ee-432e-82ea-0e10c327b68d', 'PR-2024-003', null, 2, 6, 4, 78125000, 'Approved'),
(4, 'e9bf6a70-9cb5-4fa3-b584-a0d02fe185e5', 'PR-2024-004', null, 1, 4, 4, 14300000, 'Draft'),
(5, 'fe5c6dd9-8028-443b-8abd-1769e23d4af6', 'PR-2024-005', null, 5, 7, 4, 10200000, 'Completed');

