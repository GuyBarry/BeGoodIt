import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/config/swagger.config';
import { errorHandler } from './src/middlewares/error.middleware';
import { serverConfig } from './src/config/server.config';
import { imagesRouter } from './src/images/images.controller';

const app: Express = express();
const PORT = serverConfig.port;

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(imagesRouter);

app.use(errorHandler);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to BeGoodIt API' });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`API docs available at http://localhost:${PORT}/api-docs`);
});

export default app;
