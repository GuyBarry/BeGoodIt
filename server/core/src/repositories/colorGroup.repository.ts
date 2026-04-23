import { AppDataSource } from '../db/datasource';
import { ColorGroup } from '../db/entities';

export const colorGroupRepository = AppDataSource.getRepository(ColorGroup);
