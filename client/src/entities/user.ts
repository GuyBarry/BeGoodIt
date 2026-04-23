import type { Gender } from './gender';

export interface User {
  id: string;
  username: string;
  email: string;
  profilePictureUrl: string | null;
  genderId: number | null;
  birthdate: string | null;
  heightCm: number | null;
  bodyType: string | null;
  createdAt: string;
  gender?: Gender;
}
