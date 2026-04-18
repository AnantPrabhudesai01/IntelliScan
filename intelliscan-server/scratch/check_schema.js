const { dbAllAsync } = require('../src/utils/db');

async function testSchema() {
  try {
    const rows = await dbAllAsync("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'contacts'");
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Schema check failed:', err);
  } finally {
    process.exit();
  }
}

testSchema();
