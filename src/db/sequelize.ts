import { Sequelize } from 'sequelize';
import config from '../config';
import _ from 'lodash';

export const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  config.db.options
);