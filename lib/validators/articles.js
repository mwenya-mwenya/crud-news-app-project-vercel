import { z } from 'zod';
// NOT IMPLEMENTED
export const createArticleSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  source: z.string().optional(),
  summary: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isRead: z.boolean().optional(),
});

export const updateArticleSchema = createArticleSchema.partial();