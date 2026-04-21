import { AppDataSource } from '../db/datasource';
import { Gender } from '../entities';

export const genderRepository = AppDataSource.getRepository(Gender);
