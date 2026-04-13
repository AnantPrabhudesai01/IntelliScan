const { z } = require('zod');

const scanSchema = z.object({
  imageBase64: z.string().min(1, 'No image provided'),
  mimeType: z.string().optional().default('image/jpeg')
});

module.exports = {
  scanSchema
};
