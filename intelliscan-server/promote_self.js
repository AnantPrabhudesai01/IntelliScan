const { dbRunAsync, dbGetAsync } = require('./src/utils/db');

async function promoteAdmin() {
  const email = 'anantprabhudesai444@gmail.com';
  console.log(`[Admin] Attempting to promote ${email} to Super Admin...`);
  
  try {
    const user = await dbGetAsync('SELECT id, name FROM users WHERE email = ?', [email]);
    if (!user) {
      console.error('❌ User not found in database.');
      return;
    }

    await dbRunAsync("UPDATE users SET role = 'super_admin', tier = 'enterprise' WHERE id = ?", [user.id]);
    console.log(`✅ Success! ${user.name} is now a Super Admin (Enterprise tier).`);
    console.log('Please RE-LOGIN to your dashboard to see the Admin controls.');
  } catch (err) {
    console.error('❌ Error promoting user:', err.message);
  }
}

promoteAdmin();
