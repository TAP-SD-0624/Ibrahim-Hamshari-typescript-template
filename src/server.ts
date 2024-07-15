import express, { Express } from 'express';
import router from './routes/images';
import dotenv from 'dotenv'
dotenv.config();

import path from 'path';


const app: Express = express();
const port = process.env.PORT;

app.use(express.static(path.join(__dirname, '../public')));

app.use("/", router)


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
})