import express, {Express, Request, Response} from 'express';
import prisma from '../prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validateData } from '../middleware/validate';
import { RegisterUserInput, LoginUserInput, UpdateUserInput, loginUserSchema, registerUserSchema, updateUserSchema } from '../schemas/userSchemas';
import { authMiddleWare } from '../middleware/auth';

const router = express.Router();

//POST Register a new user
router.post('/register', validateData(registerUserSchema) , async (req: Request, res: Response) => {
    const { name, email, password } = req.body as RegisterUserInput;
    if (!name || !email || !password) {
        res.status(400).json({error: 'Email and Password are required'})
        return
    }

    const existingUser = await prisma.user.findUnique({
        where: {email}
    })

    if (existingUser) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try{
        const user = await prisma.user.create({
            data: {name, email, password: hashedPassword}
        })
        res.status(201).json({id: user.id, email: user.email});
    } catch(error){
        console.error('Database error:',error)
        res.status(400).json({error: 'User already exist'});
    }
});

//POST Login a user
router.post('/login', validateData(loginUserSchema), async (req: Request, res: Response) =>{
    const {email, password} = req.body as LoginUserInput;

    if (!email || !password) {
        res.status(400).json({error: 'Email and Password are required'})
        return
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({error: 'Invalid email or password'})
            return
        }

        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET!, {expiresIn: '1h'})
        res.json({message: 'Login Successful', token, user:{email: user.email, name: user.name}})
    } catch (error) {
        console.error('Database error:',error)
        res.status(500).json({error: 'Login Failed'})
    }
})

// PUT update a user profile
router.put('/update-profile', authMiddleWare, validateData(updateUserSchema), async (req: Request & {user?: {userId: number}}, res: Response) => {
    const { name, email, currencyPreference, monthlyIncome } = req.body as UpdateUserInput

    const userId = req.user!.userId;

    if (isNaN(userId)) {
        res.status(400).json({error: 'Invalid user ID'});
    }

    try {
        const user = await prisma.user.findUnique({
            where: {id: userId}
        })
        if (!user) {
        res.status(404).json({error: 'User not found'})
        }
        const updateUserProfile = await prisma.user.update({
            where: {id: userId},
            data: {name, email, currencyPreference, monthlyIncome}
        })
        res.status(200).json({message: 'User Profile Updated Successfully', user: updateUserProfile})
    } catch (error) {
        console.error('Update User Error: ', error)
        res.status(500).json({message: 'Failed to update user profile'})
    }
})

router.delete('/delete-account', authMiddleWare, async (req: Request & {user?: {userId: number}}, res: Response) => {

    const userId = req.user!.userId;

    if (isNaN(userId)) {
        res.status(400).json({error: 'Invalid user ID'});
    }

    try {
        const user = await prisma.user.findUnique({
            where: {id: userId}
        })
        if (!user) {
        res.status(404).json({error: 'User not found'})
        }
        const deleteAccount = await prisma.user.delete({
            where: {id: userId}
        })
        res.status(200).json({message: 'User Profile Deleted Successfully', user: deleteAccount})
    } catch (error) {
        console.error('Delete User Error: ', error)
        res.status(500).json({message: 'Failed to delete user acccount'})
    }
})
export default router