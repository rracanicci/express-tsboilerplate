import { 
  RequestHandler, Request, Response, NextFunction
} from 'express';

/*
  this is a wrapper function to be used with middlewares

  any error thrown will be catched and properly handled by the error
  handling middleware
*/
export function throwError(func: RequestHandler) {
  return async (
    req: Request, res: Response, next: NextFunction
  ): Promise<void> => {
    try {
      await func(req, res, next);
    }
    catch(err) {
      next(err);
    }
  };
}