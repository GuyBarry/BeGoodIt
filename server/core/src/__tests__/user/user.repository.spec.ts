import { User } from '../../db/entities';
import { userRepository } from '../../repositories/user.repository';

const mockFindOne = jest.fn();
const mockExecute = jest.fn();
const mockQueryBuilder = {
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  execute: mockExecute,
};

jest.mock('../../db/datasource', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: mockFindOne,
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
      extend: jest.fn((methods) => ({ findOne: mockFindOne, createQueryBuilder: jest.fn(() => mockQueryBuilder), ...methods })),
    }),
  },
}));

describe('userRepository', () => {
  const mockUser: Partial<User> = {
    id: 'uuid-1234',
    username: 'john_doe',
    email: 'john@example.com',
    gender: { id: 1, name: 'Male', users: [] } as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should call findOne with id and gender relation', async () => {
      mockFindOne.mockResolvedValue(mockUser);

      const result = await userRepository.getById('uuid-1234');

      expect(mockFindOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1234' },
        relations: ['gender'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user does not exist', async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await userRepository.getById('uuid-9999');

      expect(result).toBeNull();
    });

    it('should propagate datasource errors', async () => {
      mockFindOne.mockRejectedValue(new Error('DB error'));

      await expect(userRepository.getById('uuid-1234')).rejects.toThrow('DB error');
    });
  });

  describe('update', () => {
    const updateData = { username: 'jane_doe' };
    const updatedUser = { ...mockUser, username: 'jane_doe' };

    it('should execute query builder update and return updated user with gender relation', async () => {
      mockExecute.mockResolvedValue(undefined);
      mockFindOne.mockResolvedValue(updatedUser);

      const result = await userRepository.update('uuid-1234', updateData);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(User);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith(updateData);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id = :id', { id: 'uuid-1234' });
      expect(mockExecute).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1234' },
        relations: ['gender'],
      });
      expect(result).toEqual(updatedUser);
    });

    it('should return null when user does not exist after update', async () => {
      mockExecute.mockResolvedValue(undefined);
      mockFindOne.mockResolvedValue(null);

      const result = await userRepository.update('uuid-9999', updateData);

      expect(result).toBeNull();
    });

    it('should propagate datasource errors', async () => {
      mockExecute.mockRejectedValue(new Error('DB error'));

      await expect(userRepository.update('uuid-1234', updateData)).rejects.toThrow('DB error');
    });
  });
});
