import { AppDataSource } from '../db/datasource';
import { ColorGroup } from '../entities';

export const colorGroupRepository = AppDataSource.getRepository(ColorGroup);
