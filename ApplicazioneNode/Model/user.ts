import { Model, DataTypes, Optional } from 'sequelize';
import db from '../Config/db_config'; // Import Sequelize instance
import Dataset from './dataset'; // Import Dataset model

// Define interface for User attributes representing columns in the 'users' table
interface UserAttributes {
  id?: number;         // Optional unique identifier (auto-generated by Sequelize)
  email: string;       // Email of the user (must be unique)
  password: string;    // Password of the user
  numToken: number;    // Number of tokens for the user
  isAdmin: boolean;    // Indicates if the user is an admin
  createdAt?: Date;    // Automatically managed by Sequelize (optional)
  updatedAt?: Date;    // Automatically managed by Sequelize (optional)
}

// Define attributes required to create a new user
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

/**
 * User Model class
 * @class User
 * @extends Model<UserAttributes, UserCreationAttributes>
 * @implements {UserAttributes}
 */
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  
  public email!: string;      // Email of the user
  public password!: string;   // Password of the user
  public numToken!: number;   // Number of tokens for the user
  public isAdmin!: boolean;   // Indicates if the user is an admin

  // Automatically managed fields by Sequelize
  public id!: number;
  public readonly createdAt!: Date; 
  public readonly updatedAt!: Date;
}

// Initialize the User model with attributes and options
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false, // Required field
      unique: true,     // Must be unique
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false, // Required field
    },
    numToken: {
      type: DataTypes.FLOAT,
      allowNull: false, // Required field
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false, // Required field
    },
  },
  {
    sequelize: db,        // Sequelize instance
    modelName: 'User',    // Model name
    tableName: 'users',   // Table name in the database
    timestamps: true,    // Automatically add createdAt and updatedAt fields
  }
);

// Define the relationship between User and Dataset
/**
 * Define association: User has many Datasets
 * @method User.hasMany
 * @param {typeof Dataset} Dataset - Dataset model
 * @param {object} options - Association options
 * @param {string} options.foreignKey - Foreign key in Dataset referencing User
 */
User.hasMany(Dataset, { foreignKey: 'userId' });

/**
 * Define association: Dataset belongs to User
 * @method Dataset.belongsTo
 * @param {typeof User} User - User model
 * @param {object} options - Association options
 * @param {string} options.foreignKey - Foreign key in Dataset referencing User
 */
Dataset.belongsTo(User, { foreignKey: 'userId' });

export { User, UserAttributes, UserCreationAttributes };
