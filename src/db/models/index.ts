/*
  import this file in the project that all models present in db/models
  will be automatically imported to sequelize
*/

/* eslint-disable @typescript-eslint/no-var-requires */

import { readdirSync } from 'fs';
import { basename, join } from 'path';
import { debug } from 'debug';

const logger = debug('app:db:models');
const models : { associate: () => void | undefined }[] = [];
const baseFileName = basename(__filename);

readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) &&
           (file !== baseFileName) &&
           (file.slice(-3) === '.js');
  })
  .forEach(file => {
    logger('importing model', file);
    models.push(require(join(__dirname, file)));
  });

models.forEach(m => {
  if (m.associate) {
    m.associate();
  }
});