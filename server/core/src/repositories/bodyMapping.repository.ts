import { AppDataSource } from '../db/datasource';
import { BodyMapping } from '../db/entities';

export const bodyMappingRepository = AppDataSource.getRepository(BodyMapping);
