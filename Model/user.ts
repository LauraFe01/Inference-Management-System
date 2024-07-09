import { Model, DataTypes, Optional } from 'sequelize';
import db from '../Config/db_config';
import Dataset from './dataset';

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  numToken: number;
  isAdmin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public numToken!: number;
  public isAdmin!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numToken: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize: db, // Passa l'istanza Sequelize
    modelName: 'User', // Nome del modello
    tableName: 'users', // Nome della tabella nel database
    timestamps: true, // Aggiungi i campi createdAt e updatedAt automaticamente
  }
);

User.hasMany(Dataset, { foreignKey: 'userId' });
Dataset.belongsTo(User, { foreignKey: 'userId' });

export { User, UserAttributes, UserCreationAttributes };