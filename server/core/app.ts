import "dotenv/config";
import cors from "cors";
import express, { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { serverConfig } from "./src/config/server.config";
import { swaggerSpec } from "./src/config/swagger.config";
import { requireEnv } from "./src/config/env";
import {
  authRouter,
  bodyRouter,
  clothingItemRouter,
  closetRouter,
  colorGroupRouter,
  fittingRoomRouter,
  garmentCategoryRouter,
  genderRouter,
  imagesRouter,
  seasonRouter,
  userRouter,
  smartBuyRouter,
  outfitRouter,
} from "./src/controllers";
import { AppDataSource } from "./src/db/datasource";
import { errorHandler } from "./src/middlewares/error.middleware";
import { noRouteHandler } from "./src/middlewares/noRoute.middleware";

const PORT = serverConfig.port;

export const initApp = async (): Promise<Express> => {
  const app: Express = express();

  app.use(cors({ origin: requireEnv('CLIENT_URL', 'http://localhost:5173') }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/auth", authRouter);
  app.use("/body", bodyRouter);
  app.use("/clothing-items", clothingItemRouter);
  app.use("/images", imagesRouter);
  app.use("/color-groups", colorGroupRouter);
  app.use("/garment-categories", garmentCategoryRouter);
  app.use("/genders", genderRouter);
  app.use("/seasons", seasonRouter);
  app.use("/users", userRouter);
  app.use("/closet", closetRouter);
  app.use("/fitting-room", fittingRoomRouter);
  app.use("/smart-buy", smartBuyRouter);
  app.use("/outfits", outfitRouter);

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
