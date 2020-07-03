import path from "path";
import debug from "debug";
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import favicon from 'serve-favicon';
import { NotFound } from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import config, { ConfigType } from './config';
import { handleError } from './middlewares/error';
import indexRouter from "./routes/index";

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

if (config.isDev) {
  logger('config: ', app.get('config') as ConfigType);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// routes
app.use('/', indexRouter);

// serving static files for JS and CSS
app.use('/public', express.static(path.join(__dirname, 'public')));

// serving favicon file
app.use(favicon(__dirname + '/img/favicon.ico'));

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFound());
});

// error handler
app.use(handleError);

export default app;