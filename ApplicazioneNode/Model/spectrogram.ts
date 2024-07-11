import { Model, DataTypes } from 'sequelize';
import db from '../Config/db_config';
import { Optional } from 'sequelize';

interface SpectrogramAttributes {
  id?: number;
  name?: string;
  data: Buffer;
  datasetId: string;
}

interface SpectrogramCreationAttributes extends  Optional<SpectrogramAttributes, 'id' | 'name'> {}

class Spectrogram extends Model<SpectrogramAttributes, SpectrogramCreationAttributes> implements SpectrogramAttributes {
    public id!: number;
    public name!: string;
    public data!: Buffer;
    public datasetId!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    }
  
    Spectrogram.init(
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
            allowNull: false,
          },
          data: {
            type: DataTypes.BLOB, // Utilizzo di BLOB per memorizzare i dati delle immagini
            allowNull: false,
          },
          datasetId: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
        },
        {
          sequelize: db,
          modelName: 'Spectrogram',
          tableName: 'spectrograms',
          timestamps: true,
        }
      );
        

    export default Spectrogram;
    export { SpectrogramAttributes, SpectrogramCreationAttributes };