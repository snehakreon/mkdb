import { Request, Response, NextFunction } from "express";

/**
 * Wraps an async route handler so thrown errors are passed to Express error middleware.
 *
 * Usage: router.get("/foo", asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
