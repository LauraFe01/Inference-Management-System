import { Model, DataTypes, Optional } from 'sequelize';
import db from '../Config/db_config';
import Spectrogram from './spectrogram';


interface DatasetAttributes {
  id: string;
  name: string;
  description: string;
  userId: string;
}

interface DatasetCreationAttributes extends Optional<DatasetAttributes, 'id'> {}

class Dataset extends Model<DatasetAttributes, DatasetCreationAttributes> implements DatasetAttributes {
    public id!: string;
    public name!: string;
    public description!: string;
    public userId!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    }
  
    Dataset.init(
        {
          id: {
            type: DataTypes.STRING,
            primaryKey: true,
          },
          name: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          description: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          userId: {
            type: DataTypes.STRING,
            allowNull: false,
          },
        },
        {
          sequelize: db,
          modelName: 'Dataset',
          tableName: 'datasets',
          timestamps: true,
        }
      );
      
    Dataset.hasMany(Spectrogram, { foreignKey: 'datasetId' });
    Spectrogram.belongsTo(Dataset, { foreignKey: 'datasetId' });
        

    export default Dataset;
    export { DatasetAttributes, DatasetCreationAttributes };