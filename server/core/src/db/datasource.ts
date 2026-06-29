import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { requireEnv } from '../config/env';
import {
  BodyMapping,
  ClothingItem,
  ColorGroup,
  GarmentCategory,
  Gender,
  Image,
  Outfit,
  OutfitFolder,
  Season,
  User,
  SmartBuyTest,
} from './entities';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: requireEnv('DB_USER', 'begoodit_user'),
  password: requireEnv('DB_PASSWORD', 'begoodit_password'),
  database: requireEnv('DB_NAME', 'begoodit'),
  synchronize: false, // Use migrations in production
  logging: process.env.DB_LOGGING !== 'false' && process.env.NODE_ENV !== 'production',
  entities: [BodyMapping, ColorGroup, GarmentCategory, Gender, Season, User, OutfitFolder, ClothingItem, Outfit, Image, SmartBuyTest],
  migrations: ['src/db/migrations/**/*.ts'],
  subscribers: [],
});
