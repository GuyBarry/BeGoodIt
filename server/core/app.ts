import "dotenv/config";
import express, { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { serverConfig } from "./src/config/server.config";
import { swaggerSpec } from "./src/config/swagger.config";
import {
  colorGroupRouter,
  garmentCategoryRouter,
  genderRouter,
  seasonRouter,
  imagesRouter,
} from "./src/controllers";
import { errorHandler } from "./src/middlewares/error.middleware";
import { AppDataSource } from "./src/db/datasource";

const PORT = serverConfig.port;

export const initApp = async (): Promise<Express> => {
  const app: Express = express();

  app.use(express.json());
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/images", imagesRouter);
  app.use("/color-groups", colorGroupRouter);
  app.use("/garment-categories", garmentCategoryRouter);
  app.use("/genders", genderRouter);
  app.use("/seasons", seasonRouter);

  app.use(errorHandler);

  app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Welcome to BeGoodIt API" });
  });

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