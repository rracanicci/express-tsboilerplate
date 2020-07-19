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

To actually bring the application up you can both use the following code to start using raw node:

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

Configuration can be read from the [configuration file](./src/config/index.ts). You can read de configurations application with just:

```typescript
import config from 'config;'
```

For each configuration there is a linked environment variable which can be set to tune the configuration. Besides, if **_FILE** is added to the variable name, the application will look for the file pointed by the variable value and load the value config value from the file (this provides support to docker secrets).

The current configuration is:

```typescript
const config = {
  // application configuration
  app: {
    // port the application should run
    port: +getVar('PORT', '3000'),
    // indicaticates wheather errors can be returned as JSON
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
  nodeenv: (
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'test'
  ) ? process.env.NODE_ENV : 'development'
};
```

The **getVar** method looks for environment varible, if the it is not found, the default value used as second parameter will be used. For more info check [here](./src/utils/parsers.ts).

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
## Creating models
## Synchronizing database

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