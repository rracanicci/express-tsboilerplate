import { readdirSync } from 'fs';
import { basename, join } from 'path';
import { debug } from 'debug';

const logger = debug('app:db:models');
const models: any[] = [];
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
  };
});