const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// === MOCK DATA FROM FRONTEND ===
const mockProjects = [
  { id: "PRJ-001", name: "Gedung Perkantoran Sudirman", customer: "PT. Maju Jaya Properti", company: "PT. Maju Jaya Properti", type: "Commercial", pm: "Budi Santoso", budget: 15000000000, contractValue: 18000000000, dp: 3600000000, progress: 85, deadline: "2025-03-30", startDate: "2024-01-15", status: "on-track", location: "Jakarta Pusat", floors: 12, area: 4500, materialClass: "Premium", laborType: "Contract", materialCost: 8500000000, laborCost: 3200000000, equipmentCost: 800000000, operationalCost: 500000000 },
  { id: "PRJ-002", name: "Villa Residence Bali", customer: "Tn. Sanjaya Kumala", company: "Personal", type: "Residential", pm: "Andi Pratama", budget: 4500000000, contractValue: 5200000000, dp: 1040000000, progress: 62, deadline: "2025-06-15", startDate: "2024-03-01", status: "on-track", location: "Bali", floors: 2, area: 850, materialClass: "Standard", laborType: "Daily", materialCost: 2100000000, laborCost: 850000000, equipmentCost: 200000000, operationalCost: 150000000 },
  { id: "PRJ-003", name: "Mall Extension Kasablanka", customer: "PT. Lippo Mall", company: "PT. Lippo Mall Indonesia", type: "Commercial", pm: "Reza Firmansyah", budget: 42000000000, contractValue: 48500000000, dp: 9700000000, progress: 45, deadline: "2025-12-31", startDate: "2024-06-01", status: "at-risk", location: "Jakarta Selatan", floors: 5, area: 12000, materialClass: "Premium", laborType: "Contract", materialCost: 22000000000, laborCost: 8500000000, equipmentCost: 3200000000, operationalCost: 1800000000 },
  { id: "PRJ-004", name: "Renovasi RS Permata Indah", customer: "PT. Rumah Sakit Permata", company: "PT. Rumah Sakit Permata", type: "Renovation", pm: "Siti Nurhaliza", budget: 8200000000, contractValue: 9800000000, dp: 1960000000, progress: 20, deadline: "2025-09-30", startDate: "2024-08-15", status: "delayed", location: "Tangerang", floors: 4, area: 2200, materialClass: "Standard", laborType: "Daily", materialCost: 4200000000, laborCost: 1800000000, equipmentCost: 60000000, operationalCost: 400000000 },
  { id: "PRJ-005", name: "Apartemen Green Towers", customer: "PT. Green Property", company: "PT. Green Property Indonesia", type: "Residential", pm: "Fajar Nugroho", budget: 28000000000, contractValue: 32000000000, dp: 6400000000, progress: 91, deadline: "2024-12-31", startDate: "2023-09-01", status: "completed", location: "Depok", floors: 20, area: 8500, materialClass: "Standard", laborType: "Contract", materialCost: 14200000000, laborCost: 5800000000, equipmentCost: 1800000000, operationalCost: 900000000 }
];

const mockMaterials = [
  { id: "MAT-001", code: "BET-K300", name: "Beton K-300", category: "Struktur", unit: "m³", supplier: "PT. Holcim Indonesia", purchasePrice: 850000, markup: 15, sellingPrice: 977500, stock: 450, minStock: 100, status: "active" },
  { id: "MAT-002", code: "BJ-D13", name: "Besi Beton D13", category: "Struktur", unit: "kg", supplier: "PT. Krakatau Steel", purchasePrice: 12500, markup: 12, sellingPrice: 14000, stock: 8500, minStock: 2000, status: "active" },
  { id: "MAT-003", code: "BTT-MERAH", name: "Batu Bata Merah", category: "Dinding", unit: "buah", supplier: "CV. Bata Jaya", purchasePrice: 800, markup: 20, sellingPrice: 960, stock: 25000, minStock: 5000, status: "active" },
  { id: "MAT-004", code: "SEM-50KG", name: "Semen Portland 50kg", category: "Material", unit: "sak", supplier: "PT. Semen Indonesia", purchasePrice: 65000, markup: 10, sellingPrice: 71500, stock: 350, minStock: 100, status: "active" },
  { id: "MAT-005", code: "PASIR-HLR", name: "Pasir Halus", category: "Material", unit: "m³", supplier: "CV. Pasir Sejati", purchasePrice: 185000, markup: 18, sellingPrice: 218300, stock: 80, minStock: 30, status: "low-stock" },
  { id: "MAT-006", code: "KRM-60X60", name: "Keramik 60x60 Polished", category: "Finishing", unit: "m²", supplier: "PT. Roman Ceramik", purchasePrice: 125000, markup: 25, sellingPrice: 156250, stock: 0, minStock: 200, status: "out-of-stock" },
  { id: "MAT-007", code: "CAT-EKST", name: "Cat Eksterior Weathershield", category: "Finishing", unit: "liter", supplier: "PT. Nippon Paint", purchasePrice: 85000, markup: 20, sellingPrice: 102000, stock: 120, minStock: 50, status: "active" },
  { id: "MAT-008", code: "PL-PVC-4IN", name: "Pipa PVC 4 inch", category: "MEP", unit: "batang", supplier: "PT. Wavin", purchasePrice: 55000, markup: 15, sellingPrice: 63250, stock: 200, minStock: 50, status: "active" }
];

