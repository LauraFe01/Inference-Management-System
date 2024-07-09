import { initModels, User, Dataset, Spectrogram } from './init';
import { readFileSync } from 'fs';

const run = async () => {
  await initModels();

  const user = await User.create({
    id: "123",
    email: 'mario.rossi@example.com',
    password: 'password123',
    numToken: 5,
    isAdmin: false,
  });

  const dataset = await Dataset.create({
    id: "dat123",
    name: 'Dataset1',
    description: 'Questo è il primo dataset',
    userId: user.id,
  });

  const spectrogramData = readFileSync('/Users/lauraferretti/Documents/progettoPA/Screenshot 2024-06-16 alle 17.45.12.png'); // Carica il file dell'immagine

  const spectrogram = await Spectrogram.create({
    id: "spec123",
    data: spectrogramData,
    datasetId: dataset.id,
  });

  console.log(user.toJSON());
  console.log(dataset.toJSON());
  console.log(spectrogram.toJSON());
};

run().catch(console.error);
