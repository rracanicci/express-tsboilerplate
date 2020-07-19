import { getVar, string2Bool } from '../utils/parsers';
import { Options } from 'sequelize';

/*
  type denifitions
*/
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
  nodeenv: 'development' | 'test' | 'production'
};

/*
  actual configuration for all environments
*/
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

export default config as ConfigType;