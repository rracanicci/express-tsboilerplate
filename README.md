# Express Typescript Boilerplate

Boilerplate to work with express using typescript. The boilerplate includes:

- [Controller decorators](./src/utils/controller-base.ts) to make the job of creating routes easier
- Schema [validation middlewares](./src/middlewares/validation.ts) using [Joi](https://hapi.dev/module/joi/)
- API documentation using [Swagger](https://swagger.io/)
- Custom and flexible [configuration setup](./src/config/index.ts) with support to docker secrets
- Database models using [Sequelize](https://sequelize.org/)
- Error [handling middlewares](./src/middlewares/error.ts) and [utilities](./src/utils/error-handling.ts) on top of [http-erros](https://www.npmjs.com/package/http-errors)
- View capabilities using [Pug](https://pugjs.org/api/getting-started.html)
- Docker setup files, including [Dockerfile](./Dockerfile) and [docker-compose](./docker-compose.yml)
- ESLint to check code quality

# Table of Contents
- [Setup](#setup)
- [Logging](#logging)
- [Route controllers](#route-controllers)
- [Validation](#validation)
- [Error handling](#error-handling)
- [API Documentation](#api-documentation)
- [Database models](#database-models)
- [Public folder](#public-folder)
- [ESLint support](#eslint-support)

# Setup

## Nodejs run

To run application first clone the repo using:

```bash
> git clone https://github.com/rracanicci/express-tsboilerplate.git
```

Install dependencies using npm:

```bash
> npm install
```

Build the application using:

```bash
> npm run build
```

As the code uses typescript, this command will cleanup any previoues builds from the **dist** directory, build the application using **tsc** and than copy [src/img](./src/img), [src/public](./src/public), [src/views](./src/views) and [src/api-docs](./src/api-docs) to the **dist** folder.

To actually bring the application up you can use the following code to start using raw node:

```bash
> npm start
```

Or use the command bellow to start in debug mode using [nodemon](https://www.npmjs.com/package/nodemon):

```bash
> npm run debug
```

Be aware that nodemon will listen for changes on the dist folder. As we are using typescript you will have to rebuild the application in order to nodemon to see changes in the transpiled javascript files; Alternativelly, you can run **tsc** in watch mode along with `npm run debug`:

- Terminal 1: `> npx tsc --watch`
- Terminal 2: `> npm run debug`

To see more, check the **scripts** session at the [package.json](./package.json) file.

## Docker run

To run using docker simple run:

```bash
> docker-compose up --build
```

This will build the image following the [Dockerfile](./Dockerfile) and bring the container up. The application will than be available at the default port 3000.

## Tunning configurations

Configuration can be read from the [configuration file](./src/config/index.ts). You can access the application's configurations with just:

```typescript
import config from 'config';
```

For each configuration there is a linked environment variable which can be set to tune the configuration. Besides, if **_FILE** is added to the variable name, the application will look for the file pointed by the variable value and load the config value from the file (helpful to use with docker secrets).

The current configuration is:

```typescript
const config = {
  // application configuration
  app: {
    // port the application should run
    port: +getVar('PORT', '3000'),
    // indicaticates wheather errors should be returned as JSON
    // or if a HTML page should be rendered
    jsonError: string2Bool(
      getVar('JSON_ERROR', 'false')
    )
  },
  // sequelize configuration
  db: {
    database: getVar('DB_DATABASE', 'db_dev'),
    username: getVar('DB_USERNAME', ''),
    password: getVar('DB_PASSWORD', ''),
    // provides support to all sequelize options
    options: {
      dialect: getVar('DB_DIALECT', 'sqlite'),
      storage: getVar('DB_STORAGE', 'db.sqlite')
    }
  },
  // application environment
  nodeenv: (
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'test'
  ) ? process.env.NODE_ENV : 'development'
};
```

The **getVar** function looks for the environment varible, if the it is not found, the default value passed as second parameter will be used. For more info check [here](./src/utils/parsers.ts).

# Logging

For logging the application relies on the [debug module](https://www.npmjs.com/package/debug). All the log message are prefixed with **app**. You can use the **DEBUG** environment variable to filter the wanted messages. For instance:

`> export DEBUG=app:*`

# Route controllers

## Creating routes
In order to easly create application routes a set of decorators was developed at the [controller-base](./src/utils/controller-base.ts) utility file:

* Controller
* Get
* Post
* Delete
* Options
* Put
* All
* Use

To create a set of routes, just create a controller file such as:

```typescript
@Controller('/api/example')
export class ExampleRouter {
  @Get('/')
  public async get(
    req: Request, res: Response, next: NextFunction
  ): Promise<void> { ... }

  @Post('/')
  public async create(
    req: Request, res: Response, next: NextFunction
  ): Promise<void> { ... }

  @Put('/:id')
  public async update(
    req: Request, res: Response, next: NextFunction
  ): Promise<void> { ... }

  @Delete('/:id')
  public async delete(
    req: Request, res: Response, _next: NextFunction
  ): Promise<void> { ... }
}
```

To make the route visible, go to the [routes file](./src/routes.ts) and import your controller:

```typescript
/*
  import all your controller routes here
*/
import './controllers/index';
import './controllers/swagger';
import './controllers/api/users';
import './controolers/api/example';
```

Once you do this, the function **configureControllers** from the [controller-base](./src/utils/controller-base.ts) will automatically map and create the routes (check the [app.ts file](./src/app.ts)).

## Adding middlewares to specific routes

If you need to add middlewares for a specific route or even to a entire controller, just add the middlewares to be called before the route in the decorator call:

```typescript
@Controller('/api/example', <your middlewares go here>)
export class ExampleRouter {
  @Get('/', <your middlewares go here>)
  public async get(
    req: Request, res: Response, next: NextFunction
  ): Promise<void> { ... }
```

For a full example, check the example [/api/users route](./src/controllers/api/users.ts).

# Validation

To validate URL parameters, query parameters and JSON body parameters a set of middlewares is avaible at the [validation middleware file](./src/middlewares/validation.ts):

* validateParams
* validateQuery
* validateBody

Add them as a pre requirement for a route or controller. They will perform the validation using a Joi Schema and return a Bad Request with the correct error message in case validation fails.
If validation succeeds, the validated objects (**req.params**, **req.query** and **req.body**) will be replaced in the request, including type convertions and default values:

```typescript
@Controller('/api/users')
export class UsersRouter {
  @Put(
    '/:id',
    validateParams(
      joi.object({
        id: joi.number().positive().required()
      })
    ),
    validateBody(
      joi.object({
        name: joi.string().min(1).max(255).required()
      })
    )
  )
  public async update(
    req: Request, res: Response, next: NextFunction
  ): Promise<void> {
    const { id } = req.params;
    const { name } = req.body;
    ...
  }
}
```

A full example can be seen at the [/api/users route](./src/controllers/api/users.ts).

# Error handling

An [error handling middleware](./src/middlewares/error.ts) is used to handle errors. It can both render a view or return a JSON error depending on the JSON_ERROR variable value.

Also, all routes and middlewares used with the decoratoros described [here](#creating-routes) will be wrapped with the function [**throwError**](./src/utils/error-handling.ts), that automatically redirects uncatched erros to the error handling middleware.

# API Documentation

To provide API documentation the project uses the modules [swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc) and [swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express). The configuration for them can be found in the [swagger config file](./src/config/swagger.ts).

So, to documment an API you can boh add comments to the code, as the [IndexRouter example](./src/controllers/index.ts):

```typescript
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
    ...
```

Or create a swagger definition file under the folder [src/api-docs](./src/api-docs).

Once you bring the application up there will be a route [**/swagger**](./src/controllers/swagger.ts) with the documentation.

# Database models
If you need to work with databases, the [Sequelize](https://sequelize.org/) module can be very useful. You can use it to define models and easely manipulate data in the application. The boilerplate has been already configured to work with Sequelize.

## Creating models
To create a new model, go to the [models directory](src/db/models) and create a file to represent the model, such as [user.ts](src/db/models/user.ts):

```typescript
import { DataTypes } from 'sequelize';
import { db, CustomModel } from '../sequelize';

export class User extends CustomModel {
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    name: {
      type: new DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  {
    sequelize: db, // passing the `sequelize` instance is required
  }
);

export function associate(): void {
  return;
}
```

The _associate_ function can be used to define associatons with other modules, such as _belongsToMany_, _belongsTo_, _hasOne_ and _hasMany_. For more information check the [official sequelize documentation](https://sequelize.org/master/manual/assocs.html).

## How models are imported into sequelize
The [index file](src/db/models/index.ts) is responsible for importing all the modules, creating the associations and making the modules visible to sequelize. So it should be imported once into your application, such as in the [app.ts](src/app.ts) file:

```typescript
import './routes';
import './db/models'; // <--
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

```

## Customizing the base model
If you need to add methods to all models at once, just add them to the [base model](src/db/sequelize.ts):

```typescript
import config from '../config';
import { Sequelize, Model } from 'sequelize';

/*
  use this model do add extra features to all models
*/
export class CustomModel extends Model {} // <--

/*
  sequelize instance to be used application wide
*/
export const db = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  config.db.options
);
```

## Using models
In order to use and/or query models, just import them:

```typescript
import _ from 'lodash';
import joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { Controller, Get, Post, Put, Delete } from '../../utils/controller-base';
import { validateQuery, validateBody, validateParams } from '../../middlewares/validation';
import { User } from '../../db/models/user';  // <--
import { Op, UniqueConstraintError } from 'sequelize';
import { Conflict, NotFound } from 'http-errors';
import { db } from '../../db/sequelize';

@Controller('/api/users')
export class UsersRouter {
  @Get(
    '/',
    validateQuery(
      joi.object({
        id: joi.number().positive().optional(),
        name: joi.string().min(1).max(255).optional()
      })
    )
  )
  public async get(
    req: Request, res: Response, next: NextFunction
  ): Promise<void> {
    const { id, name } = req.query;
    const users: User[] = await User.findAll({  // <--
      where: _.pickBy({
        id: id,
        name: name ? {
          [Op.like]: `%${name}%`
        } : undefined
      }, _.identity) as any
    });

    if (users.length == 0) {
      return next(new NotFound('no user found'));
    }
    res.json(users);
  }
  ...
```
A full example can be found [here](src/controllers/api/users.ts).

## Synchronizing database
To destroy the database and rebuild based on the models call:

```bash
> npm run syncdb
```

More details can be found in [this file](src/db/syncdb.ts).

# Public folder

If you need to expose some static files, just place them inside the [src/public](./src/public) and access it through the route **/public/...**.

This feature is defined at the [app.ts](src/app.ts) file:

```typescript
// serving static files
app.use('/public', express.static(path.join(__dirname, 'public')));
```

# ESLint support

ESLint configuration can be found in the file [.eslintrc.json](./.eslintrc.json). To run use:

```bash
> npm run eslint
```