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

# Validation

# Error handling

# API Documentation

# Database models
## Creating models
## Synchronizing database

# Public folder

# ESLint support