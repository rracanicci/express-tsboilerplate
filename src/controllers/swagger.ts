import { Request, Response, NextFunction } from 'express';
import { Controller, Use } from './controller-base';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerConfig from '../config/swagger';

@Controller('/swagger')
export class SwaggerRouter {
  @Use('/', ...swaggerUi.serve)
  public getIndex(req: Request, res: Response, next: NextFunction) {
    return swaggerUi.setup(swaggerJSDoc(swaggerConfig))(req, res, next);
  }
}