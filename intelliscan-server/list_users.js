const { dbAllAsync } = require('./src/utils/db');

async function listUsers() {
  const users = await dbAllAsync('SELECT id, name, email, tier FROM users');
  console.log('👥 All Users:', users);
}

listUsers().catch(err => console.error(err));
