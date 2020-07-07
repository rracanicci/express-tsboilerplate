import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../sequelize';
import { User } from './user';

export class Address extends Model {
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
    sequelize, // passing the `sequelize` instance is required
  }
);

export function associate() {
  Address.belongsTo(User);
}