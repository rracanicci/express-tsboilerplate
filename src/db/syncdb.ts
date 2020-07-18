import './models';
import { db } from './sequelize';
import { User } from './models/user';

(async() => {
  await db.sync({ force: true });

  await User.bulkCreate<User>([{
    name: 'rodrigo'
  }]);
})();