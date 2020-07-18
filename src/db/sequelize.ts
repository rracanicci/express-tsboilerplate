import config from '../config';
import { Sequelize, Model } from 'sequelize';

/*
  use this model do add extra features to all models
*/
export class CustomModel extends Model {}

/*
  sequelize instance to be used application wide
*/
export const db = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  config.db.options
);