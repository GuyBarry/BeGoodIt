import { AppDataSource } from '../db/datasource';
import { Gender } from '../db/entities';

export const genderRepository = AppDataSource.getRepository(Gender);
