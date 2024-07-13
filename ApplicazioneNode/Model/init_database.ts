import db from '../Config/db_config';
import { User } from './user';
import Dataset from './dataset';
import Spectrogram from './spectrogram';

// Function to synchronize the database
const initModels = async () => {
  await db.sync({ force: false });
  console.log("Database & tables created!");
};

// Export Sequelize models and the database initialization function
export { User, Dataset, Spectrogram, initModels };
