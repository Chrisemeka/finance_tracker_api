import express, {Express, Request, Response} from 'express';
import userRoutes from './routes/users'
import transactionRoutes from './routes/transactions'
import budgetRoutes from './routes/budgets'
import reportRoutes from './routes/report'
import dotenv from 'dotenv'

dotenv.config()

const app: Express = express();
const port = 5000;

app.use(express.json())

app.use('/users', userRoutes)

app.use('/users', transactionRoutes)

app.use('/users', budgetRoutes)

app.use('/report', reportRoutes)

app.listen(port, () => { // start the server
    console.log(`Server is running on http://localhost:${port}`);
});