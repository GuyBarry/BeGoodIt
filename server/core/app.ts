import express, { Express, Request, Response } from 'express';

const app: Express = express();
const PORT = 3000;

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to BeGoodIt API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export default app;
