const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
    database: 'erp_konstruksi'
  });

  const users = [
    { role_id: 1, full_name: 'Ahmad Fauzi', username: 'owner', email: 'owner@constructerp.id', password: 'password123' },
    { role_id: 2, full_name: 'Dewi Rahayu', username: 'finance', email: 'finance@constructerp.id', password: 'password123' },
    { role_id: 3, full_name: 'Hendra Wijaya', username: 'purchasing', email: 'purchasing@constructerp.id', password: 'password123' },
    { role_id: 4, full_name: 'Budi Santoso', username: 'pm', email: 'pm@constructerp.id', password: 'password123' },
    { role_id: 5, full_name: 'Agus Salim', username: 'mandor', email: 'mandor@constructerp.id', password: 'password123' }
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    try {
      await connection.execute(
        'INSERT INTO users (role_id, full_name, username, email, password, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        [user.role_id, user.full_name, user.username, user.email, hashedPassword]
      );
      console.log(`Inserted user: ${user.username}`);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log(`User ${user.username} already exists`);
      } else {
        console.error(err);
      }
    }
  }

  await connection.end();
  console.log('Seeding finished');
}

seed();
