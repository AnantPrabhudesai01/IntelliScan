const { dbRunAsync } = require('./db');

/**
 * Real-world Incident Logger
 * Capture actual system failures into the Admin Incident Center.
 */
async function logIncident({ service, description, severity = 'medium', metadata = {} }) {
  console.log(`🚨 [Incident] Logging ${severity} issue in ${service}: ${description}`);
  
  try {
    const sql = `
      INSERT INTO system_incidents (service, description, severity, status, metadata)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      service, 
      description, 
      severity, 
      'open', 
      JSON.stringify(metadata)
    ];
    
    await dbRunAsync(sql, params);
    return true;
  } catch (err) {
    console.error('❌ Failed to log system incident:', err.message);
    return false;
  }
}

module.exports = { logIncident };
