import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Hello from the server side!',
        app: 'Netours'
    });
});

app.listen(port, () => {
    console.log(`App runing on port ${port}../`);
})