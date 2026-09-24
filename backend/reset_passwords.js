const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function resetPasswords() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
    database: 'erp_konstruksi'
  });

  const hash = await bcrypt.hash('password123', 10);
  console.log('New hash:', hash);

  // Verify hash works
  const verify = await bcrypt.compare('password123', hash);
  console.log('Verification:', verify);

  await connection.execute('UPDATE users SET password = ?', [hash]);
  console.log('All passwords updated to: password123');

  await connection.end();
}

resetPasswords().catch(console.error);
