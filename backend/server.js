const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
require('dotenv').config();
const crypto = require('crypto');
const { sendResetEmail } = require('./mailer');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Auth endpoint
app.post('/api/login', async (req, res) => {
  console.log('Login attempt for:', req.body.username);
  const { username, password } = req.body;
  
  try {
    const [rows] = await db.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       LEFT JOIN model_has_roles mhr ON u.id = mhr.model_id 
       LEFT JOIN roles r ON mhr.role_id = r.id 
       WHERE u.email = ?`,
      [username]
    );

    console.log('User found in DB:', rows.length > 0 ? rows[0].email : 'Not found');

    if (rows.length === 0) {
      return res.status(401).json({ message: 'User tidak ditemukan' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password salah' });
    }

    // Don't send password hash back to client
    delete user.password;

    const roleName = user.role_name ? user.role_name.toLowerCase() : '';

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleName.includes('owner') ? 'owner' : 
              roleName.includes('finance') ? 'finance' :
              roleName.includes('purchasing') ? 'purchasing' :
              roleName.includes('project manager') ? 'pm' : 
              roleName.includes('admin') ? 'owner' : 'mandor',
        avatar: user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// Forgot Password endpoint
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      // Return success anyway to prevent email enumeration
      return res.json({ success: true, message: 'Jika email terdaftar, instruksi reset telah dikirim.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    
    // Delete existing tokens for this email
    await db.query('DELETE FROM password_resets WHERE email = ?', [email]);
    
    // Insert new token
    await db.query('INSERT INTO password_resets (email, token) VALUES (?, ?)', [email, token]);

    // Send email
    const previewUrl = await sendResetEmail(email, token);

    res.json({ 
      success: true, 
      message: 'Instruksi reset password telah dikirim ke email Anda.',
      previewUrl // Only for development/testing
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// Reset Password endpoint
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  try {
    // Note: in a real app, check expiration time too. Here we keep it simple.
    const [rows] = await db.query('SELECT * FROM password_resets WHERE token = ?', [token]);
    
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Token reset password tidak valid atau sudah kadaluarsa.' });
    }
    
    const email = rows[0].email;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
    
    // Delete token
    await db.query('DELETE FROM password_resets WHERE email = ?', [email]);
    
    res.json({ success: true, message: 'Password berhasil direset. Silakan login dengan password baru Anda.' });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// --- NEW DATA ENDPOINTS ---

// GET Projects
app.get('/api/projects', async (req, res) => {
  try {
    const query = `
      SELECT p.id as db_id, p.code as id, p.name, c.name as customer, c.company, c.email, c.phone, p.project_type as type, 
             u.name as pm, p.contract_value as contractValue, p.contract_value as budget, 
             p.down_payment as dp, p.status, p.deadline_date as deadline, p.start_date as startDate,
             p.floor_count as floors, p.building_area as area, p.material_class as materialClass,
             p.worker_system as laborType, p.project_address as location, p.land_condition as locationCondition,
             p.payment_scheme, p.scopes, p.uploaded_files
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN users u ON p.manager_id = u.id
    `;
    const [rows] = await db.query(query);
    
    // Map status from db to frontend expected
    const formattedRows = rows.map(r => {
      let st = 'Planning';
      if(r.status === 'Running') st = 'active';
      if(r.status === 'Paused') st = 'On Hold';
      if(r.status === 'Completed') st = 'completed';
      
      const formatDate = (d) => {
        if (!d) return '';
        const date = new Date(d);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      };

      return { 
        ...r, 
        status: st, 
        progress: Math.floor(Math.random() * 100),
        startDate: formatDate(r.startDate),
        deadline: formatDate(r.deadline),
        paymentScheme: r.payment_scheme ? JSON.parse(r.payment_scheme) : [],
        scopes: r.scopes ? JSON.parse(r.scopes) : [],
        uploadedFiles: r.uploaded_files ? JSON.parse(r.uploaded_files) : {}
      };
    });
    
    res.json(formattedRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST Project
app.post('/api/projects', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const data = req.body;
    
    // Generate Code
    const code = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Handle Customer
    let customerId = 1; // Default fallback
    if (data.customer) {
      const [customers] = await connection.query('SELECT id FROM customers WHERE name = ?', [data.customer]);
      if (customers.length > 0) {
        customerId = customers[0].id;
        if (data.email || data.phone) {
          await connection.query('UPDATE customers SET email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE id = ?', [data.email || null, data.phone || null, customerId]);
        }
      } else {
        const [res] = await connection.query('INSERT INTO customers (name, company, email, phone) VALUES (?, ?, ?, ?)', [data.customer, data.company || '', data.email || '', data.phone || '']);
        customerId = res.insertId;
      }
    }
    
    // Handle PM (Manager)
    let managerId = 5; // Default PM (Agus)
    if (data.pm) {
      const [users] = await connection.query('SELECT id FROM users WHERE name = ?', [data.pm]);
      if (users.length > 0) managerId = users[0].id;
    }

    // Insert Project
    const query = `
      INSERT INTO projects (
        uuid, code, name, customer_id, manager_id, project_type, contract_value, 
        down_payment, status, deadline_date, start_date, floor_count, 
        building_area, material_class, worker_system, land_condition, project_address,
        payment_scheme, scopes, uploaded_files
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    let dbStatus = 'Planning';
    if(data.status === 'active') dbStatus = 'Running';
    else if(data.status === 'On Hold') dbStatus = 'Paused';

    await connection.query(query, [
      crypto.randomUUID(),
      code,
      data.name || 'Proyek Baru',
      customerId,
      managerId,
      data.type || 'Commercial',
      data.contractValue || 0,
      data.dp || 0,
      dbStatus,
      data.deadline || null,
      data.startDate || null,
      data.floors || 1,
      data.area || 0,
      data.materialClass || 'Standard',
      data.laborType || 'Contract',
      data.locationCondition || 'Empty',
      data.location || '',
      JSON.stringify(data.paymentScheme || []),
      JSON.stringify(data.scopes || []),
      JSON.stringify(data.uploadedFiles || {})
    ]);
    
    await connection.commit();
    res.json({ success: true, message: 'Project created successfully', code });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    connection.release();
  }
});

// PUT Project
app.put('/api/projects/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params; // this is the code (e.g. PRJ-XXX)
    const data = req.body;
    
    // Verify project exists
    const [projs] = await connection.query('SELECT id FROM projects WHERE code = ?', [id]);
    if (projs.length === 0) return res.status(404).json({ message: 'Project not found' });
    const projectId = projs[0].id;

    // Handle Customer
    let customerId = null;
    if (data.customer) {
      const [customers] = await connection.query('SELECT id FROM customers WHERE name = ?', [data.customer]);
      if (customers.length > 0) {
        customerId = customers[0].id;
        if (data.email || data.phone) {
          await connection.query('UPDATE customers SET email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE id = ?', [data.email || null, data.phone || null, customerId]);
        }
      } else {
        const [insertRes] = await connection.query('INSERT INTO customers (name, company, email, phone) VALUES (?, ?, ?, ?)', [data.customer, data.company || '', data.email || '', data.phone || '']);
        customerId = insertRes.insertId;
      }
    }
    
    // Handle PM (Manager)
    let managerId = null;
    if (data.pm) {
      const [users] = await connection.query('SELECT id FROM users WHERE name = ?', [data.pm]);
      if (users.length > 0) managerId = users[0].id;
    }

    let dbStatus = 'Planning';
    if(data.status === 'active') dbStatus = 'Running';
    else if(data.status === 'On Hold') dbStatus = 'Paused';
    else if(data.status === 'completed') dbStatus = 'Completed';
    else if(data.status === 'delayed') dbStatus = 'Paused';

    const updates = [];
    const values = [];

    if(data.name) { updates.push('name = ?'); values.push(data.name); }
    if(customerId) { updates.push('customer_id = ?'); values.push(customerId); }
    if(managerId) { updates.push('manager_id = ?'); values.push(managerId); }
    if(data.type) { updates.push('project_type = ?'); values.push(data.type); }
    if(data.contractValue !== undefined) { updates.push('contract_value = ?'); values.push(data.contractValue); }
    if(data.dp !== undefined) { updates.push('down_payment = ?'); values.push(data.dp); }
    if(dbStatus) { updates.push('status = ?'); values.push(dbStatus); }
    if(data.deadline) { updates.push('deadline_date = ?'); values.push(data.deadline); }
    if(data.startDate) { updates.push('start_date = ?'); values.push(data.startDate); }
    if(data.floors !== undefined) { updates.push('floor_count = ?'); values.push(data.floors); }
    if(data.area !== undefined) { updates.push('building_area = ?'); values.push(data.area); }
    if(data.materialClass) { updates.push('material_class = ?'); values.push(data.materialClass); }
    if(data.laborType) { updates.push('worker_system = ?'); values.push(data.laborType); }
    if(data.locationCondition) { updates.push('land_condition = ?'); values.push(data.locationCondition); }
    if(data.location) { updates.push('project_address = ?'); values.push(data.location); }
    if(data.paymentScheme) { updates.push('payment_scheme = ?'); values.push(JSON.stringify(data.paymentScheme)); }
    if(data.scopes) { updates.push('scopes = ?'); values.push(JSON.stringify(data.scopes)); }
    if(data.uploadedFiles) { updates.push('uploaded_files = ?'); values.push(JSON.stringify(data.uploadedFiles)); }

    if (updates.length > 0) {
       values.push(projectId);
       await connection.query(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, values);
    }
    
    await connection.commit();
    res.json({ success: true, message: 'Project updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    connection.release();
  }
});

// GET Materials
app.get('/api/materials', async (req, res) => {
  try {
    const query = `
      SELECT m.code, m.name, c.name as category, u.code as unit, 
             s.name as supplier,
             m.purchase_price as purchasePrice, m.selling_price as sellingPrice,
             m.current_stock as stock, m.min_stock as minStock,
             IF(m.current_stock = 0, 'out-of-stock', IF(m.current_stock <= m.min_stock, 'low-stock', 'active')) as status,
             (m.selling_price - m.purchase_price) / m.purchase_price * 100 as markup
      FROM materials m
      LEFT JOIN material_categories c ON m.category_id = c.id
      LEFT JOIN units u ON m.unit_id = u.id
      LEFT JOIN suppliers s ON m.supplier_id = s.id
    `;
    const [rows] = await db.query(query);
    const formatted = rows.map(r => ({ ...r, id: r.code }));
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST Material
app.post('/api/materials', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const data = req.body;
    
    let categoryId = 1;
    if (data.category) {
      const [cats] = await connection.query('SELECT id FROM material_categories WHERE name = ?', [data.category]);
      if (cats.length > 0) categoryId = cats[0].id;
      else {
        const [insertCat] = await connection.query('INSERT INTO material_categories (name) VALUES (?)', [data.category]);
        categoryId = insertCat.insertId;
      }
    }
    
    let unitId = 1;
    if (data.unit) {
      const [units] = await connection.query('SELECT id FROM units WHERE code = ? OR name = ?', [data.unit, data.unit]);
      if (units.length > 0) unitId = units[0].id;
      else {
        const [insertUnit] = await connection.query('INSERT INTO units (code, name) VALUES (?, ?)', [data.unit, data.unit]);
        unitId = insertUnit.insertId;
      }
    }

    let supplierId = null;
    if (data.supplier && data.supplier !== "-") {
      const [supps] = await connection.query('SELECT id FROM suppliers WHERE name = ?', [data.supplier]);
      if (supps.length > 0) supplierId = supps[0].id;
      else {
        const [insertSupp] = await connection.query('INSERT INTO suppliers (name) VALUES (?)', [data.supplier]);
        supplierId = insertSupp.insertId;
      }
    }

    await connection.query(`
      INSERT INTO materials (code, name, category_id, unit_id, supplier_id, purchase_price, selling_price, current_stock, min_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.code, 
      data.name, 
      categoryId, 
      unitId, 
      supplierId,
      data.purchasePrice || 0, 
      data.sellingPrice || 0, 
      data.stock || 0,
      data.minStock || 0
    ]);

    await connection.commit();
    res.json({ success: true, message: 'Material created successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    connection.release();
  }
});

// PUT Material
app.put('/api/materials/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const data = req.body;
    
    const [mats] = await connection.query('SELECT id FROM materials WHERE code = ?', [id]);
    if (mats.length === 0) return res.status(404).json({ message: 'Material not found' });
    const materialId = mats[0].id;

    let categoryId = null;
    if (data.category) {
      const [cats] = await connection.query('SELECT id FROM material_categories WHERE name = ?', [data.category]);
      if (cats.length > 0) categoryId = cats[0].id;
      else {
        const [insertCat] = await connection.query('INSERT INTO material_categories (name) VALUES (?)', [data.category]);
        categoryId = insertCat.insertId;
      }
    }
    
    let unitId = null;
    if (data.unit) {
      const [units] = await connection.query('SELECT id FROM units WHERE code = ? OR name = ?', [data.unit, data.unit]);
      if (units.length > 0) unitId = units[0].id;
      else {
        const [insertUnit] = await connection.query('INSERT INTO units (code, name) VALUES (?, ?)', [data.unit, data.unit]);
        unitId = insertUnit.insertId;
      }
    }

    let supplierId = null;
    if (data.supplier && data.supplier !== "-") {
      const [supps] = await connection.query('SELECT id FROM suppliers WHERE name = ?', [data.supplier]);
      if (supps.length > 0) supplierId = supps[0].id;
      else {
        const [insertSupp] = await connection.query('INSERT INTO suppliers (name) VALUES (?)', [data.supplier]);
        supplierId = insertSupp.insertId;
      }
    }

    const updates = [];
    const values = [];

    if(data.code) { updates.push('code = ?'); values.push(data.code); }
    if(data.name) { updates.push('name = ?'); values.push(data.name); }
    if(categoryId) { updates.push('category_id = ?'); values.push(categoryId); }
    if(unitId) { updates.push('unit_id = ?'); values.push(unitId); }
    if(supplierId !== null) { updates.push('supplier_id = ?'); values.push(supplierId); }
    if(data.purchasePrice !== undefined) { updates.push('purchase_price = ?'); values.push(data.purchasePrice); }
    if(data.sellingPrice !== undefined) { updates.push('selling_price = ?'); values.push(data.sellingPrice); }
    if(data.stock !== undefined) { updates.push('current_stock = ?'); values.push(data.stock); }
    if(data.minStock !== undefined) { updates.push('min_stock = ?'); values.push(data.minStock); }

    if (updates.length > 0) {
       values.push(materialId);
       await connection.query(`UPDATE materials SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    await connection.commit();
    res.json({ success: true, message: 'Material updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    connection.release();
  }
});

// DELETE Material
app.delete('/api/materials/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    
    const [mats] = await connection.query('SELECT id FROM materials WHERE code = ?', [id]);
    if (mats.length === 0) return res.status(404).json({ message: 'Material not found' });
    const materialId = mats[0].id;
    
    await connection.query('DELETE FROM po_items WHERE material_id = ?', [materialId]);
    await connection.query('DELETE FROM ahsp_materials WHERE material_id = ?', [materialId]);
    await connection.query('DELETE FROM materials WHERE id = ?', [materialId]);
    
    await connection.commit();
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    connection.release();
  }
});

// DELETE Project
app.delete('/api/projects/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    
    // First, find the internal ID
    const [projs] = await connection.query('SELECT id FROM projects WHERE code = ?', [id]);
    if (projs.length === 0) return res.status(404).json({ message: 'Project not found' });
    const projId = projs[0].id;

    // Delete child rows to prevent foreign key constraint errors
    await connection.query('DELETE FROM media_attachments WHERE model_type = "Project" AND model_id = ?', [projId]);
    await connection.query('DELETE FROM project_progress WHERE project_id = ?', [projId]);
    await connection.query('DELETE FROM invoices WHERE project_id = ?', [projId]);
    
    // Delete rab items and rabs
    const [rabs] = await connection.query('SELECT id FROM rabs WHERE project_id = ?', [projId]);
    for (const rab of rabs) {
       await connection.query('DELETE FROM rab_items WHERE rab_id = ?', [rab.id]);
       await connection.query('DELETE FROM rab_groups WHERE rab_id = ?', [rab.id]);
    }
    await connection.query('DELETE FROM rabs WHERE project_id = ?', [projId]);

    // Delete PO items and POs
    const [pos] = await connection.query('SELECT id FROM purchase_orders WHERE project_id = ?', [projId]);
    for (const po of pos) {
       await connection.query('DELETE FROM po_items WHERE po_id = ?', [po.id]);
    }
    await connection.query('DELETE FROM purchase_orders WHERE project_id = ?', [projId]);

    // Finally delete the project
    await connection.query('DELETE FROM projects WHERE id = ?', [projId]);

    await connection.commit();
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    connection.release();
  }
});

// GET Invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const query = `
      SELECT i.invoice_number as id, p.name as project, c.name as customer, 
             i.amount, DATE_FORMAT(i.created_at, '%Y-%m-%d') as issueDate, 
             DATE_FORMAT(i.due_date, '%Y-%m-%d') as dueDate, i.status, 'Termin' as term
      FROM invoices i
      JOIN projects p ON i.project_id = p.id
      JOIN customers c ON p.customer_id = c.id
    `;
    const [rows] = await db.query(query);
    const formatted = rows.map(r => {
      let st = 'pending';
      if(r.status === 'Paid') st = 'paid';
      if(r.status === 'Overdue') st = 'overdue';
      return { ...r, status: st };
    });
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST Create Invoice
app.post('/api/invoices', async (req, res) => {
  try {
    const { project_id, amount, due_date } = req.body;
    
    // Generate Invoice Number (e.g., INV-2026-4091)
    const year = new Date().getFullYear();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const invoice_number = `INV-${year}-${randomCode}`;

    await db.query(`
      INSERT INTO invoices (project_id, invoice_number, amount, due_date, status)
      VALUES (?, ?, ?, ?, 'Pending')
    `, [project_id, invoice_number, amount, due_date]);

    res.json({ success: true, message: 'Invoice created successfully', invoice_number });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST Upload Invoice Payment Proof
app.post('/api/invoices/:id/pay', upload.single('proof'), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params; 
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const [invs] = await connection.query('SELECT id FROM invoices WHERE invoice_number = ?', [id]);
    if (invs.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Invoice not found' });
    }
    const invId = invs[0].id;

    await connection.query(`
      INSERT INTO media_attachments (uploader_id, model_type, model_id, document_type, file_name, file_path, file_type)
      VALUES (1, 'Invoice', ?, 'Payment Proof', ?, ?, ?)
    `, [
      invId, 
      req.file.originalname, 
      req.file.path.replace(/\\/g, '/'), 
      req.file.mimetype
    ]);

    await connection.query('UPDATE invoices SET status = "Paid" WHERE id = ?', [invId]);

    await connection.commit();
    res.json({ success: true, message: 'Payment proof uploaded and status updated to Paid' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    connection.release();
  }
});

// GET Cashflow
app.get('/api/cashflows', async (req, res) => {
  try {
    // Basic aggregation by month
    const query = `
      SELECT DATE_FORMAT(transaction_date, '%b') as month,
             SUM(CASE WHEN type='INCOME' THEN amount ELSE 0 END) as income,
             SUM(CASE WHEN type='EXPENSE' THEN amount ELSE 0 END) as expense
      FROM cashflows
      GROUP BY month, MONTH(transaction_date)
      ORDER BY MONTH(transaction_date)
    `;
    const [rows] = await db.query(query);
    
    let balance = 0;
    const formatted = rows.map(r => {
      balance = parseInt(r.income) - parseInt(r.expense);
      return { month: r.month, income: parseInt(r.income), expense: parseInt(r.expense), balance: balance };
    });
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET Recent Activities (Owner Dashboard)
app.get('/api/activities', async (req, res) => {
  try {
    const query = `
      SELECT 'invoice' as source, invoice_number as reference, created_at, status as detail 
      FROM invoices
      UNION ALL
      SELECT 'purchase' as source, po_number as reference, created_at, status as detail 
      FROM purchase_orders
      UNION ALL
      SELECT 'photo' as source, file_name as reference, created_at, document_type as detail 
      FROM media_attachments WHERE model_type = 'Project'
      ORDER BY created_at DESC
      LIMIT 6
    `;
    const [rows] = await db.query(query);
    
    const formatted = rows.map(r => {
       const date = new Date(r.created_at);
       const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
       
       let event = '';
       let type = 'info';
       
       if (r.source === 'invoice') {
         event = `Invoice ${r.reference} (${r.detail}) ditambahkan`;
         type = 'success';
       } else if (r.source === 'purchase') {
         event = `Purchase Request ${r.reference} berstatus ${r.detail}`;
         type = 'warning';
       } else if (r.source === 'photo') {
         event = `Foto progress proyek diunggah`;
         type = 'info';
       }

       return { time, event, type };
    });
    
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET Purchases
app.get('/api/purchases', async (req, res) => {
  try {
    const query = `
      SELECT po.po_number as id, m.name as material, pi.quantity as qty, u.code as unit,
             s.name as supplier, po.total_amount as total, po.status, 'pending' as approval,
             DATE_FORMAT(po.created_at, '%Y-%m-%d') as requestDate,
             DATE_FORMAT(po.created_at, '%Y-%m-%d') as deliveryDate,
             p.code as project
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN projects p ON po.project_id = p.id
      LEFT JOIN po_items pi ON pi.po_id = po.id
      LEFT JOIN materials m ON pi.material_id = m.id
      LEFT JOIN units u ON m.unit_id = u.id
      ORDER BY po.created_at DESC
    `;
    const [rows] = await db.query(query);
    const formatted = rows.map(r => {
      let st = 'request';
      if(r.status === 'Waiting Approval') st = 'pending-approval';
      if(r.status === 'Approved') st = 'ordered';
      if(r.status === 'Completed') st = 'delivered';
      return { ...r, status: st };
    });
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET Suppliers
app.get('/api/suppliers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM suppliers');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST Purchase Request
app.post('/api/purchases', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { projectId, supplierId, materialCode, qty, price } = req.body;

    // Generate PO Number
    const poNumber = 'PR-' + Date.now().toString().slice(-6);
    const total = parseFloat(qty) * parseFloat(price);

    // Insert PO Header
    const [poResult] = await connection.query(
      `INSERT INTO purchase_orders (uuid, po_number, project_id, supplier_id, creator_id, total_amount, status)
       VALUES (UUID(), ?, ?, ?, 1, ?, 'Draft')`,
      [poNumber, projectId, supplierId, total]
    );

    const poId = poResult.insertId;

    // Get material ID from code
    let materialId = null;
    const [mats] = await connection.query('SELECT id FROM materials WHERE code = ? LIMIT 1', [materialCode]);
    if (mats.length > 0) materialId = mats[0].id;

    // Insert PO Item
    if (materialId) {
      await connection.query(
        `INSERT INTO po_items (po_id, material_id, quantity, unit_price, total)
         VALUES (?, ?, ?, ?, ?)`,
        [poId, materialId, qty, price, total]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Purchase Request created' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    connection.release();
  }
});

// UPDATE Purchase Status
app.put('/api/purchases/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    let dbStatus = 'Draft';
    if (status === 'pending-approval') dbStatus = 'Waiting Approval';
    if (status === 'ordered') dbStatus = 'Approved';
    if (status === 'received' || status === 'delivered') dbStatus = 'Completed';
    
    await db.query('UPDATE purchase_orders SET status = ? WHERE po_number = ?', [dbStatus, id]);
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE Purchase
app.delete('/api/purchases/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    
    const [po] = await connection.query('SELECT id FROM purchase_orders WHERE po_number = ?', [id]);
    if (po.length > 0) {
      await connection.query('DELETE FROM po_items WHERE po_id = ?', [po[0].id]);
      await connection.query('DELETE FROM purchase_orders WHERE id = ?', [po[0].id]);
    }
    
    await connection.commit();
    res.json({ success: true, message: 'Purchase deleted' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    connection.release();
  }
});

// GET AHSP (nested with materials, labors, equipments)
app.get('/api/ahsps', async (req, res) => {
  try {
    const queryAHSP = `
      SELECT a.id, a.code, a.name, u.code as unit, a.total_cost
      FROM ahsps a
      LEFT JOIN units u ON a.unit_id = u.id
    `;
    const [ahsps] = await db.query(queryAHSP);

    const queryMaterials = `
      SELECT am.ahsp_id, m.name, u.code as unit, am.coefficient, m.purchase_price as price
      FROM ahsp_materials am
      JOIN materials m ON am.material_id = m.id
      LEFT JOIN units u ON m.unit_id = u.id
    `;
    const [materials] = await db.query(queryMaterials);

    const queryLabors = `
      SELECT al.ahsp_id, l.position as name, 'OH' as unit, al.coefficient, l.daily_cost as price
      FROM ahsp_labors al
      JOIN labors l ON al.labor_id = l.id
    `;
    const [labors] = await db.query(queryLabors);

    const queryEq = `
      SELECT ae.ahsp_id, e.name, u.code as unit, ae.coefficient, e.hourly_cost as price
      FROM ahsp_equipments ae
      JOIN equipments e ON ae.equipment_id = e.id
      LEFT JOIN units u ON e.unit_id = u.id
    `;
    const [equipments] = await db.query(queryEq);

    const formatted = ahsps.map(a => ({
      id: a.code, // Frontend uses code as ID currently
      db_id: a.id,
      code: a.code,
      name: a.name,
      unit: a.unit,
      unitPrice: a.total_cost,
      materials: materials.filter(m => m.ahsp_id === a.id),
      labor: labors.filter(l => l.ahsp_id === a.id),
      equipment: equipments.filter(e => e.ahsp_id === a.id)
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST AHSP
app.post('/api/ahsps', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const data = req.body;
    
    let unitId = 1;
    if (data.unit) {
      const [units] = await connection.query('SELECT id FROM units WHERE code = ? OR name = ?', [data.unit, data.unit]);
      if (units.length > 0) unitId = units[0].id;
      else {
        const [insertUnit] = await connection.query('INSERT INTO units (code, name) VALUES (?, ?)', [data.unit, data.unit]);
        unitId = insertUnit.insertId;
      }
    }

    const [insertAhsp] = await connection.query(`
      INSERT INTO ahsps (code, name, unit_id, total_cost) VALUES (?, ?, ?, ?)
    `, [data.code, data.name, unitId, data.unitPrice || 0]);
    
    const ahspId = insertAhsp.insertId;

    if (data.materials && Array.isArray(data.materials)) {
      for (const m of data.materials) {
        let matId = null;
        const [mats] = await connection.query('SELECT id FROM materials WHERE name = ?', [m.item]);
        if(mats.length > 0) matId = mats[0].id;
        else {
           const [ins] = await connection.query('INSERT INTO materials (code, name) VALUES (?, ?)', [`MAT-${Date.now()}-${Math.floor(Math.random()*100)}`, m.item]);
           matId = ins.insertId;
        }
        await connection.query('INSERT INTO ahsp_materials (ahsp_id, material_id, coefficient, subtotal) VALUES (?, ?, ?, ?)', 
          [ahspId, matId, m.coefficient, Number(m.coefficient) * Number(m.price)]);
      }
    }

    if (data.labor && Array.isArray(data.labor)) {
      for (const l of data.labor) {
        let labId = null;
        const [labs] = await connection.query('SELECT id FROM labors WHERE position = ?', [l.item]);
        if(labs.length > 0) labId = labs[0].id;
        else {
           const [ins] = await connection.query('INSERT INTO labors (code, position, daily_cost) VALUES (?, ?, ?)', [`LAB-${Date.now()}-${Math.floor(Math.random()*100)}`, l.item, l.price]);
           labId = ins.insertId;
        }
        await connection.query('INSERT INTO ahsp_labors (ahsp_id, labor_id, coefficient, subtotal) VALUES (?, ?, ?, ?)', 
          [ahspId, labId, l.coefficient, Number(l.coefficient) * Number(l.price)]);
      }
    }

    if (data.equipment && Array.isArray(data.equipment)) {
      for (const e of data.equipment) {
        let eqId = null;
        const [eqs] = await connection.query('SELECT id FROM equipments WHERE name = ?', [e.item]);
        if(eqs.length > 0) eqId = eqs[0].id;
        else {
           const [ins] = await connection.query('INSERT INTO equipments (code, name, hourly_cost) VALUES (?, ?, ?)', [`EQ-${Date.now()}-${Math.floor(Math.random()*100)}`, e.item, e.price]);
           eqId = ins.insertId;
        }
        await connection.query('INSERT INTO ahsp_equipments (ahsp_id, equipment_id, coefficient, subtotal) VALUES (?, ?, ?, ?)', 
          [ahspId, eqId, e.coefficient, Number(e.coefficient) * Number(e.price)]);
      }
    }

    await connection.commit();
    res.json({ success: true, message: 'AHSP created successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    connection.release();
  }
});

// PUT AHSP
app.put('/api/ahsps/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params; // this is the code
    const data = req.body;
    
    const [ahsps] = await connection.query('SELECT id FROM ahsps WHERE code = ?', [id]);
    if(ahsps.length === 0) return res.status(404).json({ message: 'AHSP not found' });
    const ahspId = ahsps[0].id;

    let unitId = null;
    if (data.unit) {
      const [units] = await connection.query('SELECT id FROM units WHERE code = ? OR name = ?', [data.unit, data.unit]);
      if (units.length > 0) unitId = units[0].id;
      else {
        const [insertUnit] = await connection.query('INSERT INTO units (code, name) VALUES (?, ?)', [data.unit, data.unit]);
        unitId = insertUnit.insertId;
      }
    }

    const updates = [];
    const values = [];
    if(data.code) { updates.push('code = ?'); values.push(data.code); }
    if(data.name) { updates.push('name = ?'); values.push(data.name); }
    if(unitId) { updates.push('unit_id = ?'); values.push(unitId); }
    if(data.unitPrice !== undefined) { updates.push('total_cost = ?'); values.push(data.unitPrice); }

    if (updates.length > 0) {
      values.push(ahspId);
      await connection.query(`UPDATE ahsps SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    await connection.query('DELETE FROM ahsp_materials WHERE ahsp_id = ?', [ahspId]);
    await connection.query('DELETE FROM ahsp_labors WHERE ahsp_id = ?', [ahspId]);
    await connection.query('DELETE FROM ahsp_equipments WHERE ahsp_id = ?', [ahspId]);

    if (data.materials && Array.isArray(data.materials)) {
      for (const m of data.materials) {
        let matId = null;
        const [mats] = await connection.query('SELECT id FROM materials WHERE name = ?', [m.item]);
        if(mats.length > 0) matId = mats[0].id;
        else {
           const [ins] = await connection.query('INSERT INTO materials (code, name) VALUES (?, ?)', [`MAT-${Date.now()}-${Math.floor(Math.random()*100)}`, m.item]);
           matId = ins.insertId;
        }
        await connection.query('INSERT INTO ahsp_materials (ahsp_id, material_id, coefficient, subtotal) VALUES (?, ?, ?, ?)', 
          [ahspId, matId, m.coefficient, Number(m.coefficient) * Number(m.price)]);
      }
    }

    if (data.labor && Array.isArray(data.labor)) {
      for (const l of data.labor) {
        let labId = null;
        const [labs] = await connection.query('SELECT id FROM labors WHERE position = ?', [l.item]);
        if(labs.length > 0) labId = labs[0].id;
        else {
           const [ins] = await connection.query('INSERT INTO labors (code, position, daily_cost) VALUES (?, ?, ?)', [`LAB-${Date.now()}-${Math.floor(Math.random()*100)}`, l.item, l.price]);
           labId = ins.insertId;
        }
        await connection.query('INSERT INTO ahsp_labors (ahsp_id, labor_id, coefficient, subtotal) VALUES (?, ?, ?, ?)', 
          [ahspId, labId, l.coefficient, Number(l.coefficient) * Number(l.price)]);
      }
    }

    if (data.equipment && Array.isArray(data.equipment)) {
      for (const e of data.equipment) {
        let eqId = null;
        const [eqs] = await connection.query('SELECT id FROM equipments WHERE name = ?', [e.item]);
        if(eqs.length > 0) eqId = eqs[0].id;
        else {
           const [ins] = await connection.query('INSERT INTO equipments (code, name, hourly_cost) VALUES (?, ?, ?)', [`EQ-${Date.now()}-${Math.floor(Math.random()*100)}`, e.item, e.price]);
           eqId = ins.insertId;
        }
        await connection.query('INSERT INTO ahsp_equipments (ahsp_id, equipment_id, coefficient, subtotal) VALUES (?, ?, ?, ?)', 
          [ahspId, eqId, e.coefficient, Number(e.coefficient) * Number(e.price)]);
      }
    }

    await connection.commit();
    res.json({ success: true, message: 'AHSP updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    connection.release();
  }
});

