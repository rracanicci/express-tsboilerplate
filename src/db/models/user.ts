import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../sequelize';
import { Address } from './address';

export class User extends Model {
  public name!: string;
  public preferredName!: string | null; // for nullable fields

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    preferredName: {
      type: new DataTypes.STRING(128),
      allowNull: true,
    },
  },
  {
    sequelize, // passing the `sequelize` instance is required
  }
);

export function associate() {
  User.hasOne(Address);
}