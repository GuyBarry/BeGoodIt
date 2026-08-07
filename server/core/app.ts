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
import { authMiddleware } from "./src/middlewares/auth.middleware";
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
    app.use(express.static(path.resolve(__dirname, '../client')));
  }

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Public routes — no authentication required
  app.use("/auth", authRouter);
  app.use("/color-groups", colorGroupRouter);
  app.use("/garment-categories", garmentCategoryRouter);
  app.use("/genders", genderRouter);
  app.use("/seasons", seasonRouter);
  // Image blobs are referenced directly from <img src> tags (no Authorization
  // header), so they stay public — same as static uploads in the reference app.
  app.use("/images", imagesRouter);

  // Protected routes — require a valid Bearer access token
  app.use("/body", authMiddleware, bodyRouter);
  app.use("/clothing-items", authMiddleware, clothingItemRouter);
  app.use("/users", authMiddleware, userRouter);
  app.use("/closet", authMiddleware, closetRouter);
  app.use("/fitting-room", authMiddleware, fittingRoomRouter);
  app.use("/smart-buy", authMiddleware, smartBuyRouter);
  app.use("/outfits", authMiddleware, outfitRouter);

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ message: "BeGoodIt API Is Up" });
  });

  // In production, serve index.html for all unmatched routes (SPA navigation)
  if (serverConfig.env === 'production') {
    app.get(/(.*)/, (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, '../client', 'index.html'));
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
