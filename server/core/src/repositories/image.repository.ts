import { AppDataSource } from '../db/datasource';
import { Image } from '../db/entities';

export const imageRepository = AppDataSource.getRepository(Image);
