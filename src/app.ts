import './routes';
import path from 'path';
import debug from 'debug';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import favicon from 'serve-favicon';
import cors from 'cors';
import express from 'express';
import config from './config';
import { NotFound } from 'http-errors';
import { handleError } from './middlewares/error';
import { Request, Response, NextFunction } from 'express';
import { configureControllers } from './utils/controller-base';
import { json2String } from './utils/parsers';

/*
  declarations
*/
const logger = debug('app:app');

/*
  app setup
*/
const app = express();

// set global config to be used latter on
app.set('config', config);

if (config.nodeenv === 'development') {
  logger('config: ', json2String(config));
}

// serving favicon file
app.use(favicon(__dirname + '/img/favicon.ico'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// routes
configureControllers(app);

// serving static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFound());
});

// error handler
app.use(handleError);

export default app;