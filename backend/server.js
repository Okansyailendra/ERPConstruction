const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');
require('dotenv').config();
const crypto = require('crypto');
const { sendResetEmail } = require('./mailer');

const app = express();

app.use(cors());
app.use(express.json());

// Auth endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const [rows] = await db.query(
      'SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ? OR u.username = ?',
      [username, username]
    );

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

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role_name.toLowerCase().includes('owner') ? 'owner' : 
              user.role_name.toLowerCase().includes('finance') ? 'finance' :
              user.role_name.toLowerCase().includes('purchasing') ? 'purchasing' :
              user.role_name.toLowerCase().includes('project manager') ? 'pm' : 'mandor',
        avatar: user.full_name.split(' ').map(n => n[0]).join('').substring(0,2)
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
