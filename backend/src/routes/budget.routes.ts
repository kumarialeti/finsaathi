import { Router } from 'express';
import prisma from '../utils/prisma';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

// Create budget
router.post('/', async (req: any, res: any) => {
  try {
    const { category, amount, month, year } = req.body;
    
    if (!category || !amount || !month || !year) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const budget = await prisma.budget.create({
      data: {
        user_id: req.user.id,
        category,
        amount: Number(amount),
        month: Number(month),
        year: Number(year)
      }
    });

    res.status(201).json({ success: true, data: budget });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
       return res.status(400).json({ success: false, message: 'Budget for this category and month already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get budgets with status
router.get('/', async (req: any, res: any) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Missing month/year' });
    }

    const budgets = await prisma.budget.findMany({
      where: {
        user_id: req.user.id,
        month: Number(month),
        year: Number(year)
      }
    });

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: req.user.id,
        transaction_type: 'EXPENSE',
        date: { gte: startDate, lte: endDate }
      }
    });

    const categorySpending: Record<string, number> = {};
    transactions.forEach(t => {
      const cat = t.category || 'Uncategorized';
      categorySpending[cat] = (categorySpending[cat] || 0) + Number(t.amount);
    });

    const enrichedBudgets = budgets.map(b => {
      const spent = categorySpending[b.category] || 0;
      return {
        ...b,
        spent
      };
    });

    res.json({ success: true, data: enrichedBudgets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Edit budget
router.put('/:id', async (req: any, res: any) => {
  try {
    const { amount } = req.body;
    const budget = await prisma.budget.update({
      where: { id: req.params.id, user_id: req.user.id },
      data: { amount: Number(amount) }
    });
    res.json({ success: true, data: budget });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete budget
router.delete('/:id', async (req: any, res: any) => {
  try {
    await prisma.budget.delete({
      where: { id: req.params.id, user_id: req.user.id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
