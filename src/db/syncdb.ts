import { sequelize } from './sequelize';
import './models';
import { User } from './models/user';

(async() => {
  await sequelize.sync({ force: true });

  await User.bulkCreate<User>([{
    name: 'rodrigo'
  }]);
})();