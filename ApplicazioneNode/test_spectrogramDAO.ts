import SpectrogramDAOApplication from './DAO/spectrogramDao';
import Spectrogram, { SpectrogramCreationAttributes } from './Model/spectrogram'; // Assicurati di avere il percorso corretto
import { initModels } from './Model/init_database';
import fs from 'fs';
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile);

async function runTests() {
  // Sincronizza il database con il modello Spectrogram
  await initModels();

  // Crea un'istanza di SpectrogramDAOApplication
  const spectrogramDAOApp = new SpectrogramDAOApplication();
  const filePath = "./Data/Screenshot 2024-06-16 alle 17.45.12.png"

  const fileData = await readFileAsync(filePath);

  // Esempi di dati per i test
  const newSpectrogram: SpectrogramCreationAttributes = {
    id: 'S0003',
    data: fileData,
    datasetId: '0001', // Assicurati di avere un dataset con ID corrispondente nel database
  };

  try {
    // Test di addSpectrogram
    console.log('Adding a new spectrogram...');
    await spectrogramDAOApp.addSpectrogram(newSpectrogram);

    // Test di getSpectrogram
    console.log('Getting the spectrogram by ID...');
    const spectrogram = await spectrogramDAOApp.getSpectrogram('S0001'); // Assicurati di avere un spectrogram con ID 1 nel database
    console.log('Spectrogram:', spectrogram);

    // Test di getAllSpectrograms
    console.log('Getting all spectrograms...');
    const allSpectrograms = await spectrogramDAOApp.getAllSpectrograms();
    console.log('All spectrograms:', allSpectrograms);

    // Test di updateSpectrogram
    /* console.log('Updating the spectrogram...');
    await spectrogramDAOApp.updateSpectrogram(spectrogram!, { description: 'Updated description' });
    const updatedSpectrogram = await spectrogramDAOApp.getSpectrogram('1');
    console.log('Updated spectrogram:', updatedSpectrogram);
 */
    // Test di deleteSpectrogram
    /* console.log('Deleting the spectrogram...');
    await spectrogramDAOApp.deleteSpectrogram(spectrogram!); */

    // Esempio di test per getAllDatasetsByUser
    console.log('Getting all spectrograms by dataset...');
    const spectrogramsByDataset = await spectrogramDAOApp.getAllSpectrogramsByDataset('0001'); // Assicurati di avere spectrograms associati al dataset con ID 1
    console.log('Spectrograms by dataset:', spectrogramsByDataset);
  }catch (error) {
    console.error('Error during tests:', error);
}
}

runTests();
