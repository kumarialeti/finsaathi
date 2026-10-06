import { z } from 'zod';

export const profileSchema = z.object({
  monthly_income: z.number().positive().optional(),
  income_type: z.string().optional(),
  monthly_savings_target: z.number().positive().optional(),
});
