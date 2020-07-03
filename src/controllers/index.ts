import { RequestHandler } from 'express';

export const getIndex: RequestHandler = (req, res, next) => {
  res.render('index', { 
      title: 'express-tsboilerplate',
      routes: [
          {
              path: "/",
              description: "The page you are seeing right now :)"
          }
      ]
  });
};