// DELETE AHSP
app.delete('/api/ahsps/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    
    const [ahsps] = await connection.query('SELECT id FROM ahsps WHERE code = ?', [id]);
    if(ahsps.length === 0) return res.status(404).json({ message: 'AHSP not found' });
    const ahspId = ahsps[0].id;

    await connection.query('DELETE FROM ahsp_materials WHERE ahsp_id = ?', [ahspId]);
    await connection.query('DELETE FROM ahsp_labors WHERE ahsp_id = ?', [ahspId]);
    await connection.query('DELETE FROM ahsp_equipments WHERE ahsp_id = ?', [ahspId]);
    await connection.query('DELETE FROM ahsps WHERE id = ?', [ahspId]);
    
    await connection.commit();
    res.json({ success: true, message: 'AHSP deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    connection.release();
  }
});

// --- USER MANAGEMENT ENDPOINTS ---

// GET Users
app.get('/api/users', async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.name, u.email, u.status, u.last_login as lastLogin, r.name as role
      FROM users u
      LEFT JOIN model_has_roles mhr ON u.id = mhr.model_id AND mhr.model_type = 'App\\\\Models\\\\User'
      LEFT JOIN roles r ON mhr.role_id = r.id
    `;
    const [users] = await db.query(query);
    
    const formatted = users.map(u => ({
      ...u,
      id: \`USR-\${u.id.toString().padStart(3, '0')}\`,
      db_id: u.id,
      role: u.role ? u.role.toLowerCase() : 'pm',
      lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Belum pernah login'
    }));
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST User
app.post('/api/users', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const data = req.body;
    
    const passwordHash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; 
    
    const [insUser] = await connection.query(`
      INSERT INTO users (name, email, password, status) VALUES (?, ?, ?, ?)
    `, [data.name, data.email, passwordHash, data.status || 'active']);
    
    const userId = insUser.insertId;

    if (data.role) {
       let roleId = null;
       const [roles] = await connection.query('SELECT id FROM roles WHERE name LIKE ?', [\`%\${data.role}%\`]);
       if(roles.length > 0) roleId = roles[0].id;
       else {
         const [insRole] = await connection.query('INSERT INTO roles (name, guard_name) VALUES (?, ?)', [data.role, 'web']);
         roleId = insRole.insertId;
       }
       await connection.query('INSERT INTO model_has_roles (role_id, model_type, model_id) VALUES (?, ?, ?)', [roleId, 'App\\\\Models\\\\User', userId]);
    }
    
    await connection.commit();
    res.json({ success: true, message: 'User created' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    connection.release();
  }
});

// PUT User
app.put('/api/users/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const idParam = req.params.id;
    const dbId = parseInt(idParam.replace('USR-', ''), 10);
    const data = req.body;
    
    await connection.query('UPDATE users SET name = ?, email = ?, status = ? WHERE id = ?', 
      [data.name, data.email, data.status, dbId]);
      
    if (data.role) {
       await connection.query('DELETE FROM model_has_roles WHERE model_id = ? AND model_type = ?', [dbId, 'App\\\\Models\\\\User']);
       let roleId = null;
       const [roles] = await connection.query('SELECT id FROM roles WHERE name LIKE ?', [\`%\${data.role}%\`]);
       if(roles.length > 0) roleId = roles[0].id;
       else {
         const [insRole] = await connection.query('INSERT INTO roles (name, guard_name) VALUES (?, ?)', [data.role, 'web']);
         roleId = insRole.insertId;
       }
       await connection.query('INSERT INTO model_has_roles (role_id, model_type, model_id) VALUES (?, ?, ?)', [roleId, 'App\\\\Models\\\\User', dbId]);
    }
    
    await connection.commit();
    res.json({ success: true, message: 'User updated' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    connection.release();
  }
});

// DELETE User
app.delete('/api/users/:id', async (req, res) => {
  try {
    const idParam = req.params.id;
    const dbId = parseInt(idParam.replace('USR-', ''), 10);
    
    await db.query('DELETE FROM model_has_roles WHERE model_id = ? AND model_type = ?', [dbId, 'App\\\\Models\\\\User']);
    await db.query('DELETE FROM users WHERE id = ?', [dbId]);
    
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- SETTINGS ENDPOINTS ---

app.get('/api/settings', async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM company_settings LIMIT 1');
    if (settings.length > 0) res.json(settings[0]);
    else res.json({});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const data = req.body;
    const [settings] = await db.query('SELECT id FROM company_settings LIMIT 1');
    if (settings.length > 0) {
      await db.query('UPDATE company_settings SET company_name = ?, npwp = ?, address = ?, email = ?, phone = ? WHERE id = ?', 
        [data.company_name, data.npwp, data.address, data.email, data.phone, settings[0].id]);
    } else {
      await db.query('INSERT INTO company_settings (company_name, npwp, address, email, phone) VALUES (?, ?, ?, ?, ?)', 
        [data.company_name, data.npwp, data.address, data.email, data.phone]);
    }
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET RAB
app.get('/api/rabs', async (req, res) => {
  try {
    const projectId = req.query.projectId || 1; 
    const queryGroups = `
      SELECT id, name
      FROM rab_groups
      WHERE rab_id = (SELECT id FROM rabs WHERE project_id = ? AND is_active = 1 LIMIT 1)
      ORDER BY sort_order ASC
    `;
    const [groups] = await db.query(queryGroups, [projectId]);

    const queryItems = `
      SELECT ri.id, ri.group_id, ri.description as workItem, u.code as unit, ri.volume as qty, 
             ri.unit_price as unitPrice, ri.subtotal, ri.margin_percentage as markup, ri.total
      FROM rab_items ri
      LEFT JOIN units u ON ri.unit_id = u.id
      WHERE ri.group_id IN (SELECT id FROM rab_groups WHERE rab_id = (SELECT id FROM rabs WHERE project_id = ? AND is_active = 1 LIMIT 1))
      ORDER BY ri.sort_order ASC
    `;
    const [items] = await db.query(queryItems, [projectId]);

    const formattedList = [];
    groups.forEach(g => {
      // Add header item
      formattedList.push({
        id: `header-${g.id}`,
        isHeader: true,
        workItem: g.name,
        qty: 0,
        unit: '',
        unitPrice: 0,
        subtotal: 0,
        markup: 0,
        total: 0
      });
      // Add children items
      const children = items.filter(i => i.group_id === g.id);
      children.forEach(c => {
        formattedList.push({
          id: c.id,
          isHeader: false,
          workItem: c.workItem,
          qty: parseFloat(c.qty),
          unit: c.unit,
          unitPrice: parseFloat(c.unitPrice),
          subtotal: parseFloat(c.subtotal),
          markup: parseFloat(c.markup),
          total: parseFloat(c.total)
        });
      });
    });

    res.json(formattedList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
app.post('/api/execution/:projectId/progress', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { reportDate, progress, milestone, description } = req.body;
    
    const [project] = await db.query('SELECT id FROM projects WHERE id = ? OR code = ? LIMIT 1', [projectId, projectId]);
    if (!project[0]) return res.status(404).json({ message: 'Project not found' });

    await db.query(`
      INSERT INTO project_progress (project_id, reporter_id, report_date, progress_percentage, milestone_name, description, status)
      VALUES (?, 1, ?, ?, ?, ?, 'Approved')
    `, [project[0].id, reportDate, progress, milestone || null, description]);

    res.json({ success: true, message: 'Progress uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/api/execution/:projectId/overview', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Project Details
    const [projects] = await db.query(`
      SELECT p.id as db_id, p.code as id, p.name, c.name as customer, c.company, p.project_type as type, 
             u.name as pm, p.contract_value as contractValue, p.contract_value as budget, 
             p.status, DATE_FORMAT(p.deadline_date, '%Y-%m-%d') as deadline, DATE_FORMAT(p.start_date, '%Y-%m-%d') as startDate,
             p.floor_count as floors, p.building_area as area, p.material_class as materialClass,
             p.worker_system as laborType
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN users u ON p.manager_id = u.id
      WHERE p.id = ? OR p.code = ? LIMIT 1
    `, [projectId, projectId]);

    if (projects.length === 0) return res.status(404).json({ message: 'Project not found' });
    const project = projects[0];

    // Get latest progress
    const [progresses] = await db.query('SELECT progress_percentage FROM project_progress WHERE project_id = ? ORDER BY report_date DESC LIMIT 1', [project.db_id]);
    project.progress = progresses.length > 0 ? parseFloat(progresses[0].progress_percentage) : 0;
    
    // Status mapping
    let st = 'on-track';
    if(project.status === 'Paused') st = 'delayed';
    if(project.status === 'Completed') st = 'completed';
    project.status = st;

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/api/execution/:projectId/timelines', async (req, res) => {
  try {
    const { projectId } = req.params;
    const [project] = await db.query('SELECT id FROM projects WHERE id = ? OR code = ? LIMIT 1', [projectId, projectId]);
    if (!project[0]) return res.json([]);

    const [timelines] = await db.query(`
      SELECT id, title as task, 'Umum' as category, 'PM' as assignee, status, 
             DATE_FORMAT(start_date, '%Y-%m-%d') as date, 
             CASE WHEN status = 'Completed' THEN 100 WHEN status = 'In Progress' THEN 50 ELSE 0 END as progress
      FROM project_timelines 
      WHERE project_id = ?
      ORDER BY start_date ASC
    `, [project[0].id]);
    
    // Map status for frontend
    const formatted = timelines.map(t => {
      let st = 'pending';
      if(t.status === 'In Progress') st = 'in-progress';
      if(t.status === 'Completed') st = 'completed';
      return { ...t, status: st };
    });
    
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/api/execution/:projectId/materials', async (req, res) => {
  try {
    const { projectId } = req.params;
    const [project] = await db.query('SELECT id FROM projects WHERE id = ? OR code = ? LIMIT 1', [projectId, projectId]);
    if (!project[0]) return res.json([]);
    const pId = project[0].id;

    // Get planned materials from Purchase Orders
    const [plans] = await db.query(`
      SELECT m.id, m.name, SUM(pi.quantity) as plan
      FROM po_items pi
      JOIN purchase_orders po ON pi.po_id = po.id
      JOIN materials m ON pi.material_id = m.id
      WHERE po.project_id = ? AND po.status IN ('Approved', 'Completed')
      GROUP BY m.id, m.name
    `, [pId]);

    // Get usage from material_usages joined with daily_reports
    const [usages] = await db.query(`
      SELECT m.id, m.name, SUM(mu.quantity_used) as used
      FROM material_usages mu
      JOIN daily_reports dr ON mu.report_id = dr.id
      JOIN materials m ON mu.material_id = m.id
      WHERE dr.project_id = ?
      GROUP BY m.id, m.name
    `, [pId]);

    const matMap = {};
    
    plans.forEach(p => {
      matMap[p.id] = { name: p.name, used: 0, plan: parseFloat(p.plan) || 0 };
    });

    usages.forEach(u => {
      if (matMap[u.id]) {
        matMap[u.id].used = parseFloat(u.used) || 0;
      } else {
        matMap[u.id] = { name: u.name, used: parseFloat(u.used) || 0, plan: 0 };
      }
    });

    const formatted = Object.values(matMap).map(m => {
      const planVal = m.plan > 0 ? m.plan : (m.used > 0 ? m.used : 1);
      return {
        name: m.name,
        used: m.used + ' pcs',
        plan: m.plan + ' pcs',
        pct: Math.min(Math.round((m.used / planVal) * 100), 100)
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/api/execution/:projectId/labor', async (req, res) => {
  try {
    const { projectId } = req.params;
    const [project] = await db.query('SELECT id, building_area FROM projects WHERE id = ? OR code = ? LIMIT 1', [projectId, projectId]);
    if (!project[0]) return res.json([]);

    const pId = project[0].id;
    const area = parseFloat(project[0].building_area) || 100;
    
    // Heuristic: 1 worker per 15 m2 of building area
    const plannedWorkers = Math.max(Math.ceil(area / 15), 5);

    const [reports] = await db.query('SELECT worker_count FROM daily_reports WHERE project_id = ? ORDER BY report_date DESC LIMIT 1', [pId]);
    const count = reports.length > 0 ? reports[0].worker_count : 0;
    
    res.json([
      { role: "Pekerja Umum", today: count, plan: plannedWorkers }
    ]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
app.get('/api/execution/:projectId/photos', async (req, res) => {
  try {
    const { projectId } = req.params;
    const [project] = await db.query('SELECT id FROM projects WHERE id = ? OR code = ? LIMIT 1', [projectId, projectId]);
    if (!project[0]) return res.json([]);

    const [photos] = await db.query(`
      SELECT id, file_name as title, DATE_FORMAT(created_at, '%d %b %Y') as date, 
             'Lapangan' as area, file_path
      FROM media_attachments 
      WHERE model_type = 'Project' AND model_id = ? AND document_type = 'Photo'
      ORDER BY created_at DESC
    `, [project[0].id]);
    
    // Prefix the file_path with backend URL if needed, but relative should work if proxied
    const formatted = photos.map(p => ({
      id: p.id,
      title: p.title,
      date: p.date,
      area: p.area,
      url: `http://localhost:5000/${p.file_path}`
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/api/execution/:projectId/photos', upload.single('photo'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, area } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No photo uploaded' });
    }

    const [project] = await db.query('SELECT id FROM projects WHERE id = ? OR code = ? LIMIT 1', [projectId, projectId]);
    if (!project[0]) {
      // clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Project not found' });
    }

    // Insert into media_attachments
    await db.query(`
      INSERT INTO media_attachments (uploader_id, model_type, model_id, document_type, file_name, file_path, file_type)
      VALUES (1, 'Project', ?, 'Photo', ?, ?, ?)
    `, [
      project[0].id, 
      title || req.file.originalname, 
      req.file.path.replace(/\\/g, '/'), 
      req.file.mimetype
    ]);

    res.json({ success: true, message: 'Photo uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.delete('/api/execution/:projectId/photos/:photoId', async (req, res) => {
  try {
    const { projectId, photoId } = req.params;
    
    // Check if photo exists
    const [photos] = await db.query('SELECT file_path FROM media_attachments WHERE id = ? AND model_type = "Project"', [photoId]);
    if (photos.length === 0) return res.status(404).json({ message: 'Photo not found' });
    
    // Delete file from disk
    const filePath = path.join(__dirname, photos[0].file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from DB
    await db.query('DELETE FROM media_attachments WHERE id = ?', [photoId]);
    
    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT RAB (save changes / sync)
app.put('/api/rabs', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { items, projectId } = req.body;
    
    if (!projectId) {
      throw new Error('projectId is required');
    }

    // 1. Ensure RAB exists for the project
    let rabId;
    const [existingRabs] = await connection.query('SELECT id FROM rabs WHERE project_id = ? AND is_active = 1 LIMIT 1', [projectId]);
    if (existingRabs.length > 0) {
      rabId = existingRabs[0].id;
    } else {
      const [insertRabResult] = await connection.query('INSERT INTO rabs (project_id, version, grand_total, is_active) VALUES (?, 1, 0, 1)', [projectId]);
      rabId = insertRabResult.insertId;
    }

    // 2. Loop through flat items array to sync Groups and Items
    let currentGroupId = null;
    let groupSortOrder = 0;
    let itemSortOrder = 0;

    for (const item of items) {
      if (item.isHeader) {
        // It's a Group
        groupSortOrder++;
        itemSortOrder = 0; // reset for new group
        if (typeof item.id === 'string' && item.id.startsWith('new-group-')) {
          // Create new group
          const [resGroup] = await connection.query(
            'INSERT INTO rab_groups (rab_id, name, sort_order) VALUES (?, ?, ?)',
            [rabId, item.workItem, groupSortOrder]
          );
          currentGroupId = resGroup.insertId;
          item.actualId = currentGroupId; // for reference if needed
        } else {
          // Update existing group
          currentGroupId = parseInt(String(item.id).replace('header-', ''), 10);
          await connection.query(
            'UPDATE rab_groups SET name = ?, sort_order = ? WHERE id = ? AND rab_id = ?',
            [item.workItem, groupSortOrder, currentGroupId, rabId]
          );
        }
      } else {
        // It's an Item
        itemSortOrder++;
        if (!currentGroupId) continue; // safety check

        // Ensure we have a valid unit_id. If unit is missing, we use a default or null if allowed. 
        // For simplicity, let's assume unit_id = 1 if not found.
        let unitId = 1; 
        if (item.unit) {
          const [uRes] = await connection.query('SELECT id FROM units WHERE code = ? LIMIT 1', [item.unit]);
          if(uRes.length > 0) unitId = uRes[0].id;
        }

        if (typeof item.id === 'string' && item.id.startsWith('new-item-')) {
          // Insert new item
          await connection.query(
            `INSERT INTO rab_items (group_id, description, volume, unit_id, unit_price, subtotal, margin_percentage, total, sort_order) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [currentGroupId, item.workItem, item.qty, unitId, item.unitPrice, item.subtotal, item.markup, item.total, itemSortOrder]
          );
        } else {
          // Update existing item
          await connection.query(
            `UPDATE rab_items 
             SET volume = ?, unit_price = ?, subtotal = ?, margin_percentage = ?, total = ?, sort_order = ?
             WHERE id = ?`,
            [item.qty, item.unitPrice, item.subtotal, item.markup, item.total, itemSortOrder, item.id]
          );
        }
      }
    }

    // Update grand total in rabs table
    await connection.query(`
      UPDATE rabs 
      SET grand_total = (
        SELECT COALESCE(SUM(rab_items.total), 0) 
        FROM rab_items 
        JOIN rab_groups ON rab_items.group_id = rab_groups.id 
        WHERE rab_groups.rab_id = rabs.id
      ) 
      WHERE id = ?`, [rabId]
    );

    await connection.commit();
    res.json({ success: true, message: 'RAB saved successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    connection.release();
  }
});

// POST Generate RAB (Mock AI)
app.post('/api/rabs/generate', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { projectId, parameters } = req.body; // projectId is the PRJ-XYZ code
    
    // Find internal ID
    const [projs] = await connection.query('SELECT id, contract_value, building_area, floor_count FROM projects WHERE code = ?', [projectId]);
    if (projs.length === 0) return res.status(404).json({ message: 'Project not found' });
    const internalProjectId = projs[0].id;
    const contractVal = parseFloat(projs[0].contract_value) || 120000000;
    const buildingArea = parseFloat(projs[0].building_area) || 100;

    // Soft delete/deactivate existing rabs for this project
    await connection.query('UPDATE rabs SET is_active = 0 WHERE project_id = ?', [internalProjectId]);
    
    // Insert new RAB version
    const [rabRes] = await connection.query('INSERT INTO rabs (project_id, version, grand_total, is_active) VALUES (?, 1, ?, 1)', [internalProjectId, contractVal * 0.8]);
    const rabId = rabRes.insertId;

    // Dummy Groups and Items
    const groups = [
      { name: "Pekerjaan Persiapan", items: [
          { name: "Pembersihan Lahan", unit: "m2", qty: buildingArea, price: 15000 },
          { name: "Pemasangan Bowplank", unit: "m'", qty: 50, price: 45000 }
      ]},
      { name: "Pekerjaan Struktur", items: [
          { name: "Galian Tanah Pondasi", unit: "m3", qty: 45, price: 85000 },
          { name: "Beton Bertulang K-225", unit: "m3", qty: 25, price: 1250000 },
          { name: "Pembesian", unit: "kg", qty: 1200, price: 18500 }
      ]},
      { name: "Pekerjaan Arsitektur", items: [
          { name: "Pasangan Bata Merah", unit: "m2", qty: buildingArea * 1.5, price: 135000 },
          { name: "Plesteran & Acian", unit: "m2", qty: buildingArea * 3, price: 65000 },
          { name: "Pengecatan Dinding", unit: "m2", qty: buildingArea * 3, price: 35000 }
      ]}
    ];

    let groupOrder = 1;
    for (const group of groups) {
      const [gRes] = await connection.query('INSERT INTO rab_groups (rab_id, name, sort_order) VALUES (?, ?, ?)', [rabId, group.name, groupOrder++]);
      const groupId = gRes.insertId;
      
      let itemOrder = 1;
      for (const item of group.items) {
        let unitId = 1;
        const [uRes] = await connection.query('SELECT id FROM units WHERE code = ? LIMIT 1', [item.unit]);
        if(uRes.length > 0) unitId = uRes[0].id;

        const subtotal = item.qty * item.price;
        const margin = 10;
        const total = subtotal * (1 + margin / 100);

        await connection.query(`
          INSERT INTO rab_items (group_id, description, volume, unit_id, unit_price, subtotal, margin_percentage, total, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [groupId, item.name, item.qty, unitId, item.price, subtotal, margin, total, itemOrder++]);
      }
    }

    // Update grand total in rabs table
    await connection.query(`
      UPDATE rabs 
      SET grand_total = (
        SELECT COALESCE(SUM(rab_items.total), 0) 
        FROM rab_items 
        JOIN rab_groups ON rab_items.group_id = rab_groups.id 
        WHERE rab_groups.rab_id = rabs.id
      ) 
      WHERE id = ?`, [rabId]
    );

    await connection.commit();
    res.json({ success: true, message: 'RAB generated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error generating RAB' });
  } finally {
    connection.release();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
