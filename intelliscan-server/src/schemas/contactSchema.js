const { z } = require('zod');

const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  name_native: z.string().optional().nullable(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  company_native: z.string().optional().nullable(),
  job_title: z.string().optional().or(z.literal('')),
  title: z.string().optional().or(z.literal('')), // Legacy field support
  title_native: z.string().optional().nullable(),
  detected_language: z.string().optional().nullable(),
  confidence: z.number().min(0).max(100).optional().default(95),
  image_url: z.string().optional().nullable(),
  card_image: z.string().optional().nullable(),
  notes: z.string().optional().default(''),
  tags: z.string().optional().default(''),
  engine_used: z.string().optional().default('Gemini 1.5 Flash'),
  event_id: z.number().optional().nullable(),
  inferred_industry: z.string().optional().nullable(),
  inferred_seniority: z.string().optional().nullable()
});

const updateDealSchema = z.object({
  stage: z.string().min(1, 'Stage is required'),
  value: z.number().min(0).optional().default(0),
  notes: z.string().optional().default(''),
  expected_close: z.string().datetime().optional().nullable()
});

const establishRelationshipSchema = z.object({
  from_id: z.number({ required_error: 'From contact ID is required' }),
  to_id: z.number({ required_error: 'To contact ID is required' }),
  type: z.string().min(1, 'Relationship type is required')
});

const enrollSequenceSchema = z.object({
  sequenceId: z.number().optional(),
  sequence_id: z.number().optional() // Supporting both camel and snake case
}).refine(data => data.sequenceId || data.sequence_id, {
  message: "Sequence ID is required",
  path: ["sequenceId"]
});

module.exports = {
  createContactSchema,
  updateDealSchema,
  establishRelationshipSchema,
  enrollSequenceSchema
};
