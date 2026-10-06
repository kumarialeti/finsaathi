import { z } from 'zod';

export const transactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  transaction_type: z.enum(['INCOME', 'EXPENSE']),
  merchant: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  date: z.string().datetime().or(z.date()),
  upi_reference: z.string().optional().nullable(),
  source: z.enum(['MANUAL', 'CSV', 'BANK_STATEMENT', 'AUTHORIZED_INTEGRATION']).default('MANUAL'),
});
