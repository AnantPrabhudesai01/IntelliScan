/* eslint-disable no-console */
'use strict';

// Render draw.io-style (simple black/white) UML-ish diagrams to SVG + PNG.
// Output PNGs are designed to be copy/pasted into Word.
//
// This intentionally does NOT use Mermaid so the output looks like a normal
// diagramming tool export (draw.io / diagrams.net).

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT_SVG_DIR = path.join(ROOT, 'PROJECT_DIAGRAMS', 'svg');
const OUT_PNG_DIR = path.join(ROOT, 'PROJECT_DIAGRAMS', 'png');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function svgDoc({ width, height, content }) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#000"/>
      </marker>
    </defs>`,
    `<style>
      .shape { fill: #fff; stroke: #000; stroke-width: 2; }
      .thin { stroke-width: 1.5; }
      .fillBlack { fill: #000; stroke: #000; stroke-width: 2; }
      .text { fill: #000; font-family: Arial, Helvetica, sans-serif; font-size: 14px; }
      .textSmall { font-size: 12px; }
      .textTitle { font-size: 16px; font-weight: 700; }
      .dashed { stroke-dasharray: 6 6; }
    </style>`,
    `<rect x="0" y="0" width="${width}" height="${height}" fill="#fff" />`,
    content,
    `</svg>`
  ].join('\n');
}

function line(x1, y1, x2, y2, { arrow = false, dashed = false } = {}) {
  const cls = ['shape', 'thin', dashed ? 'dashed' : ''].filter(Boolean).join(' ');
  const marker = arrow ? ' marker-end="url(#arrow)"' : '';
  return `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${marker} />`;
}

function rect(x, y, w, h, { rx = 0, ry = 0, cls = 'shape' } = {}) {
  return `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ry="${ry}" />`;
}

function ellipse(cx, cy, rx, ry, { cls = 'shape' } = {}) {
  return `<ellipse class="${cls}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" />`;
}

function diamond(cx, cy, w, h, { cls = 'shape' } = {}) {
  const pts = [
    `${cx},${cy - h / 2}`,
    `${cx + w / 2},${cy}`,
    `${cx},${cy + h / 2}`,
    `${cx - w / 2},${cy}`
  ].join(' ');
  return `<polygon class="${cls}" points="${pts}" />`;
}

function text(x, y, t, { anchor = 'middle', cls = 'text' } = {}) {
  return `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${escapeXml(t)}</text>`;
}

function multilineText(x, y, t, { anchor = 'middle', cls = 'text', lineHeight = 16 } = {}) {
  const lines = String(t).split('\n');
  const tspans = lines
    .map((ln, idx) => {
      const dy = idx === 0 ? 0 : lineHeight;
      return `<tspan x="${x}" dy="${dy}">${escapeXml(ln)}</tspan>`;
    })
    .join('');
  return `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${tspans}</text>`;
}

function actor(x, y, label) {
  // Simple UML actor (stick figure)
  const headR = 10;
  const head = `<circle class="shape" cx="${x}" cy="${y}" r="${headR}" />`;
  const body = line(x, y + headR, x, y + 55);
  const arms = line(x - 18, y + 25, x + 18, y + 25);
  const legs = [line(x, y + 55, x - 18, y + 80), line(x, y + 55, x + 18, y + 80)].join('\n');
  const lbl = multilineText(x, y + 105, label, { cls: 'text textSmall', lineHeight: 14 });
  return [head, body, arms, legs, lbl].join('\n');
}

function useCase(cx, cy, label) {
  const rx = 125;
  const ry = 34;
  return [ellipse(cx, cy, rx, ry), multilineText(cx, cy + 5, label, { cls: 'text', lineHeight: 14 })].join('\n');
}

function startNode(cx, cy) {
  return `<circle class="fillBlack" cx="${cx}" cy="${cy}" r="10" />`;
}

function endNode(cx, cy) {
  return [
    `<circle class="shape" cx="${cx}" cy="${cy}" r="14" />`,
    `<circle class="fillBlack" cx="${cx}" cy="${cy}" r="8" />`
  ].join('\n');
}

function actionNode(x, y, w, h, label) {
  return [rect(x, y, w, h, { rx: 12, ry: 12 }), multilineText(x + w / 2, y + h / 2 - 4, label, { lineHeight: 14 })].join('\n');
}

function noteBox(x, y, w, h, label) {
  return [
    rect(x, y, w, h, { rx: 6, ry: 6, cls: 'shape thin' }),
    multilineText(x + 10, y + 18, label, { anchor: 'start', cls: 'text textSmall', lineHeight: 14 })
  ].join('\n');
}

function participant(x, y, w, label) {
  const h = 38;
  return [rect(x, y, w, h, { rx: 4, ry: 4 }), multilineText(x + w / 2, y + 24, label, { cls: 'text textSmall', lineHeight: 14 })].join('\n');
}

function lifeline(x, y1, y2) {
  return line(x, y1, x, y2, { dashed: true });
}

function message(x1, y, x2, label, { dashed = false } = {}) {
  const msgLine = line(x1, y, x2, y, { arrow: true, dashed });
  const lbl = text((x1 + x2) / 2, y - 8, label, { cls: 'text textSmall' });
  return [msgLine, lbl].join('\n');
}

function classBox(x, y, w, name, attrs, methods) {
  const headerH = 34;
  const attrsH = Math.max(40, attrs.length * 16 + 10);
  const methodsH = Math.max(40, methods.length * 16 + 10);
  const h = headerH + attrsH + methodsH;

  const box = rect(x, y, w, h, { rx: 4, ry: 4 });
  const sep1 = line(x, y + headerH, x + w, y + headerH);
  const sep2 = line(x, y + headerH + attrsH, x + w, y + headerH + attrsH);
  const title = text(x + w / 2, y + 22, name, { cls: 'text textSmall' });

  const attrLines = attrs.length ? attrs : ['(none)'];
  const methodLines = methods.length ? methods : ['(none)'];

  const attrsText = attrLines
    .map((a, i) => text(x + 10, y + headerH + 18 + i * 16, a, { anchor: 'start', cls: 'text textSmall' }))
    .join('\n');
  const methodsText = methodLines
    .map((m, i) => text(x + 10, y + headerH + attrsH + 18 + i * 16, m, { anchor: 'start', cls: 'text textSmall' }))
    .join('\n');

  return { svg: [box, sep1, sep2, title, attrsText, methodsText].join('\n'), h };
}

function buildUseCaseDiagram() {
  const width = 1600;
  const height = 900;

  const boundary = rect(240, 60, 1120, 780, { rx: 8, ry: 8 });
  const boundaryTitle = text(800, 90, 'IntelliScan Platform', { cls: 'text textTitle' });

  // Actors (left)
  const aVisitor = actor(120, 120, 'Visitor');
  const aUser = actor(120, 330, 'User\n(Personal / Pro)');
  const aAdmin = actor(120, 560, 'Enterprise\nAdmin');
  const aSuper = actor(120, 760, 'Super Admin');

  // External systems (right)
  const aPay = actor(1480, 80, 'Payment Gateway\n(Razorpay)');
  const aAI = actor(1480, 200, 'AI Provider\n(Gemini)');
  const aEmail = actor(1480, 350, 'Email Provider\n(SMTP)');
  const aCRM = actor(1480, 650, 'CRM / Webhook\nReceivers');

  // Use cases (inside boundary)
  const uc = [];
  const positions = [
    { x: 520, y: 160, label: 'Sign Up / Sign In\nRestore Session' },
    { x: 520, y: 260, label: 'Scan Single Card' },
    { x: 520, y: 360, label: 'Scan Group Photo\n(Multi-Card)' },
    { x: 520, y: 460, label: 'Batch Upload Queue' },
    { x: 520, y: 560, label: 'Scanner Links\n(Kiosk / QR)' },
    { x: 520, y: 660, label: 'Manage Contacts\n(Search, Edit, Export)' },
    { x: 520, y: 760, label: 'Events & Campaigns\n(Tag Leads)' },
    { x: 1040, y: 150, label: 'Billing & Plans\n(Upgrade, Quotas)' },
    { x: 1040, y: 250, label: 'AI Assistance\n(Drafts, Coach)' },
    { x: 1040, y: 350, label: 'Email Marketing\n(Campaigns, Sequences)' },
    { x: 1040, y: 450, label: 'Sales Pipeline\n+ Lead Routing' },
    { x: 1040, y: 550, label: 'Calendar\n+ Booking' },
    { x: 1040, y: 650, label: 'Integrations\n(CRM, Webhooks)' },
    { x: 1040, y: 750, label: 'Governance\n(Policies, Data Quality)' }
  ];
  for (const p of positions) uc.push(useCase(p.x, p.y, p.label));

  // Connections (simple association lines)
  const conns = [];
  // Visitor -> auth
  conns.push(line(170, 220, 395, 160));
  // User -> core dashboard capabilities
  for (const y of [160, 260, 360, 460, 660, 760, 150, 250]) conns.push(line(170, 430, 395, y));
  // Enterprise admin -> governance/integrations
  for (const y of [560, 660, 760, 150, 350, 450, 550, 650, 750]) conns.push(line(170, 660, 395, y));
  // Super admin -> integration/policy surface (simplified)
  conns.push(line(170, 860, 915, 750));

  // External system links (placed as associations for simplicity)
  // Use-case right edges. (centerX + rx)
  const UC_LEFT_R = 645; // 520 + 125
  const UC_RIGHT_R = 1165; // 1040 + 125
  const ACTOR_L = 1462;
  // External system associations (kept simple and mostly horizontal).
  conns.push(line(UC_RIGHT_R, 150, ACTOR_L, 150)); // Payment gateway
  conns.push(line(UC_RIGHT_R, 250, ACTOR_L, 250)); // AI: assistance (drafts/coach)
  conns.push(line(UC_RIGHT_R, 350, ACTOR_L, 350)); // Email sending
  conns.push(line(UC_RIGHT_R, 650, ACTOR_L, 650)); // CRM + webhooks receivers

  const content = [
    boundary,
    boundaryTitle,
    aVisitor,
    aUser,
    aAdmin,
    aSuper,
    aPay,
    aAI,
    aEmail,
    aCRM,
    ...uc,
    ...conns
  ].join('\n');

  return {
    name: 'use_case_intelliscan',
    width,
    height,
    svg: svgDoc({ width, height, content })
  };
}

function buildActivityAuth() {
  const width = 1200;
  const height = 760;
  const content = [];
  content.push(text(width / 2, 40, 'Activity Diagram: Authenticate & Restore Session', { cls: 'text textTitle' }));

  const cx = width / 2;
  content.push(startNode(cx, 90));

  const steps = [
    { label: 'User opens IntelliScan (web)', w: 520 },
    { label: 'Check localStorage token + user snapshot', w: 520 },
    { label: 'Call API: GET /api/auth/me (validate token)', w: 540 }
  ];
  let y = 120;
  for (const s of steps) {
    content.push(actionNode(cx - s.w / 2, y, s.w, 54, s.label));
    content.push(line(cx, y - 10, cx, y));
    y += 82;
  }

  // Decision: token valid?
  content.push(line(cx, y - 10, cx, y));
  content.push(diamond(cx, y + 30, 140, 90));
  content.push(text(cx, y + 34, 'Token\nvalid?', { cls: 'text textSmall' }));

  // Yes path (right)
  const yesX = cx + 280;
  const yesY = y + 10;
  content.push(line(cx + 70, y + 30, yesX - 110, yesY + 30, { arrow: true }));
  content.push(text((cx + 70 + yesX - 110) / 2, y + 18, 'Yes', { cls: 'text textSmall' }));
  content.push(actionNode(yesX - 220, yesY + 60, 440, 54, 'Hydrate Auth Context\n(role, tier, quotas)'));
  content.push(line(yesX, yesY + 40, yesX, yesY + 60));
  content.push(actionNode(yesX - 220, yesY + 142, 440, 54, 'Route to Dashboard\n(Protected Routes)'));
  content.push(line(yesX, yesY + 114, yesX, yesY + 142));
  content.push(endNode(yesX, yesY + 240));
  content.push(line(yesX, yesY + 196, yesX, yesY + 226));

  // No path (left)
  const noX = cx - 280;
  const noY = y + 10;
  content.push(line(cx - 70, y + 30, noX + 110, noY + 30, { arrow: true }));
  content.push(text((cx - 70 + noX + 110) / 2, y + 18, 'No', { cls: 'text textSmall' }));
  content.push(actionNode(noX - 220, noY + 60, 440, 54, 'Clear token + user\n(localStorage cleanup)'));
  content.push(line(noX, noY + 40, noX, noY + 60));
  content.push(actionNode(noX - 220, noY + 142, 440, 54, 'Show Sign In page'));
  content.push(line(noX, noY + 114, noX, noY + 142));
  content.push(endNode(noX, noY + 240));
  content.push(line(noX, noY + 196, noX, noY + 226));

  return {
    name: 'activity_1_auth_session',
    width,
    height,
    svg: svgDoc({ width, height, content: content.join('\n') })
  };
}

function buildActivitySingleScan() {
  const width = 1200;
  const height = 820;
  const content = [];
  content.push(text(width / 2, 40, 'Activity Diagram: Single Card Scan -> Save Contact', { cls: 'text textTitle' }));

  const cx = width / 2;
  content.push(startNode(cx, 90));

  const blocks = [
    'User selects optional Event\n(for lead attribution)',
    'Upload photo (single card)\n(frontend validates file)',
    'POST /api/scan (Gemini OCR)\n+ quota check',
    'Parse & normalize JSON fields\n(name, email, phone, company)',
    'Show Extraction Preview\n(user can edit fields)',
    'POST /api/contacts (save contact)\n+ audit trail',
    'Contacts list + stats refresh\n(contacts page)',
    'Optional: Create AI Draft\n(follow-up email)'
  ];

  let y = 120;
  for (const b of blocks) {
    const h = 62;
    content.push(actionNode(cx - 360, y, 720, h, b));
    content.push(line(cx, y - 10, cx, y));
    y += 88;
  }

  content.push(endNode(cx, y + 10));
  content.push(line(cx, y - 10, cx, y - 2));

  content.push(
    noteBox(
      60,
      650,
      320,
      110,
      'Multilingual cards:\n- AI prompt asks for\n  native-script fields\n  (name_native, company_native)\n- Store both native + Latin\n  where possible'
    )
  );

  return {
    name: 'activity_2_single_scan',
    width,
    height,
    svg: svgDoc({ width, height, content: content.join('\n') })
  };
}

function buildActivityGroupScan() {
  const width = 1200;
  const height = 860;
  const content = [];
  content.push(text(width / 2, 40, 'Activity Diagram: Group Photo Scan -> Save All', { cls: 'text textTitle' }));

  const cx = width / 2;
  content.push(startNode(cx, 90));

  const blocks = [
    'Upload group photo (5-25 cards)',
    'POST /api/scan-multi\n(Gemini multi-contact extraction)\n+ group-scan quota check',
    'AI returns contact[] + confidence\n(dedup hints, parsing)',
    'Show Group Detection Results\n(user reviews & edits)',
    'User clicks "Save All New"',
    'POST /api/contacts/bulk\n(create contacts)',
    'Enqueue possible duplicates\n(data_quality_dedupe_queue)',
    'Contacts page refresh +\nData Quality Center updated'
  ];

  let y = 120;
  for (const b of blocks) {
    const h = 70;
    content.push(actionNode(cx - 380, y, 760, h, b));
    content.push(line(cx, y - 10, cx, y));
    y += 96;
  }

  content.push(endNode(cx, y + 10));
  content.push(line(cx, y - 10, cx, y - 2));

  content.push(
    noteBox(
      60,
      640,
      320,
      150,
      'Why names can be wrong:\n- card boundaries unclear\n- skew / glare\n- mixed languages\nFix strategy:\n- AI prompt: return per-card\n  raw text + structure\n- normalize fields\n- confidence thresholds'
    )
  );

  return {
    name: 'activity_3_group_scan',
    width,
    height,
    svg: svgDoc({ width, height, content: content.join('\n') })
  };
}

function buildActivityEmailCampaign() {
  const width = 1200;
  const height = 860;
  const content = [];
  content.push(
    text(width / 2, 40, 'Activity Diagram: Email Campaign (Audience -> AI Copy -> Send -> Track)', { cls: 'text textTitle' })
  );

  const cx = width / 2;
  content.push(startNode(cx, 90));

  const blocks = [
    'Select audience\n(email list / segment / event)',
    'Optional: AI generates subject + body\n(Gemini copywriter)',
    'Preview recipient count\n+ compliance checks',
    'POST /api/email/campaigns\n(create campaign draft)',
    'POST /api/email/campaigns/:id/send\n(queue sends)',
    'Send emails via SMTP\n(email_sends rows created)',
    'Track opens/clicks\n(email_clicks + events)',
    'Update analytics dashboard\n(open rate, CTR, conversions)'
  ];

  let y = 120;
  for (const b of blocks) {
    const h = 70;
    content.push(actionNode(cx - 380, y, 760, h, b));
    content.push(line(cx, y - 10, cx, y));
    y += 96;
  }

  content.push(endNode(cx, y + 10));
  content.push(line(cx, y - 10, cx, y - 2));

  content.push(
    noteBox(
      60,
      640,
      320,
      150,
      'Production notes:\n- unsubscribe support\n- per-workspace sending limits\n- bounce handling\n- audit trail for sends\n- store template versions'
    )
  );

  return {
    name: 'activity_4_email_campaign',
    width,
    height,
    svg: svgDoc({ width, height, content: content.join('\n') })
  };
}

function buildActivityBilling() {
  const width = 1200;
  const height = 820;
  const content = [];
  content.push(text(width / 2, 40, 'Activity Diagram: Billing Upgrade (Razorpay) -> Tier/Quota Refresh', { cls: 'text textTitle' }));

  const cx = width / 2;
  content.push(startNode(cx, 90));

  const blocks = [
    'User selects plan (Pro / Enterprise)',
    'POST /api/billing/create-order\n(server creates Razorpay order\nor simulated order in demo mode)',
    'Razorpay Checkout\n(user completes payment)',
    'POST /api/billing/verify-payment\n(verify signature)',
    'Update users.tier + user_quotas\n+ billing_orders + invoices',
    'Return updated entitlements\n(frontend refresh)',
    'Billing page shows invoice history\n+ plan status'
  ];

  let y = 120;
  for (const b of blocks) {
    const h = 74;
    content.push(actionNode(cx - 400, y, 800, h, b));
    content.push(line(cx, y - 10, cx, y));
    y += 104;
  }

  content.push(endNode(cx, y + 10));
  content.push(line(cx, y - 10, cx, y - 2));

  content.push(
    noteBox(
      60,
      620,
      320,
      160,
      'Demo mode:\n- if Razorpay keys missing,\n  server returns simulated order\n  so UI is still functional.\nSecurity:\n- never trust client amount\n- verify signature server-side'
    )
  );

  return {
    name: 'activity_5_billing_razorpay',
    width,
    height,
    svg: svgDoc({ width, height, content: content.join('\n') })
  };
}

function buildSequenceAuth() {
  const width = 1400;
  const height = 620;
  const content = [];
  content.push(text(width / 2, 40, 'Interaction Diagram: Session Restore on App Load', { cls: 'text textTitle' }));

  const topY = 80;
  const lifelineTop = 118;
  const lifelineBottom = 560;

  const parts = [
    { label: 'Browser', x: 120, w: 180 },
    { label: 'IntelliScan UI', x: 360, w: 220 },
    { label: 'Auth API', x: 660, w: 180 },
    { label: 'DB (SQLite)', x: 920, w: 200 },
    { label: 'RBAC/Quotas', x: 1180, w: 200 }
  ];

  for (const p of parts) content.push(participant(p.x, topY, p.w, p.label));
  for (const p of parts) content.push(lifeline(p.x + p.w / 2, lifelineTop, lifelineBottom));

  let y = 150;
  content.push(message(210, y, 470, 'Open /dashboard'));
  y += 50;
  content.push(message(470, y, 750, 'GET /api/auth/me (token)'));
  y += 50;
  content.push(message(750, y, 1020, 'SELECT session + user'));
  y += 50;
  content.push(message(1020, y, 1280, 'Load role/tier/quotas', { dashed: true }));
  y += 50;
  content.push(message(750, y, 470, '200 {user, quotas}'));
  y += 50;
  content.push(message(470, y, 210, 'Render dashboard'));

  return {
    name: 'sequence_1_auth_session',
    width,
    height,
    svg: svgDoc({ width, height, content: content.join('\n') })
  };
}

function buildSequenceSingleScan() {
  const width = 1400;
  const height = 680;
  const content = [];
  content.push(text(width / 2, 40, 'Interaction Diagram: Single Scan -> Save Contact', { cls: 'text textTitle' }));

  const topY = 80;
  const lifelineTop = 118;
  const lifelineBottom = 620;

  const parts = [
    { label: 'User', x: 80, w: 160 },
    { label: 'Scan UI', x: 280, w: 180 },
    { label: 'Scan API', x: 520, w: 170 },
    { label: 'Gemini AI', x: 740, w: 170 },
    { label: 'Contacts API', x: 960, w: 190 },
    { label: 'DB', x: 1210, w: 140 }
  ];

  for (const p of parts) content.push(participant(p.x, topY, p.w, p.label));
  for (const p of parts) content.push(lifeline(p.x + p.w / 2, lifelineTop, lifelineBottom));

  let y = 150;
  content.push(message(160, y, 370, 'Upload image'));
  y += 55;
  content.push(message(370, y, 605, 'POST /api/scan'));
  y += 55;
  content.push(message(605, y, 825, 'Extract fields (OCR+LLM)'));
  y += 55;
  content.push(message(825, y, 605, 'JSON {fields, confidence}'));
  y += 55;
  content.push(message(605, y, 370, '200 preview payload'));
  y += 55;
  content.push(message(160, y, 370, 'Confirm save'));
  y += 55;
  content.push(message(370, y, 1055, 'POST /api/contacts'));
  y += 55;
  content.push(message(1055, y, 1280, 'INSERT contacts'));
  y += 55;
  content.push(message(1280, y, 1055, 'OK'));
  y += 55;
  content.push(message(1055, y, 370, '201 created'));
  y += 55;
  content.push(message(370, y, 160, 'Show success'));

  return {
    name: 'sequence_2_single_scan',
    width,
    height,
    svg: svgDoc({ width, height, content: content.join('\n') })
  };
}

function buildSequenceGroupScan() {
  const width = 1400;
  const height = 700;
  const content = [];
  content.push(text(width / 2, 40, 'Interaction Diagram: Group Scan -> Save All', { cls: 'text textTitle' }));

  const topY = 80;
  const lifelineTop = 118;
  const lifelineBottom = 640;

  const parts = [
    { label: 'User', x: 70, w: 160 },
    { label: 'Group Scan UI', x: 260, w: 220 },
    { label: 'Scan API', x: 530, w: 170 },
    { label: 'Gemini AI', x: 740, w: 170 },
    { label: 'Contacts Bulk API', x: 950, w: 230 },
    { label: 'DB / Dedupe Queue', x: 1220, w: 170 }
  ];

  for (const p of parts) content.push(participant(p.x, topY, p.w, p.label));
  for (const p of parts) content.push(lifeline(p.x + p.w / 2, lifelineTop, lifelineBottom));

  let y = 150;
  content.push(message(150, y, 370, 'Upload group photo'));
  y += 55;
  content.push(message(370, y, 615, 'POST /api/scan-multi'));
  y += 55;
  content.push(message(615, y, 825, 'Extract contact[]'));
  y += 55;
  content.push(message(825, y, 615, 'JSON contact[]'));
  y += 55;
  content.push(message(615, y, 370, '200 results'));
  y += 55;
  content.push(message(150, y, 370, 'Save All New'));
  y += 55;
  content.push(message(370, y, 1065, 'POST /api/contacts/bulk'));
  y += 55;
  content.push(message(1065, y, 1305, 'INSERT contacts + enqueue dedupe'));
  y += 55;
  content.push(message(1305, y, 1065, 'OK'));
  y += 55;
  content.push(message(1065, y, 370, '201 bulk created'));
  y += 55;
  content.push(message(370, y, 150, 'Refresh UI'));

  return {
    name: 'sequence_3_group_scan',
    width,
    height,
    svg: svgDoc({ width, height, content: content.join('\n') })
  };
}

function buildSequenceEmailCampaign() {
  const width = 1400;
  const height = 700;
  const content = [];
  content.push(text(width / 2, 40, 'Interaction Diagram: Email Campaign Send + Tracking', { cls: 'text textTitle' }));

  const topY = 80;
  const lifelineTop = 118;
  const lifelineBottom = 640;

  const parts = [
    { label: 'User', x: 70, w: 150 },
    { label: 'Email UI', x: 250, w: 180 },
    { label: 'Email API', x: 470, w: 170 },
    { label: 'Gemini AI', x: 680, w: 160 },
    { label: 'SMTP Provider', x: 880, w: 200 },
    { label: 'DB / Analytics', x: 1120, w: 220 }
  ];

  for (const p of parts) content.push(participant(p.x, topY, p.w, p.label));
  for (const p of parts) content.push(lifeline(p.x + p.w / 2, lifelineTop, lifelineBottom));

  let y = 150;
  content.push(message(145, y, 340, 'Pick list/segment'));
  y += 55;
  content.push(message(340, y, 555, 'POST /api/email/ai-copy'));
  y += 55;
  content.push(message(555, y, 760, 'Generate subject/body'));
  y += 55;
  content.push(message(760, y, 555, 'Copy draft'));
  y += 55;
  content.push(message(555, y, 340, 'Return draft'));
  y += 55;
  content.push(message(145, y, 340, 'Send campaign'));
  y += 55;
  content.push(message(340, y, 555, 'POST /campaigns/:id/send'));
  y += 55;
  content.push(message(555, y, 980, 'Send emails'));
  y += 55;
  content.push(message(980, y, 1230, 'Write send rows'));
  y += 85;
  content.push(message(980, y, 555, 'Delivery/open/click events', { dashed: true }));
  y += 55;
  content.push(message(555, y, 340, 'Update metrics'));

  return {
    name: 'sequence_4_email_campaign',
    width,
    height,
    svg: svgDoc({ width, height, content: content.join('\n') })
  };
}

function buildSequenceBilling() {
  const width = 1400;
  const height = 660;
  const content = [];
  content.push(text(width / 2, 40, 'Interaction Diagram: Billing Upgrade (Razorpay)', { cls: 'text textTitle' }));

  const topY = 80;
  const lifelineTop = 118;
  const lifelineBottom = 600;

  const parts = [
    { label: 'User', x: 90, w: 150 },
    { label: 'Billing UI', x: 270, w: 180 },
    { label: 'Billing API', x: 490, w: 180 },
    { label: 'Razorpay', x: 710, w: 180 },
    { label: 'DB', x: 930, w: 160 },
    { label: 'Quotas', x: 1140, w: 180 }
  ];

  for (const p of parts) content.push(participant(p.x, topY, p.w, p.label));
  for (const p of parts) content.push(lifeline(p.x + p.w / 2, lifelineTop, lifelineBottom));

  let y = 150;
  content.push(message(165, y, 360, 'Choose plan'));
  y += 55;
  content.push(message(360, y, 580, 'POST /create-order'));
  y += 55;
  content.push(message(580, y, 800, 'Create order'));
  y += 55;
  content.push(message(800, y, 360, 'Checkout success'));
  y += 55;
  content.push(message(360, y, 580, 'POST /verify-payment'));
  y += 55;
  content.push(message(580, y, 1010, 'Write order + invoice'));
  y += 55;
  content.push(message(580, y, 1230, 'Update tier + quotas'));
  y += 55;
  content.push(message(580, y, 360, 'Return entitlements'));
  y += 55;
  content.push(message(360, y, 165, 'Show upgraded plan'));

  return {
    name: 'sequence_5_billing_razorpay',
    width,
    height,
    svg: svgDoc({ width, height, content: content.join('\n') })
  };
}

function buildClassAuth() {
  const width = 1400;
  const height = 780;
  const content = [];
  content.push(text(width / 2, 40, 'Class Diagram: Authentication & Access Profile', { cls: 'text textTitle' }));

  const u = classBox(80, 90, 320, 'User', ['+id: int', '+email: string', '+role: string', '+tier: string'], ['+isAdmin(): bool']);
  const s = classBox(520, 90, 320, 'Session', ['+id: int', '+token: string', '+user_id: int', '+expires_at: datetime'], []);
  const q = classBox(
    960,
    90,
    340,
    'UserQuota',
    ['+user_id: int', '+scans_total: int', '+scans_used: int', '+group_total: int', '+group_used: int'],
    ['+canScan(): bool']
  );
  const authSvc = classBox(
    80,
    420,
    420,
    'AuthService',
    ['+jwtSecret: string'],
    ['+signIn(email,pw)', '+restore(token)', '+revoke(sessionId)']
  );
  const rbac = classBox(560, 420, 360, 'RBACPolicy', ['+rules: map'], ['+can(user, action): bool']);
  const api = classBox(980, 420, 340, 'AuthAPI', [], ['+POST /auth/login', '+GET /auth/me', '+POST /auth/logout']);

  content.push(u.svg, s.svg, q.svg, authSvc.svg, rbac.svg, api.svg);

  // Relations (simplified)
  content.push(line(400, 150, 520, 150, { arrow: true }));
  content.push(text(460, 140, '1..n', { cls: 'text textSmall' }));
  content.push(line(840, 150, 960, 150, { arrow: true }));
  content.push(text(900, 140, '1..1', { cls: 'text textSmall' }));

  content.push(line(290, 420, 290, 360, { arrow: true }));
  content.push(line(290, 360, 680, 360, { arrow: true }));
  content.push(line(680, 360, 680, 420, { arrow: true }));
  content.push(text(520, 350, 'uses', { cls: 'text textSmall' }));

  content.push(line(1160, 420, 1160, 360, { arrow: true }));
  content.push(line(1160, 360, 680, 360, { arrow: true }));
  content.push(text(940, 350, 'enforces', { cls: 'text textSmall' }));

  return {
    name: 'class_1_auth_access',
    width,
    height,
    svg: svgDoc({ width, height, content: content.join('\n') })
  };
}

function buildClassSingleScan() {
  const width = 1400;
  const height = 820;
  const content = [];
  content.push(text(width / 2, 40, 'Class Diagram: Single Scan Pipeline', { cls: 'text textTitle' }));

  const scanReq = classBox(80, 90, 360, 'ScanRequest', ['+user_id: int', '+image: blob', '+event_id?: int'], []);
  const gemini = classBox(520, 90, 360, 'GeminiClient', ['+apiKey: string', '+model: string'], ['+extractSingle(image): JSON']);
  const normal = classBox(960, 90, 360, 'OcrNormalizer', [], ['+normalize(json): ContactDraft']);
  const draft = classBox(
    80,
    410,
    360,
    'ContactDraft',
    ['+name', '+email', '+phone', '+company', '+confidence', '+name_native?'],
    []
  );
  const contact = classBox(520, 410, 360, 'Contact', ['+id: int', '+fields...', '+crm_synced: bool'], []);
  const svc = classBox(960, 410, 360, 'ContactService', [], ['+create(draft)', '+exportCSV()', '+search(query)']);

  content.push(scanReq.svg, gemini.svg, normal.svg, draft.svg, contact.svg, svc.svg);

  content.push(line(440, 150, 520, 150, { arrow: true }));
  content.push(text(480, 140, 'calls', { cls: 'text textSmall' }));
  content.push(line(880, 150, 960, 150, { arrow: true }));
  content.push(text(920, 140, 'returns', { cls: 'text textSmall' }));

  content.push(line(440, 520, 520, 520, { arrow: true }));
  content.push(text(480, 510, 'materializes', { cls: 'text textSmall' }));
  content.push(line(840, 520, 960, 520, { arrow: true }));
  content.push(text(900, 510, 'persists via', { cls: 'text textSmall' }));

  return {
    name: 'class_2_single_scan',
    width,
    height,
    svg: svgDoc({ width, height, content: content.join('\n') })
  };
}

function buildClassGroupScan() {
  const width = 1400;
  const height = 820;
  const content = [];
  content.push(text(width / 2, 40, 'Class Diagram: Group Scan + Data Quality', { cls: 'text textTitle' }));

  const job = classBox(70, 90, 360, 'GroupScanJob', ['+id: string', '+user_id: int', '+image: blob', '+status'], ['+start()', '+complete()']);
  const gemini = classBox(520, 90, 360, 'GeminiClient', ['+model: string'], ['+extractMulti(image): ContactDraft[]']);
  const dq = classBox(
    970,
    90,
    360,
    'DedupeQueueItem',
    ['+workspace_id: int', '+candidate_a', '+candidate_b', '+score', '+status'],
    ['+merge()', '+dismiss()']
  );
  const draft = classBox(70, 410, 360, 'ContactDraft', ['+fields...', '+confidence'], []);
  const contact = classBox(520, 410, 360, 'Contact', ['+id: int', '+event_id?', '+crm_synced?'], []);
  const svc = classBox(970, 410, 360, 'BulkContactService', [], ['+createMany(drafts[])', '+enqueueDedupe()']);

  content.push(job.svg, gemini.svg, dq.svg, draft.svg, contact.svg, svc.svg);

  content.push(line(430, 150, 520, 150, { arrow: true }));
  content.push(text(475, 140, 'calls', { cls: 'text textSmall' }));
  content.push(line(700, 180, 700, 410, { arrow: true }));
  content.push(text(712, 300, 'produces', { cls: 'text textSmall', anchor: 'start' }));

  content.push(line(840, 520, 970, 520, { arrow: true }));
  content.push(text(905, 510, 'enqueues', { cls: 'text textSmall' }));

  return {
    name: 'class_3_group_scan_data_quality',
    width,
    height,
    svg: svgDoc({ width, height, content: content.join('\n') })
  };
}

function buildClassEmail() {
  const width = 1400;
  const height = 840;
  const content = [];
  content.push(text(width / 2, 40, 'Class Diagram: Email Marketing (Campaigns + Sends + Tracking)', { cls: 'text textTitle' }));

  const camp = classBox(
    70,
    90,
    360,
    'EmailCampaign',
    ['+id: int', '+workspace_id: int', '+subject: string', '+body: text', '+status'],
    ['+send()']
  );
  const list = classBox(520, 90, 330, 'EmailList', ['+id: int', '+name: string'], ['+addContact()', '+removeContact()']);
  const send = classBox(
    900,
    90,
    420,
    'EmailSend',
    ['+id: int', '+campaign_id: int', '+recipient: string', '+status', '+opened_at?'],
    []
  );
  const smtp = classBox(70, 430, 420, 'SmtpProvider', ['+host', '+user', '+pass'], ['+sendMail(to, subject, body)']);
  const tracker = classBox(560, 430, 360, 'TrackingService', [], ['+recordOpen()', '+recordClick()']);
  const api = classBox(980, 430, 340, 'EmailAPI', [], ['+POST /email/campaigns', '+POST /email/campaigns/:id/send', '+POST /email/events']);

  content.push(camp.svg, list.svg, send.svg, smtp.svg, tracker.svg, api.svg);

  content.push(line(430, 150, 520, 150, { arrow: true }));
  content.push(text(475, 140, 'targets', { cls: 'text textSmall' }));
  content.push(line(850, 150, 900, 150, { arrow: true }));
  content.push(text(875, 140, 'creates', { cls: 'text textSmall' }));

  content.push(line(490, 520, 560, 520, { arrow: true }));
  content.push(text(525, 510, 'events', { cls: 'text textSmall' }));

  return {
    name: 'class_4_email_campaign_system',
    width,
    height,
    svg: svgDoc({ width, height, content: content.join('\n') })
  };
}

function buildClassBilling() {
  const width = 1400;
  const height = 820;
  const content = [];
  content.push(text(width / 2, 40, 'Class Diagram: Billing (Razorpay) + Invoices', { cls: 'text textTitle' }));

  const order = classBox(
    70,
    90,
    380,
    'BillingOrder',
    ['+id: int', '+user_id: int', '+plan_id: string', '+amount_paise: int', '+razorpay_order_id'],
    ['+markPaid()']
  );
  const invoice = classBox(520, 90, 340, 'Invoice', ['+id: int', '+workspace_id: int', '+invoice_number: string', '+amount', '+status'], []);
  const method = classBox(900, 90, 420, 'PaymentMethod', ['+id: int', '+workspace_id: int', '+brand', '+last4', '+is_primary'], []);
  const rp = classBox(70, 430, 420, 'RazorpayClient', ['+keyId', '+keySecret'], ['+createOrder()', '+verifySignature()']);
  const svc = classBox(560, 430, 420, 'BillingService', [], ['+createOrder(user, plan)', '+verifyPayment(payload)', '+upgradeTier(user, plan)']);
  const api = classBox(
    1040,
    430,
    320,
    'BillingAPI',
    [],
    ['+POST /billing/create-order', '+POST /billing/verify-payment', '+GET /workspace/billing/overview']
  );

  content.push(order.svg, invoice.svg, method.svg, rp.svg, svc.svg, api.svg);

  content.push(line(450, 150, 520, 150, { arrow: true }));
  content.push(text(485, 140, 'creates', { cls: 'text textSmall' }));
  content.push(line(860, 150, 900, 150, { arrow: true }));
  content.push(text(880, 140, 'stores', { cls: 'text textSmall' }));

  content.push(line(280, 430, 280, 350, { arrow: true }));
  content.push(line(280, 350, 770, 350, { arrow: true }));
  content.push(line(770, 350, 770, 430, { arrow: true }));
  content.push(text(520, 340, 'used by', { cls: 'text textSmall' }));

  content.push(line(770, 430, 770, 390, { arrow: true }));
  content.push(line(770, 390, 1200, 390, { arrow: true }));
  content.push(line(1200, 390, 1200, 430, { arrow: true }));
  content.push(text(980, 380, 'exposed via', { cls: 'text textSmall' }));

  return {
    name: 'class_5_billing_razorpay',
    width,
    height,
    svg: svgDoc({ width, height, content: content.join('\n') })
  };
}

async function renderPng({ svg, pngPath }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 2200, height: 1600 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:white;}</style></head><body>${svg}</body></html>`,
    { waitUntil: 'domcontentloaded' }
  );
  const locator = page.locator('svg').first();
  await locator.waitFor();
  await locator.screenshot({ path: pngPath });
  await page.close();
  await context.close();
  await browser.close();
}

function buildAllDiagrams() {
  // Filled in by later patches (added in chunks to avoid Windows command-length limits).
  return [
    buildUseCaseDiagram(),
    buildActivityAuth(),
    buildActivitySingleScan(),
    buildActivityGroupScan(),
    buildActivityEmailCampaign(),
    buildActivityBilling(),
    buildSequenceAuth(),
    buildSequenceSingleScan(),
    buildSequenceGroupScan(),
    buildSequenceEmailCampaign(),
    buildSequenceBilling(),
    buildClassAuth(),
    buildClassSingleScan(),
    buildClassGroupScan(),
    buildClassEmail(),
    buildClassBilling()
  ];
}

async function main() {
  ensureDir(OUT_SVG_DIR);
  ensureDir(OUT_PNG_DIR);

  const diagrams = buildAllDiagrams();
  console.log(`[diagrams] Generating ${diagrams.length} diagrams...`);

  for (const d of diagrams) {
    const svgPath = path.join(OUT_SVG_DIR, `${d.name}.svg`);
    const pngPath = path.join(OUT_PNG_DIR, `${d.name}.png`);
    fs.writeFileSync(svgPath, d.svg, 'utf8');
    await renderPng({ svg: d.svg, pngPath });
    console.log(`[diagrams] Wrote: ${path.relative(ROOT, pngPath)}`);
  }

  console.log('[diagrams] Done.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
