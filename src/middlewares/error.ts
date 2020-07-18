import { ErrorRequestHandler } from 'express';
import { ConfigType } from '../config';

export const handleError: ErrorRequestHandler = (err, req, res, next) => {
  const config: ConfigType = req.app.get('config');

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error   = config.nodeenv === 'development' ? err : {};

  // setup response
  res.status(err.status || 500);

  if (config.app.jsonError) {
    res.json(err);
  }
  else res.render('error');
}