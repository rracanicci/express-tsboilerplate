import config from './../config';
import { ErrorRequestHandler } from 'express';

/*
  error handling middleware
  this will return the error as JSON is JSON_ERROR is set to true
  or render a view otherwire
*/
export const handleError: ErrorRequestHandler = (err, _req, res, _next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = config.nodeenv === 'development' ? err : {};

  // setup response
  res.status(err.status || 500);

  if (config.app.jsonError) {
    res.json(err);
  }
  else res.render('error');
}