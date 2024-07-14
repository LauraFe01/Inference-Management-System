import { Dao } from './dao';
import Dataset from '../Model/dataset';
import { DatasetCreationAttributes } from '../Model/dataset';
import { UniqueConstraintError } from 'sequelize';

// Implementazione della classe DatasetDaoImpl che aderisce all'interfaccia Dao per il modello Dataset
class DatasetDaoImpl implements Dao<Dataset> {
  /**
   * Recupera un Dataset dal database utilizzando il suo ID.
   * @param id - L'ID del dataset da recuperare.
   * @returns Una Promise che risolve con il Dataset trovato o null se non trovato.
   */
  async get(id: number): Promise<Dataset | null> {
    return await Dataset.findOne({ where: {id:id, isCancelled: false } });
  }

  /**
   * Recupera tutti i Dataset dal database.
   * @returns Una Promise che risolve con un array di Dataset.
   */
  async getAll(): Promise<Dataset[]> {
    return await Dataset.findAll({ where: {isCancelled: false } });
  }

  /**
   * Salva un nuovo Dataset nel database.
   * @param datasetAttributes - Gli attributi necessari per creare un nuovo Dataset.
   * @returns Una Promise che si risolve quando il Dataset è stato salvato.
   */
  async save(datasetAttributes: DatasetCreationAttributes): Promise<void> {
    try {
      console.log(datasetAttributes.name)
      if (datasetAttributes.name) {
        const existingDataset = await Dataset.findOne({
        where: {
            name: datasetAttributes.name,
            userId: datasetAttributes.userId
        }
      });
  
        if (existingDataset && existingDataset.name == datasetAttributes.name) {
          throw new Error(`Un dataset con il nome '${datasetAttributes.name}' già esiste per questo utente.`);
        }
      }
      await Dataset.create(datasetAttributes);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new Error('ID already exists');
      }
      throw error;
    }
  }

  /**
   * Aggiorna un Dataset esistente nel database.
   * @param dataset - Il Dataset da aggiornare.
   * @param params - Altri parametri necessari per l'aggiornamento, in questo caso gli updateValues.
   * @returns Una Promise che si risolve quando il Dataset è stato aggiornato.
   */
  async update(dataset: Dataset, ...params: any[]): Promise<void> {
    const [updateValues] = params;

    if (updateValues.name) {

      const existingDataset = await Dataset.findOne({
        where: {
          name: updateValues.name,
          userId: dataset.userId
        }
      });

      if (existingDataset && existingDataset.name !== dataset.name) {
        throw new Error(`Un dataset con il nome '${updateValues.name}' già esiste per questo utente.`);
      }
    }
      await dataset.update(updateValues);
  
  }

  /**
   * Elimina un Dataset dal database.
   * @param dataset - Il Dataset da eliminare.
   * @returns Una Promise che si risolve quando il Dataset è stato eliminato.
   */
  async delete(dataset: Dataset): Promise<void> {
    await dataset.destroy();
  }

  async getAllDatasetsByUser(userID: string):Promise<Dataset[]>{
      return await Dataset.findAll({ where: { userId: userID, isCancelled: false } }); 
  }

  async getByName(dbName: string, userId: number): Promise<Dataset | null> {

    const existingDataset = await Dataset.findOne({
      where: {
        name: dbName,
        userId: userId,
        isCancelled: false
      }});
    return existingDataset
  }
}

// Classe DatasetDAOApplication che utilizza DatasetDaoImpl per eseguire operazioni sui Dataset
class DatasetDAOApplication {
  datasetDao: DatasetDaoImpl;

  // Costruttore che inizializza un'istanza di DatasetDaoImpl
  constructor() {
    this.datasetDao = new DatasetDaoImpl();
  }

  /**
   * Recupera un Dataset utilizzando il suo ID.
   * @param id - L'ID del Dataset da recuperare.
   * @returns Una Promise che risolve con il Dataset trovato o null se non trovato.
   */
  async getDataset(id: number): Promise<Dataset | null> {
    return await this.datasetDao.get(id);
  }

  /**
   * Recupera tutti i Dataset.
   * @returns Una Promise che risolve con un array di Dataset.
   */
  async getAllDatasets(): Promise<Dataset[]> {
    return await this.datasetDao.getAll();
  }

  /**
   * Aggiunge un nuovo Dataset.
   * @param datasetAttributes - Gli attributi necessari per creare un nuovo Dataset.
   * @returns Una Promise che si risolve quando il Dataset è stato salvato.
   */
  async addDataset(datasetAttributes: DatasetCreationAttributes): Promise<void> {
    return await this.datasetDao.save(datasetAttributes);
  }

  /**
   * Aggiorna un Dataset esistente.
   * @param dataset - Il Dataset da aggiornare.
   * @param updateValues - Gli attributi aggiornati del Dataset.
   * @returns Una Promise che si risolve quando il Dataset è stato aggiornato.
   */
  async updateDataset(dataset: Dataset, updateValues: Partial<Dataset>): Promise<void> {
    return await this.datasetDao.update(dataset, updateValues);
  }

  /**
   * Elimina un Dataset.
   * @param dataset - Il Dataset da eliminare.
   * @returns Una Promise che si risolve quando il Dataset è stato eliminato.
   */
  async deleteDataset(dataset: Dataset): Promise<void> {
    return await this.datasetDao.delete(dataset);
  }

  async getAllDatasetsByUser(userID: string): Promise<Dataset[]> {
    return await this.datasetDao.getAllDatasetsByUser(userID);
  }

  async getByName(name: string, userId: number): Promise<Dataset | null> {
    return await this.datasetDao.getByName(name, userId);
  }
}

// Esporta la classe DatasetDAOApplication come esportazione predefinita
export default DatasetDAOApplication;
