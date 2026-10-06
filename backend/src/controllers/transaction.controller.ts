import { Response } from 'express';
import prisma from '../utils/prisma';
import { transactionSchema } from '../validators/transaction.validator';
import { AuthRequest } from '../middleware/auth.middleware';

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = transactionSchema.parse(req.body);
    const userId = req.user!.id;

    const transaction = await prisma.transaction.create({
      data: {
        ...validatedData,
        user_id: userId,
        date: new Date(validatedData.date),
      },
    });

    res.status(201).json({ success: true, data: { transaction } });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    } else {
      console.error('Create transaction error:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
    }
  }
};

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { month, year, category, type } = req.query;

    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0); // last day of month
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const whereClause: any = { user_id: userId, ...dateFilter };
    if (category) whereClause.category = category;
    if (type) whereClause.transaction_type = type;

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    res.json({ success: true, data: { transactions } });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const validatedData = transactionSchema.partial().parse(req.body);

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction || existingTransaction.user_id !== userId) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Transaction not found' } });
      return;
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
      },
    });

    res.json({ success: true, data: { transaction } });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } });
    } else {
      console.error('Update transaction error:', error);
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
    }
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction || existingTransaction.user_id !== userId) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Transaction not found' } });
      return;
    }

    await prisma.transaction.delete({
      where: { id },
    });

    res.json({ success: true, data: { message: 'Transaction deleted successfully' } });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
};
