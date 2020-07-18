import { DataTypes } from 'sequelize';
import { db, CustomModel } from '../sequelize';
import { User } from './user';

export class Address extends CustomModel {
  public address!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Address.init(
  {
    address: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
  },
  {
    sequelize: db, // passing the `sequelize` instance is required
  }
);

export function associate() {
  Address.belongsTo(User);
}