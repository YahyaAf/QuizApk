const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function run() {
  const hash = bcrypt.hashSync('password', 10);
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'quiz_db',
    password: 'abc@06@2003',
    port: 5432
  });
  await client.connect();
  await client.query('UPDATE users SET password = $1 WHERE id = 4', [hash]);
  await client.end();
  console.log('Password updated successfully');
}
run();
