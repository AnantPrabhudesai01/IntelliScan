const contactsController = require('./src/controllers/contactsController');
const { db } = require('./src/utils/db');

// Mock req/res
const req = {
  user: { id: 1 }, // Assuming user 1
  body: { ids: [1, 2, 3] }
};
const res = {
  status: function(s) { this.statusCode = s; return this; },
  json: function(j) { console.log('Response:', JSON.stringify(j, null, 2)); }
};

async function run() {
  console.log('--- Testing getDeletedContacts ---');
  await contactsController.getDeletedContacts(req, res);
  
  console.log('\n--- Testing permanentlyDeleteContacts ---');
  await contactsController.permanentlyDeleteContacts(req, res);
  
  console.log('\n--- Testing emptyTrash ---');
  await contactsController.emptyTrash(req, res);
}

run().catch(console.error);
