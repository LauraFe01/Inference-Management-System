import DatasetDAOApplication from './DAO/datasetDao';
import Dataset, { DatasetCreationAttributes } from './Model/dataset'; // Assicurati di avere il percorso corretto
import { initModels } from './Model/init_database';

async function runTests() {
  // Sincronizza il database con il modello Dataset
  await initModels();

  // Crea un'istanza di DatasetDAOApplication
  const datasetDAOApp = new DatasetDAOApplication();

  // Esempi di dati per i test
  const newDataset: DatasetCreationAttributes = {
    name: 'Test Dataset',
    description: 'This is a test dataset',
    userId: '14', 
  }

  try {
    // Test di addDataset
    console.log('Adding a new dataset...');
    await datasetDAOApp.addDataset(newDataset);

    // Test di getDataset
    /* console.log('Getting the dataset by ID...');
    const dataset = await datasetDAOApp.getDataset('16666'); // Assicurati di avere un dataset con ID 1 nel database
    console.log('Dataset:', dataset); */

    // Test di getAllDatasets
    /* console.log('Getting all datasets...');
    const allDatasets = await datasetDAOApp.getAllDatasets();
    console.log('All datasets:', allDatasets); */

    // Test di updateDataset
    /* console.log('Updating the dataset...');
    await datasetDAOApp.updateDataset(dataset!, { description: 'Updated description 2' });
    const updatedDataset = await datasetDAOApp.getDataset('0002');
    console.log('Updated dataset:', updatedDataset);

    // Test di deleteDataset
    console.log('Deleting the dataset...');
    await datasetDAOApp.deleteDataset(updatedDataset!);
    const deletedDataset = await datasetDAOApp.getDataset('16666');
    console.log('Deleted dataset:', deletedDataset);

    // Esempio di test per getAllDatasetsByUser
    console.log('Getting all datasets by user...');
    const datasetsByUser = await datasetDAOApp.getAllDatasetsByUser('14'); // Assicurati di avere dataset associati all'utente con ID 1
    console.log('Datasets by user:', datasetsByUser);*/
  }  catch (error) {
    console.error('Error during tests:', error);
  }
}

// Esegui i test
runTests();
