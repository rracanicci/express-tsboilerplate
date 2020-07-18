import { AnySchema } from 'joi';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { BadRequest } from 'http-errors';

/*
  generates a middleware capable of validating request params, query
  or body
  the validated objects will be replaced in the request, including type
  convertions and default values
*/
function validateSchema(
  param: 'params' | 'query' | 'body',
  schema: AnySchema
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.params
    const result = schema.validate(req[param], {
      convert: true
    });

    if (result.error) {
      return next(
        new BadRequest(
          `error validating ${param}: ${result.error.message}`
        )
      );
    }

    // replace in the original object the validated items, including
    // type convertions and default values
    for (const val in result.value) {
      console.log(result.value[val]);
      req[param][val] = result.value[val];
    }
    next();
  }
}

/*
  generates a middleware capable of validating request parameters
  the validated objects will be replaced in the request, including type
  convertions and default values
*/
export function validateParams(schema: AnySchema): RequestHandler {
  return validateSchema('params', schema);
}

/*
  generates a middleware capable of validating request query objets
  the validated objects will be replaced in the request, including type
  convertions and default values
*/
export function validateQuery(schema: AnySchema): RequestHandler {
  return validateSchema('query', schema);
}

/*
  generates a middleware capable of validating the request body
  the validated objects will be replaced in the request, including type
  convertions and default values
*/
export function validateBody(schema: AnySchema): RequestHandler {
  return validateSchema('body', schema);
}