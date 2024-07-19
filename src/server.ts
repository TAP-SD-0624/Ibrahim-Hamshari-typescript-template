import express, { Express, Request, Response, NextFunction } from 'express';
import router from './routes/images';
import dotenv from 'dotenv'
dotenv.config();

import path from 'path';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, '../public')));

app.use("/", router)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {

    res.status(500).json({ error: err.message});

})

export default app;