const mockInvoices = [
  { id: "INV-2024-001", project: "Gedung Perkantoran Sudirman", customer: "PT. Maju Jaya Properti", amount: 3600000000, issueDate: "2024-10-01", dueDate: "2024-10-31", status: "paid", term: "DP 20%" },
  { id: "INV-2024-002", project: "Villa Residence Bali", customer: "Tn. Sanjaya Kumala", amount: 1040000000, issueDate: "2024-10-15", dueDate: "2024-11-14", status: "paid", term: "DP 20%" },
  { id: "INV-2024-003", project: "Mall Extension Kasablanka", customer: "PT. Lippo Mall", amount: 9700000000, issueDate: "2024-11-01", dueDate: "2024-11-30", status: "pending", term: "DP 20%" },
  { id: "INV-2024-004", project: "Gedung Perkantoran Sudirman", customer: "PT. Maju Jaya Properti", amount: 4500000000, issueDate: "2024-09-01", dueDate: "2024-09-30", status: "overdue", term: "Termin 50%" },
  { id: "INV-2024-005", project: "Apartemen Green Towers", customer: "PT. Green Property", amount: 6400000000, issueDate: "2024-11-15", dueDate: "2024-12-15", status: "pending", term: "Termin 80%" }
];

const mockCashflow = [
  { month: "Jun", income: 8500000000, expense: 5200000000, balance: 3300000000 },
  { month: "Jul", income: 12200000000, expense: 7800000000, balance: 4400000000 },
  { month: "Aug", income: 9800000000, expense: 6500000000, balance: 3300000000 },
  { month: "Sep", income: 15600000000, expense: 9200000000, balance: 6400000000 },
  { month: "Okt", income: 18900000000, expense: 11500000000, balance: 7400000000 },
  { month: "Nov", income: 14200000000, expense: 8800000000, balance: 5400000000 },
  { month: "Des", income: 22500000000, expense: 13200000000, balance: 9300000000 }
];

const mockPurchases = [
  { id: "PR-2024-001", material: "Beton K-300", qty: 50, unit: "m³", supplier: "PT. Holcim Indonesia", total: 48750000, status: "delivered", approval: "approved", deliveryDate: "2024-11-15", project: "PRJ-001", requestDate: "2024-11-10" },
  { id: "PR-2024-002", material: "Besi Beton D13", qty: 2000, unit: "kg", supplier: "PT. Krakatau Steel", total: 28000000, status: "pending-approval", approval: "pending", deliveryDate: "2024-11-25", project: "PRJ-003", requestDate: "2024-11-18" },
  { id: "PR-2024-003", material: "Keramik 60x60", qty: 500, unit: "m²", supplier: "PT. Roman Ceramik", total: 78125000, status: "ordered", approval: "approved", deliveryDate: "2024-12-05", project: "PRJ-002", requestDate: "2024-11-20" },
  { id: "PR-2024-004", material: "Semen Portland", qty: 200, unit: "sak", supplier: "PT. Semen Indonesia", total: 14300000, status: "request", approval: "pending", deliveryDate: "2024-11-30", project: "PRJ-001", requestDate: "2024-11-22" },
  { id: "PR-2024-005", material: "Cat Eksterior", qty: 100, unit: "liter", supplier: "PT. Nippon Paint", total: 10200000, status: "received", approval: "approved", deliveryDate: "2024-11-20", project: "PRJ-005", requestDate: "2024-11-08" }
];

