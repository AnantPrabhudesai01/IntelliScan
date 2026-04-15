const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env
dotenv.config({ path: path.join(__dirname, '../intelliscan-server/.env') });

const secret = process.env.JWT_SECRET || 'your-secret-key';
const userId = 1; // Assuming user 1 exists

const token = jwt.sign({ id: userId, purpose: 'magic_export' }, secret, { expiresIn: '1m' });

console.log('--- MAGIC EXCEL EXPORT DIAGNOSTIC ---');
console.log('Test Token Generated:', token);
console.log('URL for Testing:', `http://localhost:5000/api/contacts/export/magic?token=${token}`);

// Check if controller exists and is exported
try {
  const controller = require('../intelliscan-server/src/controllers/contactsController');
  if (controller.exportContactsToExcel) {
    console.log('✅ Controller function exportContactsToExcel found.');
  } else {
    console.log('❌ Controller function NOT found.');
  }
} catch (e) {
  console.log('❌ Error loading controller:', e.message);
}
