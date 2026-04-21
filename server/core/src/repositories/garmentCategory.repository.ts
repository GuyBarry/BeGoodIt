import { AppDataSource } from '../db/datasource';
import { GarmentCategory } from '../entities';

export const garmentCategoryRepository = AppDataSource.getRepository(GarmentCategory);
