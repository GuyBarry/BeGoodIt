import { User } from '../db/entities';
import { UpdateUserDto, UserDto } from '../dtos/user.dto';
import { NotFoundException } from '../exceptions';
import { userRepository } from '../repositories';

const toDto = (user: User): UserDto => ({
  id: user.id,
  username: user.username,
  email: user.email,
  profilePictureUrl: user.profilePictureUrl,
  gender: user.gender,
  birthdate: user.birthdate,
  heightCm: user.heightCm,
  bodyType: user.bodyType,
  createdAt: user.createdAt,
});

const getById = async (id: string): Promise<UserDto> => {
  const user = await userRepository.getById(id);
  if (!user) throw new NotFoundException(`User with id ${id} not found`);
  return toDto(user);
};

const update = async (id: string, data: UpdateUserDto): Promise<UserDto> => {
  const existing = await userRepository.getById(id);
  if (!existing) throw new NotFoundException(`User with id ${id} not found`);
  const updated = await userRepository.update(id, data);
  return toDto(updated!);
};

export const userService = {
  getById,
  update,
};
