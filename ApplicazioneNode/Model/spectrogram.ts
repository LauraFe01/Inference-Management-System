import { Model, DataTypes } from 'sequelize';
import db from '../Config/db_config'; // Import Sequelize instance
import { Optional } from 'sequelize';

// Define interface for Spectrogram attributes
interface SpectrogramAttributes {
  id?: number;         
  name?: string;       
  data: Buffer;        
  datasetId: number;   
}

// Define interface for Spectrogram creation attributes
interface SpectrogramCreationAttributes extends Optional<SpectrogramAttributes, 'id' | 'name'> {}

// Define Spectrogram model class
class Spectrogram extends Model<SpectrogramAttributes, SpectrogramCreationAttributes> implements SpectrogramAttributes {
    public id!: number;           
    public name!: string;         
    public data!: Buffer;         
    public datasetId!: number;    

    public readonly createdAt!: Date;  
    public readonly updatedAt!: Date;  
}
  
// Initialize Spectrogram model with Sequelize
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
        type: DataTypes.BLOB,  
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
        
// Export the Spectrogram model and its attribute interfaces
export default Spectrogram; 
export { SpectrogramAttributes, SpectrogramCreationAttributes }; 
