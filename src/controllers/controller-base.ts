import { Express, RequestHandler } from 'express';
import { throwError } from '../middlewares/error';
import debug from 'debug';

const logger = debug('app:controllerbase');

/* 
  supported Request Methods
*/
type RequestMethod
  = 'get' | 'post' | 'delete' | 'options' | 'put' | 'all' | 'use';

/*
  base interface for a router type
*/
interface RouteBaseType {
  path: string;
  requestMethod: RequestMethod;
  routeHandler: string | symbol;
  preReqs: RequestHandler [];
}

/*
  return de registered controllers
*/
function getControllers() : any[] {
  if (!Reflect.hasMetadata('controller', getControllers)) {
    Reflect.defineMetadata('controller', [], getControllers);
  }
  return Reflect.getMetadata('controller', getControllers);
}

/*
  add a new controler (internal)
*/
function addController(controller: any) {
  const controllers = getControllers();

  controllers.push(controller);

  Reflect.defineMetadata('controller', controllers, getControllers);
}

/*
  get the controller prefix
*/
function getPrefix(target: Object) : string {
  if (!Reflect.hasMetadata('prefix', target)) {
    Reflect.defineMetadata('prefix', '', target);
  }
  return Reflect.getMetadata('prefix', target);
}

/*
  set the controller prefix
*/
function setPrefix(prefix: string, target: Object) {
  Reflect.defineMetadata('prefix', prefix, target);
}

/*
  get the controller registered routes
*/
function getRoutes(target: Object) : Array<RouteBaseType>{
  if (!Reflect.hasMetadata('routes', target)) {
    Reflect.defineMetadata('routes', [], target);
  }
  return Reflect.getMetadata('routes', target);
}

/*
  add a new route to the controller
*/
function addRoute(route: RouteBaseType | null, target: Object): void {
  if (route) {
    const routes = getRoutes(target);

    routes.push(route);

    Reflect.defineMetadata('routes', routes, target);
  }
}

/*
  method to bind a new controller method
*/
function routerFactory(
  path: string, requestMethod: RequestMethod, ...preReqs: RequestHandler[]
) {
  return (target: Object, routeHandler: string | symbol): void => {
    addRoute({
      path: path,
      requestMethod: requestMethod,
      routeHandler: routeHandler,
      preReqs: preReqs
    }, target.constructor);
  };
}

/*
  class controller decorator
*/
export const Controller = (prefix: string = ''): ClassDecorator => {
  return (target: any) => {
    addController(target);
    setPrefix(prefix, target);
    addRoute(null, target);
  };
};

/*
  get router method decorator
*/
export const Get = (
  path: string, ...preReqs: RequestHandler[]
): MethodDecorator => {
  return routerFactory(path, 'get', ...preReqs);
};

/*
  post router method decorator
*/
export const Post = (
  path: string, ...preReqs: RequestHandler[]
): MethodDecorator => {
  return routerFactory(path, 'post', ...preReqs);
};

/*
  delete router method decorator
*/
export const Delete = (
  path: string, ...preReqs: RequestHandler[]
): MethodDecorator => {
  return routerFactory(path, 'delete', ...preReqs);
};

/*
  options router method decorator
*/
export const Options = (
  path: string, ...preReqs: RequestHandler[]
): MethodDecorator => {
  return routerFactory(path, 'options', ...preReqs);
};

/*
  put router method decorator
*/
export const Put = (
  path: string, ...preReqs: RequestHandler[]
): MethodDecorator => {
  return routerFactory(path, 'put', ...preReqs);
};

/*
  all router method decorator
*/
export const All = (
  path: string, ...preReqs: RequestHandler[]
): MethodDecorator => {
  return routerFactory(path, 'all', ...preReqs);
};

/*
  use router method decorator
*/
export const Use = (
  path: string, ...preReqs: RequestHandler[]
): MethodDecorator => {
  return routerFactory(path, 'use', ...preReqs);
};

/*
  configure the registed controllers on an express application
*/
export function configureControllers(app: Express) {
  for (const controller of getControllers()) {
    const prefix: string = getPrefix(controller);
    const routes: Array<RouteBaseType> = getRoutes(controller);

    for (const route of routes) {
      const instance = new controller();

      logger('adding route', route, 'with prefix "', prefix, '"');
      app[route.requestMethod](
        prefix + route.path,
        ...[
          ...route.preReqs,
          instance[route.routeHandler].bind(instance)
        ].map(throwError)
      );
    }
  }
}