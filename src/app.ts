//app.ts
import express, { Application } from "express";
import cors from 'cors';
import morgan from 'morgan';

const app: Application = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ message: 'Hello from Express! 🚀'});
});

export default app;