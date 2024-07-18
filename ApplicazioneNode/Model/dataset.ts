import { Model, DataTypes, Optional } from 'sequelize';
import db from '../Config/db_config'; // Sequelize instance
import Spectrogram from './spectrogram'; // Spectrogram model

// Define the attributes for Dataset
interface DatasetAttributes {
  id: number;
  name: string;
  description: string;
  tags: string[];
  userId: number;
  deletedAt: Date | null; // Nullable Date for soft deletion
}

// Define the attributes for Dataset that can be optionally provided when creating
interface DatasetCreationAttributes extends Optional<DatasetAttributes, 'id' | 'deletedAt' | 'tags'> {}

/**
 * Dataset Model class
 * @class Dataset
 * @extends Model<DatasetAttributes, DatasetCreationAttributes>
 * @implements {DatasetAttributes}
 */
class Dataset extends Model<DatasetAttributes, DatasetCreationAttributes> implements DatasetAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public tags!: string[];
  public userId!: number;
  public readonly deletedAt!: Date | null;
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
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    }
  },
  {
    sequelize: db, // Sequelize instance
    paranoid: true, // Enable soft deletion
    modelName: 'Dataset', // Model name in Sequelize
    tableName: 'datasets', // Table name in the database
    timestamps: true, // Enable timestamps
  }
);

// Define associations
/**
 * Define association: Dataset has many Spectrograms
 * @method Dataset.hasMany
 * @param {typeof Spectrogram} Spectrogram - Spectrogram model
 * @param {object} options - Association options
 * @param {string} options.foreignKey - Foreign key in Spectrogram referencing Dataset
 */
Dataset.hasMany(Spectrogram, { foreignKey: 'datasetId' });

/**
 * Define association: Spectrogram belongs to Dataset
 * @method Spectrogram.belongsTo
 * @param {typeof Dataset} Dataset - Dataset model
 * @param {object} options - Association options
 * @param {string} options.foreignKey - Foreign key in Spectrogram referencing Dataset
 */
Spectrogram.belongsTo(Dataset, { foreignKey: 'datasetId' });

// Export the Dataset model and its attribute interfaces
export default Dataset;
export { DatasetAttributes, DatasetCreationAttributes };
