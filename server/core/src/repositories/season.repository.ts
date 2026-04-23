import { AppDataSource } from '../db/datasource';
import { Season } from '../db/entities';

export const seasonRepository = AppDataSource.getRepository(Season);
