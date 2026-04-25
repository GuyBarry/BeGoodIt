import type { Gender } from './gender';

export interface User {
  id: string;
  username: string;
  email: string;
  profilePictureUrl: string | null;
  gender: Gender | null;
  birthdate: string | null;
  heightCm: number | null;
  bodyType: string | null;
  createdAt: string;
}
