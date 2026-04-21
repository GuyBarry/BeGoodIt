import { AppDataSource } from '../db/datasource';
import { Season } from '../entities';

export const seasonRepository = AppDataSource.getRepository(Season);
