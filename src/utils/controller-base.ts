import debug from 'debug';
import { Express, RequestHandler } from 'express';
import { throwError } from '../utils/error-handling';

const logger = debug('app:controllerbase');

/* 
  supported Request Methods
*/
type RequestMethod
  = 'get' | 'post' | 'delete' | 'options' | 'put' | 'all' | 'use';

/*
  base interface for a controller data type
*/
interface ControllerDataType {
  prefix: string;
  preReqs: RequestHandler[];
}

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
function getControllerData(target: any) : ControllerDataType {
  if (!Reflect.hasMetadata('controllerData', target)) {
    Reflect.defineMetadata('controllerData', {
      prefix: '',
      preReqs: []
    }, target);
  }
  return Reflect.getMetadata('controllerData', target);
}

/*
  set the controller prefix
*/
function setControllerData(data: ControllerDataType, target: any) {
  Reflect.defineMetadata('controllerData', data, target);
}

/*
  get the controller registered routes
*/
function getRoutes(target: any) : Array<RouteBaseType>{
  if (!Reflect.hasMetadata('routes', target)) {
    Reflect.defineMetadata('routes', [], target);
  }
  return Reflect.getMetadata('routes', target);
}

/*
  add a new route to the controller
*/
function addRoute(route: RouteBaseType | null, target: any): void {
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
  return (target: any, routeHandler: string | symbol): void => {
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
export const Controller = (
  prefix = '', ...preReqs: RequestHandler[]
): ClassDecorator => {
  return (target: any) => {
    addController(target);
    setControllerData({ prefix: prefix, preReqs: preReqs }, target);
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
export function configureControllers(app: Express): void {
  for (const controller of getControllers()) {
    const controllerData = getControllerData(controller);
    const routes = getRoutes(controller);

    for (const route of routes) {
      const instance = new controller();
      const path = controllerData.prefix + route.path;

      logger(`adding route "${path}"`);
      app[route.requestMethod](
        path,
        ...[
          ...controllerData.preReqs,
          ...route.preReqs,
          instance[route.routeHandler].bind(instance)
        ].map(throwError)
      );
    }
  }
}