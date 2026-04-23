const { dbGetAsync, dbAllAsync } = require('./src/utils/db');

async function diagnose() {
  const email = 'anantprabhudesai444@gmail.com';
  console.log(`Checking status for: ${email}`);
  
  const user = await dbGetAsync('SELECT id, name, email, role, tier FROM users WHERE email = ?', [email]);
  if (!user) {
    console.log('❌ User not found in DB');
    return;
  }
  
  console.log('✅ User Found:', user);
  
  const orders = await dbAllAsync('SELECT id, plan_id, status, created_at FROM billing_orders WHERE user_id = ?', [user.id]);
  console.log('📦 Orders:', orders);
  
  const quota = await dbGetAsync('SELECT used_count, limit_amount FROM user_quotas WHERE user_id = ?', [user.id]);
  console.log('📊 Quota:', quota);
}

diagnose().catch(err => console.error(err));
