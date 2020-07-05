import { Request, Response, NextFunction } from 'express';
import { Controller, Get } from './controller-base';

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
  @Get('/')
  public getIndex(req: Request, res: Response, next: NextFunction) {
    res.render('index', { 
      title: 'express-tsboilerplate',
      routes: [
        {
          path: '/',
          description: 'The page you are seeing right now :)'
        }
      ]
    });
  }
}