import express, {Express, Request, Response} from 'express';
import { Transaction } from '@prisma/client';
import prisma from '../prisma';
import { authMiddleWare } from '../middleware/auth';
import { validateData } from '../middleware/validate';
import { CreateTransactionInput, createTransactionSchema, UpdateTransactionInput, updateTransactionSchema } from '../schemas/transactionSchemas';

const router = express.Router();

// GET all user transactionss
router.get('/transactions', authMiddleWare, async (req: Request & { user?: { userId: number } }, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user!.userId },
      skip,
      take: limit,
      orderBy: { date: 'desc' }, // Most recent first
    });

    const total = await prisma.transaction.count({ where: { userId: req.user!.userId } });
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET a single transaction
router.get('/transactions/:id', authMiddleWare, async (req: Request & {user?: {userId: number}}, res: Response) => {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
        res.status(400).json({error: 'Invalid task ID'})
    }

    try {
        const transactions: Transaction | null = await prisma.transaction.findUnique({
            where:{id:id}
        });
        res.status(201).json(transactions);
    } catch (error) {
        console.error('Database Error: ', error)
        res.status(500).json({error: 'Failed to fetch transaction'})
    }
})

// POST a new user transaction
router.post('/transactions', authMiddleWare, validateData(createTransactionSchema), async (req: Request & {user?: {userId: number}}, res: Response): Promise<void> => {
    const { type, category, amount, description, date } = req.body as CreateTransactionInput

    const userId = req.user!.userId;

    const normalizedCategory = category.toLowerCase();

    try {
        // convert date string to date object
        let transactionDate: Date;
        if (date) {
            transactionDate = new Date(date); //  This converts "2025-06-04" to proper Date
        } else {
            transactionDate = new Date();
        }

        // ✅ Validate the date is valid
        if (isNaN(transactionDate.getTime())) {
            res.status(400).json({error: 'Invalid date format'});
            return;
        }


        const newTransaction: Transaction = await prisma.transaction.create({
            data: {userId, type, category: normalizedCategory, amount, description, date: transactionDate  }
        })

        res.status(201).json({
            message: 'Transaction creates successfully',
            transaction: newTransaction
        });
    } catch (error) {
        console.error('Create Transaction Error: ', error)
        res.status(500).json({message: 'Failed to create transaction'})
    }
})

// PUT update user transaction
router.put('/transactions/:id', authMiddleWare, validateData(updateTransactionSchema), async (req: Request & {user?: {userId: number}}, res: Response): Promise<void> => {
    const { type, category, amount, description, date } = req.body as UpdateTransactionInput

    const id = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(id)) {
        res.status(400).json({error: 'Invalid transaction ID'});
    }

    try {
        const transaction = await prisma.transaction.findUnique({
            where:{id: id}
        })

        if (!transaction) {
        res.status(404).json({error: 'Transaction not found'})
        } else {
            if (transaction.userId !== userId) {
                res.status(403).json({error: 'Unauthorized'})
            }
        }

        const updateTransaction = await prisma.transaction.update({
            where: {
                id: id
            },
            data: {type, category, amount, description, date}
        })
        res.status(200).json({message: 'Task Updated Successfully', task: updateTransaction})
    } catch (error) {
        console.error('Update Transaction Error: ', error)
        res.status(500).json({message: 'Failed to update transaction'})   
    }
})

// DELETE a transaction
router.delete('/transactions/:id', authMiddleWare, async (req: Request & {user?: {userId: number}}, res: Response) => {
    const id = parseInt(req.params.id)
    const userId = req.user!.userId;


    if (isNaN(id)) {
        res.status(400).json({error: 'Invalid task ID'});
    }

    try {
        const transaction = await prisma.transaction.findUnique({  
            where: {id: id}
        })

        if (!transaction) {
        res.status(404).json({error: 'Transaction not found'})
        } else {
            if (transaction.userId !== userId) {
                res.status(403).json({error: 'Unauthorized'})
            }
        }

        const deletedTransaction = await prisma.transaction.delete({
            where: {id: id}
        })
        res.status(200).json({message: 'Transaction Deleted Successfully', transaction: deletedTransaction})
    } catch (error) {
        console.error('Database Error: ', error)
        res.status(500).json({error: 'Database error'})
    }
})

export default router