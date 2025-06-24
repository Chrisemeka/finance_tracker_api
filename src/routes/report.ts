import express, {Express, Request, Response} from 'express';
import prisma from '../prisma';
import { authMiddleWare } from '../middleware/auth';


const router = express.Router();

// GET - report of financial data for current month
router.get('/monthly', authMiddleWare, async (req: Request & {user?: {userId: number}}, res: Response) => {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7)
        //  Create date range for the current month
        const startOfMonth = new Date(`${currentMonth}-01T00:00:00.000Z`);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(startOfMonth.getMonth() + 1);

        // calculate total income and expenses
        const transaction = await prisma.transaction.groupBy({
            by: ['type'],
            where: {
                userId: req.user!.userId,
                date: {
                    gte: startOfMonth, 
                    lt: endOfMonth
                }
            },
            _sum: {
                amount: true
            }
        })

         const totalIncome = transaction.find(t => t.type === 'income')?._sum.amount
         const totalExpense = transaction.find(e => e.type === 'expense')?._sum.amount;

         const income = Number(totalIncome || 0)
         const expense = Number(totalExpense || 0)

         const savings = income - expense;
         const savingsRate = income > 0 ? (savings / income) * 100 : 0

         res.status(200).json({
            month: currentMonth,
            income,
            expense,
            savings,
            savingsRate: Number(savingsRate.toFixed(2))

         })
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Failed to generate report'})
    }
})

export default router