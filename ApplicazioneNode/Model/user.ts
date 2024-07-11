import { Model, DataTypes, Optional } from 'sequelize';
import db from '../Config/db_config';
import Dataset from './dataset';

// Definisce gli attributi dell'interfaccia UserAttributes che rappresentano le colonne della tabella 'users'
interface UserAttributes {
  id?: number;
  email: string;
  password: string;
  numToken: number;
  isAdmin: boolean;
  createdAt?: Date; // Campo opzionale gestito automaticamente da Sequelize
  updatedAt?: Date; // Campo opzionale gestito automaticamente da Sequelize
}

// Definisce gli attributi necessari per creare un nuovo utente
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// Definisce la classe User che estende Model e implementa UserAttributes
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  
  public email!: string; // Email dell'utente
  public password!: string; // Password dell'utente
  public numToken!: number; // Numero di token dell'utente
  public isAdmin!: boolean; // Indica se l'utente è amministratore

  // Campi gestiti automaticamente da Sequelize
  public readonly id!: number;
  public readonly createdAt!: Date; 
  public readonly updatedAt!: Date;
}

// Inizializza il modello User con i relativi attributi e opzioni
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement:true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false, // Campo obbligatorio
      unique: true, // Deve essere univoco
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false, // Campo obbligatorio
    },
    numToken: {
      type: DataTypes.FLOAT,
      allowNull: false, // Campo obbligatorio
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false, // Campo obbligatorio
    },
  },
  {
    sequelize: db, // Passa l'istanza Sequelize
    modelName: 'User', // Nome del modello
    tableName: 'users', // Nome della tabella nel database
    timestamps: true, // Aggiungi i campi createdAt e updatedAt automaticamente
  }
);

// Definisce la relazione tra User e Dataset
User.hasMany(Dataset, { foreignKey: 'userId' }); // Un utente può avere molti dataset
Dataset.belongsTo(User, { foreignKey: 'userId' }); // Un dataset appartiene a un singolo utente

export { User, UserAttributes, UserCreationAttributes };
