import { AppDataSource } from '../db/datasource';
import { Style } from '../db/entities';

export const styleRepository = AppDataSource.getRepository(Style);
