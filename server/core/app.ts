import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/config/swagger.config';
import { serverConfig } from './src/config/server.config';
import { ImagesController } from './src/images/images.controller';
import { ImagesService } from './src/images/images.service';
import { FirebaseStorageClient } from './src/firebase/firebase.storage';

const app: Express = express();
const PORT = serverConfig.port;

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const storageClient = new FirebaseStorageClient();
const imagesService = new ImagesService(storageClient);
const imagesController = new ImagesController(imagesService);

app.use(imagesController.router);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to BeGoodIt API' });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`API docs available at http://localhost:${PORT}/api-docs`);
});

export default app;
