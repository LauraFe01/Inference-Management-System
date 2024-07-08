import { Model, DataTypes } from 'sequelize';
import sequelize from './db_config';

class User extends Model {
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
      sequelize, // Passa l'istanza Sequelize
      modelName: 'User', // Nome del modello
      tableName: 'users', // Nome della tabella nel database
      timestamps: true, // Aggiungi i campi createdAt e updatedAt automaticamente
    }
  );
  
  export default User;