import express, {Express, Request, Response} from 'express';
import userRoutes from './routes/users'
import dotenv from 'dotenv'

dotenv.config()

const app: Express = express();
const port = 5000;

app.use(express.json())

app.use('/users', userRoutes)

app.listen(port, () => { // start the server
    console.log(`Server is running on http://localhost:${port}`);
});