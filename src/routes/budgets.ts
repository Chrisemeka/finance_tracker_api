import express, {Express, Request, Response} from 'express';
import { Budget } from '@prisma/client';
import prisma from '../prisma';
import { authMiddleWare } from '../middleware/auth';
import { validateData } from '../middleware/validate';
import { CreateBudgetInput, createBudgetSchema} from '../schemas/budgetSchemas';

const router = express.Router();

// POST to create a new budget
router.post('/budgets', authMiddleWare, validateData(createBudgetSchema), async (req: Request & {user?: {userId: number}}, res: Response) => {
    const { category, amount, month } = req.body as CreateBudgetInput

    if (!category || !amount || !month) {
        res.status(400).json({error: 'Category, amount, and month are required'})
    }

    try {
        const existingBudget = await prisma.budget.findFirst({
            where: {
                userId: req.user!.userId,
                category: category,
                month: month,
            }
        })

        if (existingBudget) {
            res.status(409).json({error: 'Budget already exists for this category and month', budget: existingBudget}) 
        }

        const newBudget = await prisma.budget.create({
            data: {
                userId: req.user!.userId,
            category: category,
            amount,
            month: month,
            }
        });

        res.status(201).json({
            message: 'New Budget Created',
            budget: newBudget        
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to create budget' });
    }
})

// GET budget for the current month 
router.get('/budgets/', authMiddleWare, async (req: Request & {user?: {userId: number}}, res: Response) => {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2025-06"
        
        //  Create date range for the current month
        const startOfMonth = new Date(`${currentMonth}-01T00:00:00.000Z`);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(startOfMonth.getMonth() + 1);

        //  Fetch budgets by date range
        const budgets = await prisma.budget.findMany({
            where: {
                userId: req.user!.userId,
                month: {
                    gte: startOfMonth,  // >= 2025-06-01T00:00:00.000Z
                    lt: endOfMonth      // < 2025-07-01T00:00:00.000Z
                }
            }
        });

        // Calculate total spending per category
        const spending = await prisma.transaction.groupBy({
            by: ['category'],
            where: {
                userId: req.user!.userId,
                date: {
                    gte: startOfMonth,
                    lt: endOfMonth
                },
            },
            _sum: {
                amount: true,
            }
        });

        // Map spending data to budgets
        const budgetWithSpending = budgets.map(budget => {
            const categorySpending = spending.find(s => 
                s.category.toLowerCase() === budget.category.toLowerCase() // ✅ Fixed typo
            );

            const totalSpent = categorySpending?._sum.amount || 0;
            const overspent = totalSpent > budget.amount;

            return {
                ...budget,
                totalSpent,
                overspent,
            };
        });

        res.status(200).json(budgetWithSpending);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch budgets' }); // ✅ Changed to 500
    }
});

export default router