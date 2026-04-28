import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { successResponse } from '../../utils/apiResponse';
import { authService } from './auth.service';
import type { LoginInput, RegisterInput } from './auth.types';

export const authController = {
  register: asyncHandler(async (req: Request<object, object, RegisterInput>, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json(successResponse(result, 'Registered successfully'));
  }),
  login: asyncHandler(async (req: Request<object, object, LoginInput>, res: Response) => {
    const result = await authService.login(req.body);
    res.json(successResponse(result, 'Logged in successfully'));
  }),
  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getUserById(req.user!.id);
    res.json(successResponse(user));
  })
};
