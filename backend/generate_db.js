const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs'); // Assuming we want hashed passwords

async function generateDb() {
  const sourcePath = path.join(__dirname, '../database.sql');
  const targetPath = path.join(__dirname, '../database_seed.sql');

  let schema = fs.readFileSync(sourcePath, 'utf8');

  // Replace database name and add DROP DATABASE
  schema = schema.replace(
    /CREATE DATABASE IF NOT EXISTS construction_erp/g,
    'DROP DATABASE IF EXISTS erp_konstruksi;\nCREATE DATABASE erp_konstruksi'
  );
  schema = schema.replace(
    /USE construction_erp;/g,
    'USE erp_konstruksi;'
  );

  // Step 1: Add missing attributes (created_by, updated_by) to major tables.
  // We'll regex replace lines that have `created_at TIMESTAMP` to insert our new audit fields just before it.
  schema = schema.replace(
    /created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g,
    'created_by BIGINT UNSIGNED NULL,\n    updated_by BIGINT UNSIGNED NULL,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  );
  
  // Cleanup duplicates for rab_versions which already had created_by
  schema = schema.replace(
    /created_by BIGINT UNSIGNED NOT NULL,\r?\n\s*created_by BIGINT UNSIGNED NULL,/g,
    'created_by BIGINT UNSIGNED NOT NULL,'
  );

  // Step 2: Generate Dummy Data
  let inserts = `\n\n-- ==========================================================\n-- 10. DUMMY DATA SEEDING (Generated)\n-- ==========================================================\n\n`;

  // Helper for generating UUIDs
  const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

  // Users & Roles
  inserts += `INSERT INTO roles (id, name, portal_type, guard_name) VALUES \n`;
  inserts += `(1, 'Super Admin', 'Admin', 'web'),\n`;
  inserts += `(2, 'Owner', 'Owner', 'web'),\n`;
  inserts += `(3, 'Finance Manager', 'Finance', 'web'),\n`;
  inserts += `(4, 'Purchasing Staff', 'Purchasing', 'web'),\n`;
  inserts += `(5, 'Project Manager', 'PM', 'web'),\n`;
  inserts += `(6, 'Mandor Lapangan', 'Mandor', 'web');\n\n`;

  const passwordHash = await bcrypt.hash('password123', 10);
  
  inserts += `INSERT INTO users (id, name, email, password) VALUES \n`;
  inserts += `(1, 'Admin Utama', 'admin@constructerp.id', '${passwordHash}'),\n`;
  inserts += `(2, 'Bapak Owner', 'owner@constructerp.id', '${passwordHash}'),\n`;
  inserts += `(3, 'Ibu Finance', 'finance@constructerp.id', '${passwordHash}'),\n`;
  inserts += `(4, 'Budi Purchasing', 'purchasing@constructerp.id', '${passwordHash}'),\n`;
  inserts += `(5, 'Agus Project Manager', 'pm@constructerp.id', '${passwordHash}'),\n`;
  inserts += `(6, 'Joko Mandor', 'mandor@constructerp.id', '${passwordHash}');\n\n`;

  inserts += `INSERT INTO model_has_roles (role_id, model_type, model_id) VALUES \n`;
  inserts += `(1, 'App\\\\Models\\\\User', 1),\n`;
  inserts += `(2, 'App\\\\Models\\\\User', 2),\n`;
  inserts += `(3, 'App\\\\Models\\\\User', 3),\n`;
  inserts += `(4, 'App\\\\Models\\\\User', 4),\n`;
  inserts += `(5, 'App\\\\Models\\\\User', 5),\n`;
  inserts += `(6, 'App\\\\Models\\\\User', 6);\n\n`;

  // Companies
  inserts += `INSERT INTO companies (id, name, phone, email, address) VALUES \n`;
  inserts += `(1, 'PT. Konstruksi Maju Bersama', '021-5551234', 'info@konstruksimaju.co.id', 'Jl. Sudirman No. 123, Jakarta');\n\n`;

  // Cost Codes
  inserts += `INSERT INTO cost_codes (id, code, name, description) VALUES \n`;
  inserts += `(1, 'CC-001', 'Pekerjaan Persiapan', 'Biaya persiapan awal proyek'),\n`;
  inserts += `(2, 'CC-002', 'Pekerjaan Tanah', 'Biaya galian dan urugan'),\n`;
  inserts += `(3, 'CC-003', 'Pekerjaan Pondasi', 'Biaya pondasi dan sloof'),\n`;
  inserts += `(4, 'CC-004', 'Pekerjaan Beton', 'Biaya kolom, balok, dan plat'),\n`;
  inserts += `(5, 'CC-005', 'Pekerjaan Arsitektur', 'Biaya dinding, lantai, dan atap');\n\n`;

  // Material Categories
  inserts += `INSERT INTO material_categories (id, name) VALUES \n`;
  inserts += `(1, 'Semen & Mortar'),\n`;
  inserts += `(2, 'Pasir & Batu'),\n`;
  inserts += `(3, 'Besi & Baja'),\n`;
  inserts += `(4, 'Kayu & Bekisting'),\n`;
  inserts += `(5, 'Cat & Finishing');\n\n`;

  // Units
  inserts += `INSERT INTO units (id, code, name) VALUES \n`;
  inserts += `(1, 'ZAK', 'Zak (50kg)'),\n`;
  inserts += `(2, 'M3', 'Meter Kubik'),\n`;
  inserts += `(3, 'Btg', 'Batang'),\n`;
  inserts += `(4, 'M2', 'Meter Persegi'),\n`;
  inserts += `(5, 'Ltr', 'Liter'),\n`;
  inserts += `(6, 'Hari', 'Hari Kerja'),\n`;
  inserts += `(7, 'Jam', 'Jam Sewa'),\n`;
  inserts += `(8, 'Pcs', 'Pieces');\n\n`;

  // Materials (generate 15 items)
  inserts += `INSERT INTO materials (id, code, name, category_id, unit_id, purchase_price, selling_price, current_stock) VALUES \n`;
  for(let i=1; i<=15; i++) {
    const cat = (i % 5) + 1;
    const unit = (i % 5) + 1;
    const price = (Math.floor(Math.random() * 50) + 10) * 1000;
    inserts += `(${i}, 'MAT-${String(i).padStart(3, '0')}', 'Material Dummy ${i}', ${cat}, ${unit}, ${price}, ${price * 1.2}, ${Math.floor(Math.random()*100) + 20})${i === 15 ? ';' : ','}\n`;
  }
  inserts += `\n`;

  // Equipments (generate 5 items)
  inserts += `INSERT INTO equipments (id, code, name, unit_id, hourly_cost) VALUES \n`;
  for(let i=1; i<=5; i++) {
    const cost = (Math.floor(Math.random() * 100) + 50) * 1000;
    inserts += `(${i}, 'EQP-${String(i).padStart(3, '0')}', 'Equipment Dummy ${i}', 7, ${cost})${i === 5 ? ';' : ','}\n`;
  }
  inserts += `\n`;

  // Labors (generate 5 items)
  inserts += `INSERT INTO labors (id, position, daily_cost, hourly_cost) VALUES \n`;
  for(let i=1; i<=5; i++) {
    const cost = (Math.floor(Math.random() * 100) + 100) * 1000;
    inserts += `(${i}, 'Tukang Posisi ${i}', ${cost}, ${cost/8})${i === 5 ? ';' : ','}\n`;
  }
  inserts += `\n`;

  // AHSPs (generate 5 items)
  inserts += `INSERT INTO ahsps (id, code, name, unit_id, cost_code_id, total_cost) VALUES \n`;
  for(let i=1; i<=5; i++) {
    inserts += `(${i}, 'AHSP-${String(i).padStart(3, '0')}', 'Pekerjaan Analisa ${i}', 2, ${i}, ${Math.floor(Math.random() * 500) * 1000})${i === 5 ? ';' : ','}\n`;
  }
  inserts += `\n`;

  // Customers (generate 5)
  inserts += `INSERT INTO customers (id, name, company, email, phone) VALUES \n`;
  for(let i=1; i<=5; i++) {
    inserts += `(${i}, 'Customer Klien ${i}', 'PT Klien Sejahtera ${i}', 'klien${i}@example.com', '081234567${i}')${i === 5 ? ';' : ','}\n`;
  }
  inserts += `\n`;

  // Suppliers (generate 5)
  inserts += `INSERT INTO suppliers (id, name, contact_person, phone) VALUES \n`;
  for(let i=1; i<=5; i++) {
    inserts += `(${i}, 'Supplier Bahan ${i}', 'Bpk. Kontak ${i}', '089876543${i}')${i === 5 ? ';' : ','}\n`;
  }
  inserts += `\n`;

  // Projects (generate 5)
  inserts += `INSERT INTO projects (id, uuid, code, name, customer_id, manager_id, project_type, building_area, floor_count, material_class, worker_system, land_condition, contract_value, status) VALUES \n`;
  const types = ['Residential', 'Commercial', 'Warehouse', 'Factory', 'Infrastructure'];
  const pStatus = ['Planning', 'Running', 'Paused', 'Completed', 'Running'];
  for(let i=1; i<=5; i++) {
    const val = (Math.floor(Math.random() * 100) + 100) * 10000000; // 1M - 2M
    inserts += `(${i}, '${uuid()}', 'PRJ-2026-${String(i).padStart(3, '0')}', 'Proyek Pembangunan ${types[i-1]} ${i}', ${i}, 5, '${types[i-1]}', 150.5, 2, 'Standard', 'Contract', 'Empty', ${val}, '${pStatus[i-1]}')${i === 5 ? ';' : ','}\n`;
  }
  inserts += `\n`;

  // Project Members
  inserts += `INSERT INTO project_members (id, project_id, user_id, role) VALUES \n`;
  for(let i=1; i<=5; i++) {
    inserts += `(${i}, ${i}, 5, 'Project Manager'),\n`;
    inserts += `(${i+5}, ${i}, 6, 'Mandor')${i === 5 ? ';' : ','}\n`;
  }
  inserts += `\n`;

  // RABs (generate 1 per project)
  inserts += `INSERT INTO rabs (id, project_id, version, grand_total, is_active) VALUES \n`;
  for(let i=1; i<=5; i++) {
    const val = (Math.floor(Math.random() * 80) + 80) * 10000000;
    inserts += `(${i}, ${i}, 1, ${val}, 1)${i === 5 ? ';' : ','}\n`;
  }
  inserts += `\n`;

  // RAB Groups
  inserts += `INSERT INTO rab_groups (id, rab_id, cost_code_id, name, sort_order, total) VALUES \n`;
  for(let i=1; i<=5; i++) { // For project 1
    inserts += `(${i}, 1, ${i}, 'Grup Pekerjaan ${i}', ${i}, 10000000)${i === 5 ? ';' : ','}\n`;
  }
  inserts += `\n`;

  // Purchase Requests
  inserts += `INSERT INTO purchase_requests (id, uuid, pr_number, project_id, requester_id, request_date, status) VALUES \n`;
  for(let i=1; i<=5; i++) {
    inserts += `(${i}, '${uuid()}', 'PR-2026-${String(i).padStart(3, '0')}', ${i}, 5, '2026-07-0${i}', 'Approved')${i === 5 ? ';' : ','}\n`;
  }
  inserts += `\n`;

  // PR Items
  inserts += `INSERT INTO pr_items (id, pr_id, material_id, quantity) VALUES \n`;
  for(let i=1; i<=5; i++) {
    inserts += `(${i}, ${i}, ${i}, 100),\n`;
    inserts += `(${i+5}, ${i}, ${i+1}, 50)${i === 5 ? ';' : ','}\n`;
  }
  inserts += `\n`;

  // Purchase Orders
  inserts += `INSERT INTO purchase_orders (id, uuid, po_number, pr_id, project_id, supplier_id, creator_id, total_amount, status) VALUES \n`;
  for(let i=1; i<=5; i++) {
    inserts += `(${i}, '${uuid()}', 'PO-2026-${String(i).padStart(3, '0')}', ${i}, ${i}, ${i}, 4, 15000000, 'Approved')${i === 5 ? ';' : ','}\n`;
  }
  inserts += `\n`;

  // PO Items
  inserts += `INSERT INTO po_items (id, po_id, material_id, quantity, unit_price, total) VALUES \n`;
  for(let i=1; i<=5; i++) {
    inserts += `(${i}, ${i}, ${i}, 100, 100000, 10000000),\n`;
    inserts += `(${i+5}, ${i}, ${i+1}, 50, 100000, 5000000)${i === 5 ? ';' : ','}\n`;
  }
  inserts += `\n`;

  // Invoices
  inserts += `INSERT INTO invoices (id, uuid, invoice_number, project_id, termin_percentage, amount, due_date, status) VALUES \n`;
  for(let i=1; i<=5; i++) {
    inserts += `(${i}, '${uuid()}', 'INV-2026-${String(i).padStart(3, '0')}', ${i}, 20, 50000000, '2026-07-2${i}', 'Unpaid')${i === 5 ? ';' : ','}\n`;
  }
  inserts += `\n`;

  // Cashflows
  inserts += `INSERT INTO cashflows (id, uuid, transaction_date, cost_code_id, type, amount, description) VALUES \n`;
  for(let i=1; i<=5; i++) {
    inserts += `(${i}, '${uuid()}', '2026-07-0${i}', ${i}, 'EXPENSE', 10000000, 'Pembayaran material Proyek ${i}'),\n`;
    inserts += `(${i+5}, '${uuid()}', '2026-07-0${i}', ${i}, 'INCOME', 50000000, 'Penerimaan DP Proyek ${i}')${i === 5 ? ';' : ','}\n`;
  }
  inserts += `\n`;

  // Save the new schema with dummy data
  fs.writeFileSync(targetPath, schema + inserts, 'utf8');
  console.log('database_seed.sql generated successfully!');
}

generateDb().catch(console.error);
