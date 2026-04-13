# IntelliScan: AI Prompt Engineering Documentation

> **Module Location:** `intelliscan-server/src/config/prompts.js`
> **Architecture:** Centralized prompt factory module with Chain-of-Thought (CoT) reasoning
> **Engines:** Gemini 2.5 Flash (Primary) → OpenAI GPT-4o-mini (Fallback) → Tesseract.js + Heuristics (Offline)

---

## Prompt Architecture Overview

All AI prompts are exported as **factory functions** from a centralized module. This ensures:
- **Consistency**: All prompts follow the same multi-phase CoT pattern
- **Testability**: Prompts can be unit-tested independently
- **Maintainability**: Single source of truth for all AI instructions
- **Dynamic Context**: Functions accept parameters (user tier, sender name, etc.)

### Taxonomies
The module defines two standardized taxonomies used across all prompts:

**Industry Taxonomy (18 categories):**
Technology / Software, Financial Services / Banking, Healthcare / Pharmaceuticals, Real Estate / Construction, Manufacturing / Industrial, Education / Research, Retail / E-Commerce, Media / Entertainment, Legal / Compliance, Consulting / Professional Services, Government / Public Sector, Telecommunications, Energy / Utilities, Hospitality / Travel, Non-Profit / NGO, Logistics / Supply Chain, Automotive, Agriculture / Food Tech

**Seniority Taxonomy (6 tiers):**
CXO / Founder → VP / Director → Senior Manager / Head → Mid-Level → Senior Individual Contributor → Entry-Level / Associate

---

## Prompt 1: Single Business Card Extraction (`getSingleCardPrompt`)

### Purpose
Extracts, normalizes, enriches, and validates all contact information from a single business card image.

### Chain-of-Thought Pipeline
```
PHASE 1 → Image Classification (Accept/Reject the image)
PHASE 2 → Multi-Step Extraction:
   Step 1: Vision Analysis (layout, orientation, print quality)
   Step 2: Raw Text Extraction (all text elements, spatial relationships)
   Step 3: Entity Recognition (name, company, title, email, phone, website, address)
   Step 4: Semantic Enrichment (industry, seniority, deal score, LinkedIn prediction)
   Step 5: Cross-Validation (email domain ↔ company name consistency check)
PHASE 3 → Structured JSON Output
```

### Deal Score Algorithm (AI-guided, 0-100)
| Factor | Points |
|---|---|
| CXO/Founder title | +30 |
| VP/Director title | +20 |
| Enterprise email domain (not gmail/yahoo) | +20 |
| Fortune 500 / major company | +15 |
| Complete contact info (email + phone + address) | +15 |
| Base score | 20 |

### Full Prompt Text
```text
You are IntelliScan AI — an enterprise-grade, multi-lingual business card OCR and intelligence engine.
Your task is to extract, normalize, enrich, and validate all contact information from a business card image.

═══════════════════════════════════════════
PHASE 1: IMAGE CLASSIFICATION & VALIDATION
═══════════════════════════════════════════
Before extracting any data, classify the image:

ACCEPT if the image contains:
  ✓ A single business card (standard ~3.5×2 inch or ~90×55mm format)
  ✓ An ID card, membership card, or name badge with contact details
  ✓ A visiting card in any language, script, or orientation (vertical/horizontal)
  ✓ A digital screenshot of a business card

REJECT if the image contains:
  ✗ A selfie, portrait, or photograph of a person (not a card)
  ✗ A random scene, landscape, or document unrelated to a contact card
  ✗ Multiple separate business cards (send these to the Group Scanner instead)
  ✗ A blank or heavily damaged/unreadable card
  ✗ A receipt, invoice, menu, or non-contact document

For REJECTED images, return ONLY:
{"rejected": true, "reason": "<specific reason why this image was rejected>"}

═══════════════════════════════════════════
PHASE 2: CHAIN-OF-THOUGHT EXTRACTION
═══════════════════════════════════════════
For ACCEPTED images, follow this multi-step reasoning process internally:

STEP 1 — VISION ANALYSIS (do not output this, use it for reasoning):
  • Identify card orientation (horizontal vs. vertical)
  • Note the primary language/script (Latin, Devanagari, CJK, Arabic, etc.)
  • Assess print quality and readability (crisp, blurry, low contrast, glare)
  • Identify the visual hierarchy: logo position, name prominence, font sizes

STEP 2 — RAW TEXT EXTRACTION:
  • Read every text element on the card, preserving spatial relationships
  • For non-Latin scripts: extract BOTH the native text AND a romanized/transliterated version
  • Distinguish between: decorative text (slogans/taglines) vs. contact data

STEP 3 — ENTITY RECOGNITION & NORMALIZATION:
  • NAME: Extract the person's full name. Apply proper capitalization (Title Case).
  • COMPANY: Extract the company/organization name. Preserve the official spelling.
  • TITLE: Extract the job title/designation. Standardize common abbreviations.
  • EMAIL: Extract and validate email format (must contain @ and valid TLD).
  • PHONE: Extract and normalize to E.164-like format where possible.
  • WEBSITE: Extract and normalize (ensure http/https prefix if missing).
  • ADDRESS: Extract the full physical address, preserving structure.

STEP 4 — SEMANTIC ENRICHMENT (AI Inference):
  • INDUSTRY: Infer from 18-category taxonomy
  • SENIORITY: Infer from 6-tier taxonomy
  • DEAL SCORE: 0-100 integer using weighted scoring algorithm
  • LINKEDIN URL: Predict if not printed on card
  • LINKEDIN BIO: 20-word professional summary

STEP 5 — CROSS-VALIDATION:
  • Verify email domain ↔ company name consistency
  • Verify job title ↔ company type consistency
  • Adjust confidence score based on inconsistencies

═══════════════════════════════════════════
PHASE 3: OUTPUT FORMAT
═══════════════════════════════════════════
Return ONLY a valid JSON object with all extracted and enriched fields.
```

