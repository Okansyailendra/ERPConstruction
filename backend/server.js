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
      SELECT p.id as db_id, p.code as id, p.name, c.name as customer, c.company, p.project_type as type, 
             u.name as pm, p.contract_value as contractValue, p.contract_value as budget, 
             p.down_payment as dp, p.status, p.deadline_date as deadline, p.start_date as startDate,
             p.floor_count as floors, p.building_area as area, p.material_class as materialClass,
             p.worker_system as laborType
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN users u ON p.manager_id = u.id
    `;
    const [rows] = await db.query(query);
    
    // Map status from db to frontend expected
    const formattedRows = rows.map(r => {
      let st = 'on-track';
      if(r.status === 'Paused') st = 'delayed';
      if(r.status === 'Completed') st = 'completed';
      return { ...r, status: st, progress: Math.floor(Math.random() * 100) }; // Random progress since it's not stored yet
    });
    
    res.json(formattedRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET Materials
app.get('/api/materials', async (req, res) => {
  try {
    const query = `
      SELECT m.code, m.name, c.name as category, u.code as unit, 
             m.purchase_price as purchasePrice, m.selling_price as sellingPrice,
             m.current_stock as stock, m.min_stock as minStock,
             IF(m.current_stock = 0, 'out-of-stock', IF(m.current_stock <= m.min_stock, 'low-stock', 'active')) as status,
             (m.selling_price - m.purchase_price) / m.purchase_price * 100 as markup
      FROM materials m
      LEFT JOIN material_categories c ON m.category_id = c.id
      LEFT JOIN units u ON m.unit_id = u.id
    `;
    const [rows] = await db.query(query);
    const formatted = rows.map(r => ({ ...r, id: r.code }));
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
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

    // Get usage from material_usages joined with daily_reports
    const [usages] = await db.query(`
      SELECT m.name, SUM(mu.quantity_used) as used, 1000 as plan -- Mocking plan for now
      FROM material_usages mu
      JOIN daily_reports dr ON mu.report_id = dr.id
      JOIN materials m ON mu.material_id = m.id
      WHERE dr.project_id = ?
      GROUP BY m.id, m.name
    `, [project[0].id]);
    
    const formatted = usages.map(u => ({
      name: u.name,
      used: parseFloat(u.used) + ' pcs',
      plan: u.plan + ' pcs',
      pct: Math.min(Math.round((parseFloat(u.used) / u.plan) * 100), 100)
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/api/execution/:projectId/labor', async (req, res) => {
  try {
    const { projectId } = req.params;
    const [project] = await db.query('SELECT id FROM projects WHERE id = ? OR code = ? LIMIT 1', [projectId, projectId]);
    if (!project[0]) return res.json([]);

    const [reports] = await db.query('SELECT worker_count FROM daily_reports WHERE project_id = ? ORDER BY report_date DESC LIMIT 1', [project[0].id]);
    const count = reports.length > 0 ? reports[0].worker_count : 0;
    
    res.json([
      { role: "Pekerja Umum", today: count, plan: Math.max(count, 10) } // Mock plan
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
