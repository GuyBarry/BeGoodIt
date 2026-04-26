import 'reflect-metadata';
import { DataSource } from 'typeorm';
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
} from './entities';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USER ?? 'begoodit_user',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'begoodit',
  synchronize: false, // Use migrations in production
  logging: process.env.NODE_ENV !== 'production',
  entities: [BodyMapping, ColorGroup, GarmentCategory, Gender, Season, User, OutfitFolder, ClothingItem, Outfit, Image],
  migrations: ['src/db/migrations/**/*.ts'],
  subscribers: [],
});
