import joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { Controller, Get } from '../utils/controller-base';
import { validateQuery } from '../middlewares/validation';

@Controller()
export class IndexRouter {
  /**
  * @swagger
  * /:
  *    get:
  *      tags:
  *          - Index
  *      summary: Index Page.
  *      description: Just a simple index page
  */
  @Get(
    '/',
    validateQuery(
      joi.object({
        title: joi.string().default('express-tsboilerplate').optional()
      })
    )
  )
  public getIndex(req: Request, res: Response, _next: NextFunction): void {
    const { title } = req.query;

    res.render('index', { 
      title: title,
      routes: [
        {
          path: '/',
          description: 'The page you are seeing right now :)'
        },
        {
          path: '/swagger',
          description: 'Swagger documentation'
        }
      ]
    });
  }
}