async function generateDb() {
  const sourcePath = path.join(__dirname, '../database.sql');
  const targetPath = path.join(__dirname, '../database_seed.sql');

  let schema = fs.readFileSync(sourcePath, 'utf8');

  // Replace DB Name and handle Drops
  schema = schema.replace(
    /CREATE DATABASE IF NOT EXISTS construction_erp/g,
    'DROP DATABASE IF EXISTS erp_konstruksi;\nCREATE DATABASE erp_konstruksi'
  );
  schema = schema.replace(/USE construction_erp;/g, 'USE erp_konstruksi;');

  // Add missing attributes
  schema = schema.replace(
    /created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g,
    'created_by BIGINT UNSIGNED NULL,\n    updated_by BIGINT UNSIGNED NULL,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  );
  
  // Cleanup duplicates for rab_versions which already had created_by
  schema = schema.replace(
    /created_by BIGINT UNSIGNED NOT NULL,\r?\n\s*created_by BIGINT UNSIGNED NULL,/g,
    'created_by BIGINT UNSIGNED NOT NULL,'
  );

  let inserts = `\n\n-- ==========================================================\n-- 10. DUMMY DATA SEEDING (FROM MOCK DATA)\n-- ==========================================================\n\n`;

  const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  
  // ROLES & USERS
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

  // MAP UNIQUE PM NAMES TO NEW USERS
  const pmNames = [...new Set(mockProjects.map(p => p.pm))];
  let nextUserId = 7;
  pmNames.forEach(pm => {
    if (pm !== 'Agus Project Manager') {
      const safeEmail = pm.toLowerCase().replace(/\\s+/g, '') + '@constructerp.id';
      inserts += `INSERT INTO users (id, name, email, password) VALUES (${nextUserId}, '${pm}', '${safeEmail}', '${passwordHash}');\n`;
      inserts += `INSERT INTO model_has_roles (role_id, model_type, model_id) VALUES (5, 'App\\\\Models\\\\User', ${nextUserId});\n`;
      nextUserId++;
    }
  });
  inserts += `\n`;

  // CUSTOMERS
  const customers = [...new Set(mockProjects.map(p => p.customer))];
  let customerMap = {};
  inserts += `INSERT INTO customers (id, name, company, email, phone) VALUES \n`;
  customers.forEach((cust, idx) => {
    const proj = mockProjects.find(p => p.customer === cust);
    customerMap[cust] = idx + 1;
    inserts += `(${idx + 1}, '${cust}', '${proj.company}', 'customer${idx+1}@example.com', '08120000${idx}')${idx === customers.length - 1 ? ';' : ','}\n`;
  });
  inserts += `\n`;

  // PROJECTS
  inserts += `INSERT INTO projects (id, uuid, code, name, customer_id, manager_id, project_type, building_area, floor_count, material_class, worker_system, land_condition, contract_value, status) VALUES \n`;
  mockProjects.forEach((p, idx) => {
    // We map manager_id by trying to match name in the users table, but let's just do it directly:
    // since PMs were inserted starting from 7 (if not Agus)
    const custId = customerMap[p.customer];
    let mgrId = 5;
    if (p.pm !== 'Agus Project Manager') {
      mgrId = pmNames.indexOf(p.pm) + 7;
    }
    
    // Status mapping: on-track -> Running, at-risk -> Running, delayed -> Paused, completed -> Completed
    let status = 'Running';
    if(p.status === 'delayed') status = 'Paused';
    if(p.status === 'completed') status = 'Completed';
    
    inserts += `(${idx + 1}, '${uuid()}', '${p.id}', '${p.name}', ${custId}, ${mgrId}, '${p.type}', ${p.area}, ${p.floors}, '${p.materialClass}', '${p.laborType}', 'Empty', ${p.contractValue}, '${status}')${idx === mockProjects.length - 1 ? ';' : ','}\n`;
  });
  inserts += `\n`;
  
  // SUPPLIERS
  const suppliers = [...new Set(mockMaterials.map(m => m.supplier))];
  let supplierMap = {};
  inserts += `INSERT INTO suppliers (id, name, contact_person, phone) VALUES \n`;
  suppliers.forEach((s, idx) => {
    supplierMap[s] = idx + 1;
    inserts += `(${idx + 1}, '${s}', 'Contact ${s}', '08111100${idx}')${idx === suppliers.length - 1 ? ';' : ','}\n`;
  });
  inserts += `\n`;

  // MATERIAL CATEGORIES & UNITS
  inserts += `INSERT INTO material_categories (id, name) VALUES (1, 'Struktur'), (2, 'Dinding'), (3, 'Material'), (4, 'Finishing'), (5, 'MEP');\n`;
  inserts += `INSERT INTO units (id, code, name) VALUES (1, 'm3', 'Meter Kubik'), (2, 'kg', 'Kilogram'), (3, 'buah', 'Buah'), (4, 'sak', 'Sak'), (5, 'm2', 'Meter Persegi'), (6, 'liter', 'Liter'), (7, 'batang', 'Batang');\n\n`;

  const unitMap = { 'm³': 1, 'kg': 2, 'buah': 3, 'sak': 4, 'm²': 5, 'liter': 6, 'batang': 7 };
  const catMap = { 'Struktur': 1, 'Dinding': 2, 'Material': 3, 'Finishing': 4, 'MEP': 5 };

  // MATERIALS
  inserts += `INSERT INTO materials (id, code, name, category_id, unit_id, purchase_price, selling_price, current_stock) VALUES \n`;
  mockMaterials.forEach((m, idx) => {
    inserts += `(${idx + 1}, '${m.id}', '${m.name}', ${catMap[m.category]}, ${unitMap[m.unit]}, ${m.purchasePrice}, ${m.sellingPrice}, ${m.stock})${idx === mockMaterials.length - 1 ? ';' : ','}\n`;
  });
  inserts += `\n`;

  // INVOICES
  inserts += `INSERT INTO invoices (id, uuid, invoice_number, project_id, termin_percentage, amount, due_date, status) VALUES \n`;
  mockInvoices.forEach((inv, idx) => {
    const projIdx = mockProjects.findIndex(p => p.name === inv.project);
    const projId = projIdx >= 0 ? projIdx + 1 : 1;
    let st = 'Unpaid';
    if(inv.status === 'paid') st = 'Paid';
    if(inv.status === 'pending') st = 'Unpaid';
    if(inv.status === 'overdue') st = 'Overdue';
    
    inserts += `(${idx + 1}, '${uuid()}', '${inv.id}', ${projId}, 0, ${inv.amount}, '${inv.dueDate}', '${st}')${idx === mockInvoices.length - 1 ? ';' : ','}\n`;
  });
  inserts += `\n`;

  // CASHFLOWS
  inserts += `INSERT INTO cashflows (id, uuid, transaction_date, cost_code_id, type, amount, description) VALUES \n`;
  mockCashflow.forEach((cf, idx) => {
    // using month as dummy date 2024-xx-01
    const m = idx + 6; // Jun is 6
    const date = `2024-${m < 10 ? '0'+m : m}-01`;
    inserts += `(${idx*2 + 1}, '${uuid()}', '${date}', null, 'INCOME', ${cf.income}, 'Pendapatan ${cf.month}'),\n`;
    inserts += `(${idx*2 + 2}, '${uuid()}', '${date}', null, 'EXPENSE', ${cf.expense}, 'Pengeluaran ${cf.month}')${idx === mockCashflow.length - 1 ? ';' : ','}\n`;
  });
  inserts += `\n`;
  
  // PO (Purchases)
  inserts += `INSERT INTO purchase_orders (id, uuid, po_number, pr_id, project_id, supplier_id, creator_id, total_amount, status) VALUES \n`;
  mockPurchases.forEach((po, idx) => {
    const projIdx = mockProjects.findIndex(p => p.id === po.project);
    const projId = projIdx >= 0 ? projIdx + 1 : 1;
    const supId = supplierMap[po.supplier] || 1;
    let st = 'Draft';
    if(po.status === 'delivered' || po.status === 'received') st = 'Completed';
    if(po.status === 'ordered') st = 'Approved';
    if(po.status === 'pending-approval') st = 'Waiting Approval';
    
    inserts += `(${idx + 1}, '${uuid()}', '${po.id}', null, ${projId}, ${supId}, 4, ${po.total}, '${st}')${idx === mockPurchases.length - 1 ? ';' : ','}\n`;
  });
  inserts += `\n`;

  fs.writeFileSync(targetPath, schema + inserts, 'utf8');
  console.log('database_seed.sql generated successfully with EXACT mock data!');
}

generateDb().catch(console.error);
