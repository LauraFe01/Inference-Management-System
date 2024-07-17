import { Model, DataTypes, Optional } from 'sequelize';
import db from '../Config/db_config'; // Assuming this is your Sequelize instance
import Spectrogram from './spectrogram'; // Importing Spectrogram model
import ErrorFactory, { ErrorType } from '../Errors/errorFactory';

// Define the attributes for Dataset
interface DatasetAttributes {
  id: number;
  name: string;
  description: string;
  userId: number;
  deletedAt: Date;
}

// Define the attributes for Dataset that can be optionally provided when creating
interface DatasetCreationAttributes extends Optional<DatasetAttributes, 'id' | 'deletedAt' > {}

// Define the Dataset model class
class Dataset extends Model<DatasetAttributes, DatasetCreationAttributes> implements DatasetAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public userId!: number;
  public readonly deletedAt!: Date;
  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the Dataset model
Dataset.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    }
  },
  {
    sequelize: db, // Sequelize instance
    paranoid: true,
    modelName: 'Dataset', // Model name in Sequelize
    tableName: 'datasets', // Table name in the database
    timestamps: true, // Enable timestamps
  }
);

// Define associations
Dataset.hasMany(Spectrogram, { foreignKey: 'datasetId' }); // Dataset has many Spectrograms
Spectrogram.belongsTo(Dataset, { foreignKey: 'datasetId' }); // Spectrogram belongs to Dataset

// Export the Dataset model and its attribute interfaces
export default Dataset;
export { DatasetAttributes, DatasetCreationAttributes };