---

## Prompt 2: Multi-Card Group Photo Extraction (`getMultiCardPrompt`)

### Purpose
Extracts data from 2-25 business cards in a single group photograph using spatial reasoning to prevent cross-card data contamination.

### Chain-of-Thought Pipeline
```
PHASE 1 → Spatial Card Detection:
   Step 1: Boundary Detection (identify edges of each card)
   Step 2: Card Count Estimation (handle overlapping/rotated cards)
PHASE 2 → Per-Card Independent Extraction:
   A: Language Detection → B: Raw Text Read → C: Entity Recognition → D: Semantic Enrichment
PHASE 3 → Cross-Card Validation:
   - Duplicate detection (same person appearing twice)
   - Data cross-contamination check
PHASE 4 → Batch Output Assembly
```

### Key Innovation: Spatial Isolation
The prompt instructs the AI to mentally assign each card a **coordinate zone** (top-left, center, bottom-right, etc.) to ensure text from adjacent cards is never mixed together.

---

## Prompt 3: AI Email Draft Generation (`getDraftGenerationPrompt`)

### Purpose
Generates persona-driven follow-up emails after networking events using context-aware CoT reasoning.

### Persona Matrix
| Tone | Behavior |
|---|---|
| **Professional** | Formal paragraphs, no contractions, corporate-safe |
| **Friendly** | Contractions allowed, conversational warmth, emoji-free |
| **Executive** | Ultra-concise (<100 words), authoritative, direct |
| **Cold Outreach** | Pattern-interrupt opening, value-first, clear differentiator |

### Chain-of-Thought Pipeline
```
1. RELATIONSHIP CONTEXT → Post-networking-event follow-up framing
2. PERSONALIZATION STRATEGY → Value proposition based on recipient's role/company
3. SUBJECT LINE ENGINEERING → 4-8 words, curiosity-driven, no spam triggers
4. BODY STRUCTURE → Hook → Value Bridge → Social Proof → CTA → Sign-off
5. TONE APPLICATION → Apply selected persona rules
```

---

## Prompt 4: AI HTML Email Template Generation (`getEmailTemplatePrompt`)

### Purpose
Generates production-ready, mobile-responsive HTML email templates for marketing campaigns.

### Design Requirements
- Inline CSS only (Gmail/Outlook compatible)
- Table-based layout for Outlook rendering
- Mobile-first responsive (max-width: 600px)
- System font stack (Arial, Helvetica, sans-serif)
- Merge tags: `{{name}}`, `{{company}}`, `{{sender_name}}`, `{{unsubscribe_link}}`

---

## Prompt 5: AI Networking Coach (`getNetworkCoachPrompt`)

### Purpose
Analyzes the user's professional network health and provides actionable intelligence.

### Analysis Dimensions
| Dimension | Weight | Calculation |
|---|---|---|
| Freshness | 48 pts | `(1 - stale/total) × 48` |
| Completeness | 40 pts | `(1 - incomplete/total) × 40` |
| Diversity Bonus | 12 pts | Multiple industries = +12, single = +5 |

### Output: 3 Actionable Insights
Each insight includes: `id`, `title`, `description`, `cta` (button text), `color` (urgency indicator).

---

## Why This Matters (Technical Depth)
1. **Chain-of-Thought**: Forces the AI to reason step-by-step, dramatically improving accuracy over single-turn prompts.
2. **Spatial Reasoning**: The multi-card prompt prevents the #1 failure mode in group scanning — data cross-contamination.
3. **Cross-Validation**: The single-card prompt asks the AI to verify its own output (email ↔ company check), reducing hallucination.
4. **Persona-Based Generation**: Email drafts adapt to the user's communication style, not just content.
5. **Centralized Module**: All prompts live in one file (`src/config/prompts.js`), demonstrating professional separation of concerns.
