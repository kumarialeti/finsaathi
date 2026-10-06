import { Router } from 'express';
import prisma from '../utils/prisma';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/summary', async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        ...dateFilter
      }
    });

    let income = 0;
    let expense = 0;
    const categorySpending: Record<string, number> = {};

    transactions.forEach(t => {
      const amount = Number(t.amount);
      if (t.transaction_type === 'INCOME') {
        income += amount;
      } else if (t.transaction_type === 'EXPENSE') {
        expense += amount;
        const cat = t.category || 'Uncategorized';
        categorySpending[cat] = (categorySpending[cat] || 0) + amount;
      }
    });

    // Sort top categories
    const sortedCategories = Object.entries(categorySpending)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    res.json({
      success: true,
      data: {
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
        topCategories: sortedCategories
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/monthly-trend', async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    
    // Group by month
    const transactions = await prisma.transaction.findMany({
      where: { user_id: userId },
      orderBy: { date: 'asc' }
    });

    const monthlyData: Record<string, { month: string, income: number, expense: number }> = {};

    transactions.forEach(t => {
      const amount = Number(t.amount);
      const monthStr = t.date.toISOString().slice(0, 7); // YYYY-MM
      
      if (!monthlyData[monthStr]) {
        monthlyData[monthStr] = { month: monthStr, income: 0, expense: 0 };
      }

      if (t.transaction_type === 'INCOME') {
        monthlyData[monthStr].income += amount;
      } else {
        monthlyData[monthStr].expense += amount;
      }
    });

    const trendArray = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      success: true,
      data: trendArray
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
