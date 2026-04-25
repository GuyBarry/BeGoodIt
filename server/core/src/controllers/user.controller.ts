import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { UpdateUserDto, UserDto } from "../dtos";
import { BadRequestException } from "../exceptions";
import { userService } from "../services";

export const userRouter = Router();

userRouter.get(
  "/:id",
  async (req: Request<{ id: UserDto["id"] }>, res: Response) => {
    const user = await userService.getById(req.params.id);
    res.status(StatusCodes.OK).json(user);
  },
);

userRouter.put(
  "/:id",
  async (
    req: Request<{ id: UserDto["id"] }, {}, UpdateUserDto>,
    res: Response,
  ) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new BadRequestException('Request body must not be empty');
    }
    
    const user = await userService.update(req.params.id, req.body);
    res.status(StatusCodes.OK).json(user);
  },
);
