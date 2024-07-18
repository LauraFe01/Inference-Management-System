import db from './Config/db_config';
import { User } from './Model/user';
import Dataset from './Model/dataset';
import Spectrogram from './Model/spectrogram';

// Function to synchronize the database
const initModels = async () => {
  await db.sync({ force: false });
  console.log("Database & tables created!");
};

// Export Sequelize models and the database initialization function
export { User, Dataset, Spectrogram, initModels };

