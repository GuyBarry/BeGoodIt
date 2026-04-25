import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { UpdateUserDto, UserDto } from "../dtos";
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
    req: Request<{ id: UserDto["id"] }, {}, Partial<UpdateUserDto>>,
    res: Response,
  ) => {
    const user = await userService.update(req.params.id, req.body);
    res.status(StatusCodes.OK).json(user);
  },
);
