import db from '../Config/db_config';
import {User} from './user';
import Dataset from './dataset';
import Spectrogram from './spectrogram';


//funzione per sincronizzare il db
const initModels = async () => {
  await db.sync({ force: false });
  console.log("Database & tables created!");
};

export { User, Dataset, Spectrogram, initModels };