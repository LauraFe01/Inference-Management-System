import { Model, DataTypes, Optional } from 'sequelize';
import db from '../Config/db_config';
import Spectrogram from './spectrogram';


interface DatasetAttributes {
  id: number;
  name: string;
  description: string;
  isCancelled: boolean;
  userId: number;
}

interface DatasetCreationAttributes extends Optional<DatasetAttributes, 'id'|'isCancelled'> {}

class Dataset extends Model<DatasetAttributes, DatasetCreationAttributes> implements DatasetAttributes {
    public id!: number;
    public name!: string;
    public description!: string;
    public userId!: number;
    public isCancelled!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    }
  
    Dataset.init(
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement:true,
            allowNull: false
          },
          name: {
            type: DataTypes.STRING,
            allowNull: false
          },
          description: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          isCancelled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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