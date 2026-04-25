import { userService } from '../../services/user.service';
import { userRepository } from '../../repositories/user.repository';
import { NotFoundException } from '../../exceptions/httpExceptions';
import { User } from '../../db/entities';

jest.mock('../../repositories/user.repository', () => ({
  userRepository: {
    getById: jest.fn(),
    update: jest.fn(),
  },
}));

describe('userService', () => {
  const mockUser: User = {
    id: 'uuid-1234',
    username: 'john_doe',
    email: 'john@example.com',
    passwordHash: 'hashed',
    profilePictureUrl: null,
    genderId: 1,
    gender: { id: 1, name: 'Male', users: [] } as any,
    birthdate: null,
    heightCm: null,
    bodyType: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    outfitFolders: [],
    clothingItems: [],
    outfits: [],
  } as User;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return a UserDto when user is found', async () => {
      (userRepository.getById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getById('uuid-1234');

      expect(userRepository.getById).toHaveBeenCalledWith('uuid-1234');
      expect(result).toMatchObject({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        gender: { id: 1, name: 'Male' },
      });
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('should throw NotFoundException when user is not found', async () => {
      (userRepository.getById as jest.Mock).mockResolvedValue(null);

      await expect(userService.getById('uuid-9999')).rejects.toThrow(NotFoundException);
      await expect(userService.getById('uuid-9999')).rejects.toThrow(
        'User with id uuid-9999 not found',
      );
    });

    it('should propagate repository errors', async () => {
      (userRepository.getById as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(userService.getById('uuid-1234')).rejects.toThrow('DB error');
    });
  });

  describe('update', () => {
    const updateData = { username: 'jane_doe', heightCm: 170 };
    const updatedUser: User = { ...mockUser, username: 'jane_doe', heightCm: 170 } as User;

    it('should return updated UserDto when user exists', async () => {
      (userRepository.getById as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await userService.update('uuid-1234', updateData);

      expect(userRepository.getById).toHaveBeenCalledWith('uuid-1234');
      expect(userRepository.update).toHaveBeenCalledWith('uuid-1234', updateData);
      expect(result).toMatchObject({ username: 'jane_doe', heightCm: 170 });
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('should throw NotFoundException when user to update is not found', async () => {
      (userRepository.getById as jest.Mock).mockResolvedValue(null);

      await expect(userService.update('uuid-9999', updateData)).rejects.toThrow(NotFoundException);
      await expect(userService.update('uuid-9999', updateData)).rejects.toThrow(
        'User with id uuid-9999 not found',
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate repository errors on update', async () => {
      (userRepository.getById as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(userService.update('uuid-1234', updateData)).rejects.toThrow('DB error');
    });
  });
});
