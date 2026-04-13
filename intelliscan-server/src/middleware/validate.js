const { z } = require('zod');

/**
 * Middleware to validate request data against a Zod schema.
 * @param {z.ZodSchema} schema - The Zod schema to validate against
 * @param {string} source - Where the data comes from: 'body', 'query', or 'params' (default 'body')
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    const dataToValidate = req[source];
    const validatedData = schema.parse(dataToValidate);
    
    // Replace the request data with the validated/parsed data (handles coercion, etc.)
    req[source] = validatedData;
    
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    next(error);
  }
};

module.exports = validate;
