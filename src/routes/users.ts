import express, {Express, Request, Response} from 'express';
import prisma from '../prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validateData } from '../middleware/validate';
import { RegisterUserInput, LoginUserInput, loginUserSchema, registerUserSchema } from '../schemas/userSchemas';

const router = express.Router();

// Register a new user
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

// Login a user
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

export default router