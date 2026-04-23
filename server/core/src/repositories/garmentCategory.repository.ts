import { AppDataSource } from '../db/datasource';
import { GarmentCategory } from '../db/entities';

export const garmentCategoryRepository = AppDataSource.getRepository(GarmentCategory);
