import "dotenv/config";
import express, { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./src/config/swagger.config";
import { errorHandler } from "./src/middlewares/error.middleware";
import { noRouteHandler } from "./src/middlewares/noRoute.middleware";
import { serverConfig } from "./src/config/server.config";
import { imagesRouter } from "./src/images/images.controller";

const app: Express = express();
const PORT = serverConfig.port;

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to BeGoodIt API" });
});

app.use(imagesRouter);

app.use(noRouteHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

export default app;
