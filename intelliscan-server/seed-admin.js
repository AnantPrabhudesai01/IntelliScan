const { dbRunAsync } = require('./src/utils/db');

const initialModels = [
  { name: 'Gemini 1.5 Flash', type: 'gemini', vram: 0, status: 'deployed', acc: 99.1, lat: 250, calls: 45230 },
  { name: 'GPT-4o Mini', type: 'openai', vram: 0, status: 'deployed', acc: 98.4, lat: 320, calls: 32000 },
  { name: 'Tesseract OCR', type: 'custom', vram: 2, status: 'deployed', acc: 88.0, lat: 1200, calls: 5000 },
  { name: 'OpenRouter Free', type: 'custom', vram: 0, status: 'deployed', acc: 94.0, lat: 850, calls: 1200 },
  { name: 'Nvidia Nemotron 340B (Primary)', type: 'custom', vram: 80, status: 'deployed', acc: 99.1, lat: 750, calls: 8900 },
  { name: 'Gemini 3 Flash (Secondary)', type: 'gemini', vram: 0, status: 'deployed', acc: 98.4, lat: 450, calls: 12450 },
  { name: 'Claude 3.5 Sonnet', type: 'custom', vram: 0, status: 'deployed', acc: 98.8, lat: 650, calls: 500 },
  { name: 'Llama 3 70B (Base)', type: 'custom', vram: 40, status: 'training', acc: 0, lat: 0, calls: 450 },
];

const initialWorkspaces = [
  { name: 'Nebula Tech Corp', tier: 'enterprise' },
  { name: 'Aether Dynamics', tier: 'pro' },
  { name: 'Vertex Solutions', tier: 'personal' },
  { name: 'Quantum Leap Labs', tier: 'enterprise' },
  { name: 'Solaris Data', tier: 'pro' },
];

async function seed() {
  console.log('Seeding Super Admin Data...');

  try {
    for (const m of initialModels) {
      await dbRunAsync(
        'INSERT INTO ai_models (name, type, vram_gb, status, accuracy, latency_ms, calls_30d) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [m.name, m.type, m.vram, m.status, m.acc, m.lat, m.calls]
      );
    }
    console.log('Models seeded.');

    // We can't easily seed owners without knowing existing user IDs, 
    // but we can create some workspaces with a default or skip for now if owner_id is required.
    // In our migration-supabase.sql, owner_id is NOT strictly required at DB level for workspaces if we didn't add the constraint yet (wait it has REFERENCES users(id)).
    
    // Let's just seed the models for now as they are the primary visual. 
    // Organizations will be seeded manually by the user or dynamically when they add one.

  } catch (err) {
    console.error('Seed failed:', err.message);
  }
}

seed();
