import cors from "cors";
import "dotenv/config";
import express, { Express, Request, Response } from "express";
import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { serverConfig } from "./src/config/server.config";
import { swaggerSpec } from "./src/config/swagger.config";
import {
  authRouter,
  bodyRouter,
  closetRouter,
  clothingItemRouter,
  colorGroupRouter,
  fittingRoomRouter,
  garmentCategoryRouter,
  genderRouter,
  imagesRouter,
  outfitRouter,
  seasonRouter,
  smartBuyRouter,
  userRouter,
} from "./src/controllers";
import { AppDataSource } from "./src/db/datasource";
import { errorHandler } from "./src/middlewares/error.middleware";
import { noRouteHandler } from "./src/middlewares/noRoute.middleware";

const PORT = serverConfig.port;

export const initApp = async (): Promise<Express> => {
  const app: Express = express();

  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // In production, serve the built client static files
  if (serverConfig.env === 'production') {
    app.use(express.static(path.resolve(__dirname, 'client')));
  }

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

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ message: "BeGoodIt API Is Up" });
  });

  // In production, serve index.html for all unmatched routes (SPA navigation)
  if (serverConfig.env === 'production') {
    app.get(/(.*)/, (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
    });
  }

  app.use(noRouteHandler);
  app.use(errorHandler);

  try {
    await AppDataSource.initialize();
    console.log("Database connection established successfully");

    if (serverConfig.env === 'production') {
      const privateKey = fs.readFileSync(path.join(__dirname, '../certs/key.pem'), 'utf8');
      const certificate = fs.readFileSync(path.join(__dirname, '../certs/cert.pem'), 'utf8');
      const credentials = { key: privateKey, cert: certificate };

      https.createServer(credentials, app).listen(PORT, () => {
        console.log(`Server is running at https://localhost:${PORT}`);
        console.log(`API docs available at https://localhost:${PORT}/api-docs`);
      });
    } else {
      http.createServer(app).listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
        console.log(`API docs available at http://localhost:${PORT}/api-docs`);
      });
    }
  } catch (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  }

  return app;
};

initApp();
