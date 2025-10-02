import { z } from 'zod'; // Zod is a TypeScript-first schema validation library

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(1).max(80).optional(),
});

/**
 * - Schema for validating user login input
 * - email: must be a valid email format
 * - password: must be at least 8 characters
 */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Middleware factory for validating request bodies against a Zod schema

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body); // Validate request body safely

    if (!result.success) {
      // Respond with 400 Bad Request and detailed validation errors
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten()
      });
    }

    // Replace request body with validated and sanitized data
    req.body = result.data;
    next(); // Proceed to the next middleware or route handler
  };
}