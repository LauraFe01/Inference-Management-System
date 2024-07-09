import { Model, DataTypes } from 'sequelize';
import db from '../Config/db_config';

interface SpectrogramAttributes {
  id: string;
  data: Buffer;
  datasetId: string;
}

interface SpectrogramCreationAttributes extends SpectrogramAttributes {}

class Spectrogram extends Model<SpectrogramAttributes, SpectrogramCreationAttributes> implements SpectrogramAttributes {
    public id!: string;
    public data!: Buffer;
    public datasetId!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    }
  
    Spectrogram.init(
        {
          id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true,
          },
          data: {
            type: DataTypes.BLOB, // Utilizzo di BLOB per memorizzare i dati delle immagini
            allowNull: false,
          },
          datasetId: {
            type: DataTypes.STRING,
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