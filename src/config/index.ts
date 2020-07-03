import { getVar, string2Bool } from "../utils/parsers";

/*
  type denifitions
*/
export type EnvType = 'development' | 'test' | 'production';

export type ConfigType = {
  app: {
    port: number,
    jsonError: boolean
  },
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
    isDev: env === 'development'
  },
  test: {
    app: {
      port: +getVar('PORT', '3000'),
      jsonError: string2Bool(
        getVar('JSON_ERROR', 'true')
      )
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
    isDev: env === 'development'
  }
};

export default config[env] as ConfigType;