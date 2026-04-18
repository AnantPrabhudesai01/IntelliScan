const { dbGetAsync } = require('../src/utils/db');
const { getScopeForUser } = require('../src/utils/workspaceUtils');
// Mocking req/res for the test
const req = { user: { id: 2, email: 'anantprabhudesai444@gmail.com' } };

async function testSave() {
  try {
    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    console.log('Scope:', scopeWorkspaceId);
    
    // Minimal mock card
    const normalizedCard = {
      name: 'Test Save ' + new Date().toISOString(),
      company: 'Test Corp',
      email: 'test@example.com',
      phone: '1234567890',
      title: 'Tester',
      confidence: 99
    };
    
    // We need saveContact from scanController
    // But since it's unexported, we'll re-implement or require it if possible
    // Let's re-implement the DB call directly here to see if it fails
    const { dbRunAsync } = require('../src/utils/db');
    
    const result = await dbRunAsync(`
      INSERT INTO contacts (
        user_id, name, email, phone, company, job_title, confidence, 
        notes, engine_used, inferred_industry, inferred_seniority, location_context,
        name_native, company_native, title_native, image_url, workspace_scope, is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, normalizedCard.name, normalizedCard.email || '', normalizedCard.phone || '', normalizedCard.company || '', 
      normalizedCard.title || '', normalizedCard.confidence || 95, 
      'Test Notes', 'Test AI',
      null, null,
      'Test Location',
      null, null, null,
      null, scopeWorkspaceId, false
    ]);
    
    console.log('Result:', result);
  } catch (err) {
    console.error('Test Save failed:', err);
  } finally {
    process.exit();
  }
}

testSave();
