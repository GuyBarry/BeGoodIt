import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { userRouter } from '../../controllers/user.controller';
import { userService } from '../../services/user.service';
import { CustomException } from '../../exceptions/customException';
import { NotFoundException } from '../../exceptions/httpExceptions';

jest.mock('../../services/user.service');

const mockErrorHandler = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof CustomException) {
    res.status(error.statusCode).json({ message: error.message, details: error.details });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Oops, something went wrong!' });
  }
};

const mockUser = {
  id: 'uuid-1234',
  username: 'john_doe',
  email: 'john@example.com',
  profilePictureUrl: null,
  gender: { id: 1, name: 'Male' },
  birthdate: null,
  heightCm: null,
  bodyType: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('userRouter', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use(userRouter);
    app.use(mockErrorHandler);
  });

  describe('GET /:id', () => {
    it('should return 200 with the user when found', async () => {
      (userService.getById as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).get('/uuid-1234');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toMatchObject({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
      });
      expect(userService.getById).toHaveBeenCalledWith('uuid-1234');
    });

    it('should return 404 when user is not found', async () => {
      (userService.getById as jest.Mock).mockRejectedValue(
        new NotFoundException('User with id uuid-9999 not found'),
      );

      const response = await request(app).get('/uuid-9999');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.message).toBe('User with id uuid-9999 not found');
    });

    it('should return 500 when service throws an unexpected error', async () => {
      (userService.getById as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/uuid-1234');

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Oops, something went wrong!');
    });
  });

  describe('PUT /:id', () => {
    const updatePayload = { username: 'jane_doe', heightCm: 170 };
    const updatedUser = { ...mockUser, username: 'jane_doe', heightCm: 170 };

    it('should return 200 with updated user', async () => {
      (userService.update as jest.Mock).mockResolvedValue(updatedUser);

      const response = await request(app).put('/uuid-1234').send(updatePayload);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toMatchObject({ username: 'jane_doe', heightCm: 170 });
      expect(userService.update).toHaveBeenCalledWith('uuid-1234', updatePayload);
    });
    
    it('should return 400 when request body is empty', async () => {
      const response = await request(app).put('/uuid-1234').send({});
  
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.message).toBe('Request body must not be empty');
      expect(userService.update).not.toHaveBeenCalled();
    });

    it('should return 404 when user to update is not found', async () => {
      (userService.update as jest.Mock).mockRejectedValue(
        new NotFoundException('User with id uuid-9999 not found'),
      );

      const response = await request(app).put('/uuid-9999').send(updatePayload);

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.message).toBe('User with id uuid-9999 not found');
    });

    it('should return 500 when service throws an unexpected error', async () => {
      (userService.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app).put('/uuid-1234').send(updatePayload);

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Oops, something went wrong!');
    });
  });
});
