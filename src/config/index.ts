import { getVar, string2Bool } from '../utils/parsers';
import { Options } from 'sequelize';

/*
  type denifitions
*/
export type EnvType = 'development' | 'test' | 'production';

export type ConfigType = {
  app: {
    port: number,
    jsonError: boolean
  },
  db: {
    database: string,
    username: string,
    password?: string,
    options?: Options
  }
  isDev: boolean
};

/*
  running environment
*/
const _env = process.env.NODE_ENV || 'development';
let env : EnvType = (
  (_env === 'development' || _env === 'test') ?
    _env : 'development'
) as EnvType;

/*
  actual configuration for all environments
*/
let config = {
  development: {
    app: {
      port: +getVar('PORT', '3000'),
      jsonError: string2Bool(
        getVar('JSON_ERROR', 'false')
      )
    },
    db: {
      database: getVar('DB_DATABASE', 'db_dev'),
      username: getVar('DB_USERNAME', ''),
      password: getVar('DB_PASSWORD', undefined),
      options: {
        dialect: getVar('DB_DIALECT', 'sqlite'),
        storage: getVar('DB_STORAGE', './dist/db/db_dev.sqlite')
      }
    },
    isDev: env === 'development'
  },
  test: {
    app: {
      port: +getVar('PORT', '3000'),
      jsonError: string2Bool(
        getVar('JSON_ERROR', 'true')
      )
    },
    db: {
      database: getVar('DB_DATABASE', 'db_test'),
      username: getVar('DB_USERNAME', ''),
      password: getVar('DB_PASSWORD', undefined),
      options: {
        dialect: getVar('DB_DIALECT', 'sqlite'),
        storage: getVar('DB_STORAGE', './db/db_test.sqlite')
      }
    },
    isDev: env === 'development'
  },
  production: {
    app: {
      port: +getVar('PORT', '3000'),
      jsonError: string2Bool(
        getVar('JSON_ERROR', 'true')
      )
    },
    db: {
      database: getVar('DB_DATABASE', 'db_prod'),
      username: getVar('DB_USERNAME', ''),
      password: getVar('DB_PASSWORD', undefined),
      options: {
        dialect: getVar('DB_DIALECT', 'sqlite'),
        storage: getVar('DB_STORAGE', './db/db_prod.sqlite')
      }
    },
    isDev: env === 'development'
  }
};

export default config[env] as ConfigType;