import { GenderDto } from "./gender.dto";

export type UserDto = {
  id: string;
  username: string;
  email: string;
  profilePictureUrl: string | null;
  gender: GenderDto | null;
  birthdate: Date | null;
  heightCm: number | null;
  bodyType: string | null;
  createdAt: Date;
};

export type UpdateUserDto = Partial<
  Pick<
    UserDto,
    "username" | "profilePictureUrl" | "birthdate" | "heightCm" | "bodyType"
  > & {
    genderId: GenderDto["id"];
  }
>;
