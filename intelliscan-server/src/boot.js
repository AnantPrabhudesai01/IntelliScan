const fs = require('fs');
const path = require('path');
const { db, pgPool, dbGetAsync, dbAllAsync, dbRunAsync, isPostgres } = require('./utils/db');
const { seedDefaultAdmin } = require('./utils/adminSeeder');

async function bootstrap() {
  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created missing uploads directory');
  }

  // Initialize Database Connectivity Check
  try {
    const dbStatus = await dbAllAsync('SELECT 1');
    if (dbStatus) {
      console.log('✅ Base Database connection verified.');
      
      // Automatic Schema Sync for missing columns
      try {
        await dbRunAsync("ALTER TABLE user_quotas ADD COLUMN IF NOT EXISTS group_limit_amount INTEGER DEFAULT 1");
        
        if (isPostgres) {
          // Self-Healing Billing & Core Tables
          await dbRunAsync(`
            CREATE TABLE IF NOT EXISTS billing_orders (
              id SERIAL PRIMARY KEY,
              user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
              workspace_id TEXT,
              plan_id TEXT,
              amount_paise INTEGER,
              currency TEXT DEFAULT 'INR',
              razorpay_order_id TEXT,
              razorpay_payment_id TEXT,
              razorpay_signature TEXT,
              status TEXT DEFAULT 'created',
              simulated INTEGER DEFAULT 0,
              created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
          `);
          await dbRunAsync(`
            CREATE TABLE IF NOT EXISTS billing_invoices (
              id SERIAL PRIMARY KEY,
              workspace_id VARCHAR(255),
              invoice_number VARCHAR(100),
              amount_cents INTEGER,
              currency VARCHAR(10),
              status VARCHAR(50),
              issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);
          await dbRunAsync(`
            CREATE TABLE IF NOT EXISTS digital_cards (
              id SERIAL PRIMARY KEY,
              user_id INTEGER UNIQUE,
              url_slug TEXT UNIQUE,
              bio TEXT,
              headline TEXT,
              design_json JSONB,
              views INTEGER DEFAULT 0,
              saves INTEGER DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);

          // 🛠️ Self-Healing: Missing 'is_deleted'
          await dbRunAsync("ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE");
          await dbRunAsync("ALTER TABLE contacts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ");
          await dbRunAsync("UPDATE contacts SET is_deleted = FALSE WHERE is_deleted IS NULL");

          // Ensure Email Outreach tracking
          await dbRunAsync(`
            CREATE TABLE IF NOT EXISTS email_sends (
              id SERIAL PRIMARY KEY,
              campaign_id INTEGER REFERENCES email_campaigns(id) ON DELETE CASCADE,
              email TEXT NOT NULL,
              first_name TEXT,
              tracking_id TEXT UNIQUE,
              status TEXT DEFAULT 'pending',
              sent_at TIMESTAMPTZ,
              opened_at TIMESTAMPTZ,
              open_count INTEGER DEFAULT 0,
              click_count INTEGER DEFAULT 0
            );
          `);
        }
        
        console.log('✅ Schema Synchronized: Core tables verified.');
      } catch (schemaErr) {
        console.warn('⚠️  Schema sync warning:', schemaErr.message);
      }

      // Seed Default Admin
      await seedDefaultAdmin();
      
      // Ensure AI Models
      const orCheck = await dbGetAsync("SELECT id FROM ai_models WHERE type = 'openrouter'");
      if (!orCheck) {
        await dbRunAsync("INSERT INTO ai_models (name, type, status) VALUES ('OpenRouter Free', 'openrouter', 'deployed')");
      }
      
      const existingModels = await dbAllAsync('SELECT id FROM ai_models LIMIT 1');
      if (!existingModels || existingModels.length === 0) {
        await dbRunAsync("INSERT INTO ai_models (name, type, status) VALUES ('Gemini 1.5 Flash', 'gemini', 'deployed')");
        await dbRunAsync("INSERT INTO ai_models (name, type, status) VALUES ('GPT-4o Mini', 'openai', 'deployed')");
        await dbRunAsync("INSERT INTO ai_models (name, type, status) VALUES ('Tesseract OCR', 'tesseract', 'deployed')");
      }
      console.log('🤖 AI Models verified.');
    }
  } catch (dbErr) {
    console.warn('⚠️  Database bootstrap warning:', dbErr.message);
  }
}

module.exports = { bootstrap };
