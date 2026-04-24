import "dotenv/config";
import express, { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { serverConfig } from "./src/config/server.config";
import { swaggerSpec } from "./src/config/swagger.config";
import {
  colorGroupRouter,
  garmentCategoryRouter,
  genderRouter,
  imagesRouter,
  seasonRouter,
  userRouter,
} from "./src/controllers";
import { AppDataSource } from "./src/db/datasource";
import { errorHandler } from "./src/middlewares/error.middleware";
import { noRouteHandler } from "./src/middlewares/noRoute.middleware";

const PORT = serverConfig.port;

export const initApp = async (): Promise<Express> => {
  const app: Express = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/images", imagesRouter);
  app.use("/color-groups", colorGroupRouter);
  app.use("/garment-categories", garmentCategoryRouter);
  app.use("/genders", genderRouter);
  app.use("/seasons", seasonRouter);
  app.use("/users", userRouter);

  app.get("/", (_req: Request, res: Response) => {
    res.json({ message: "Welcome to BeGoodIt API" });
  });

  app.use(noRouteHandler);
  app.use(errorHandler);

  try {
    await AppDataSource.initialize();
    console.log("Database connection established successfully");

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
      console.log(`API docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  }

  return app;
};

initApp();
