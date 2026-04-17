/**
 * CRM Service — Orchestrates data pushing to external platforms (Salesforce, Google Sheets)
 */
const { dbGetAsync, dbRunAsync } = require('../utils/db');
const axios = require('axios');

/**
 * Pushes a list of contacts to a specific provider.
 * This is the "PRO" functional logic requested by the user.
 */
async function syncContactsToProvider(workspaceId, provider, contacts, mappings) {
  const integrationRes = await dbGetAsync(
    'SELECT config_json, is_active FROM workspace_integrations WHERE workspace_id = ? AND app_id = ?',
    [workspaceId, provider]
  );

  const config = integrationRes ? JSON.parse(integrationRes.config_json || '{}') : {};
  
  // Logic branch based on provider
  if (provider === 'salesforce') {
    return await syncToSalesforce(config, contacts, mappings);
  } else if (provider === 'googlesheets') {
    return await syncToGoogleSheets(config, contacts, mappings);
  }
  
  throw new Error(`Provider ${provider} is not yet implemented for direct API sync.`);
}

/**
 * Salesforce REST API Lead Creation logic
 */
async function syncToSalesforce(config, contacts, mappings) {
  const { instance_url, access_token } = config;
  
  if (!instance_url || !access_token) {
    throw new Error('Salesforce credentials incomplete. Please reconnect.');
  }

  const results = { success: 0, failed: 0, errors: [] };

  for (const contact of contacts) {
    try {
      // Map IntelliScan fields to Salesforce Lead fields
      const leadData = {};
      mappings.forEach(m => {
        if (m.crmField && m.crmField !== '-- Do not sync --') {
          leadData[m.crmField] = contact[m.iscanKey] || '';
        }
      });

      // SF specific defaults if missing
      if (!leadData.LastName) leadData.LastName = contact.name || 'Unknown';
      if (!leadData.Company) leadData.Company = contact.company || 'Unknown';

      await axios.post(`${instance_url}/services/data/v54.0/sobjects/Lead`, leadData, {
        headers: { 'Authorization': `Bearer ${access_token}` }
      });
      results.success++;
    } catch (err) {
      results.failed++;
      results.errors.push(err.response?.data?.[0]?.message || err.message);
    }
  }

  return results;
}

/**
 * Google Sheets Append logic (Using a simplified Script/API flow)
 */
async function syncToGoogleSheets(config, contacts, mappings) {
  const { spreadsheet_id, access_token } = config;

  if (!spreadsheet_id) {
    throw new Error('Google Sheet ID missing.');
  }

  // Simplified: Appending values to the first sheet
  const values = contacts.map(contact => {
    return mappings.map(m => contact[m.iscanKey] || '');
  });

  try {
    // Note: This assumes Google Sheets API v4
    await axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/A1:append?valueInputOption=USER_ENTERED`,
      { values },
      { headers: { 'Authorization': `Bearer ${access_token}` } }
    );
    return { success: contacts.length, failed: 0 };
  } catch (err) {
    throw new Error(`Google Sheets Sync failed: ${err.message}`);
  }
}

module.exports = {
  syncContactsToProvider
};
