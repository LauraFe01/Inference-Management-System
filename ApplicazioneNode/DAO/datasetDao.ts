import { Dao } from './dao';
import Dataset from '../Model/dataset';
import { DatasetCreationAttributes } from '../Model/dataset';
import ErrorFactory, { ErrorType } from '../Errors/errorFactory';
import { arraysEqual } from '../Utils/utils';

/**
 * Implementation of DatasetDaoImpl class adhering to the Dao interface.
 */
class DatasetDaoImpl implements Dao<Dataset> {
  /**
   * Retrieves a Dataset from the database using its ID.
   * @param {number} id - The ID of the dataset to retrieve.
   * @returns {Promise<Dataset | null>} A Promise that resolves with the found Dataset or null if not found.
   */
  async get(id: number): Promise<Dataset | null> {
    return await Dataset.findOne({ where: { id: id } });
  }

  /**
   * Retrieves all Datasets from the database.
   * @returns {Promise<Dataset[]>} A Promise that resolves with an array of Datasets.
   */
  async getAll(): Promise<Dataset[]> {
    return await Dataset.findAll();
  }

  /**
   * Saves a new Dataset to the database.
   * @param {DatasetCreationAttributes} datasetAttributes - The attributes needed to create a new Dataset.
   * @returns {Promise<void>} A Promise that resolves when the Dataset is saved.
   * @throws Throws any error encountered during saving, typically a ValidationError or InternalServerError.
   */
  async save(datasetAttributes: DatasetCreationAttributes): Promise<void> {
    try {
      if (datasetAttributes.name) {
        // Check if a dataset with the same name already exists for the user
        const existingDataset = await Dataset.findOne({
          where: {
            name: datasetAttributes.name,
            userId: datasetAttributes.userId
          }
        });

        if (existingDataset && existingDataset.name === datasetAttributes.name) {
          throw ErrorFactory.createError(ErrorType.ValidationError, `Dataset name '${datasetAttributes.name}' already exists for this user.`);
        }
      }

      // Create the dataset in the database
      await Dataset.create(datasetAttributes);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates an existing Dataset in the database.
   * @param {Dataset} dataset - The Dataset to update.
   * @param {Partial<Dataset>} params - Other parameters needed for the update, in this case updateValues.
   * @returns {Promise<void>} A Promise that resolves when the Dataset is updated.
   * @throws Throws a FieldsNotUpdatable error if trying to update id or userId fields.
   *         Throws a ValidationError if the updated values are invalid.
   */
  async update(dataset: Dataset, ...params: any[]): Promise<void> {
    const [updateValues] = params;
  
    if (updateValues.id || updateValues.userId) {
      throw ErrorFactory.createError(ErrorType.FieldsNotUpdatable, 'id and userId cannot be updated!');
    }
  
    if (updateValues.name === "" ) {
      throw ErrorFactory.createError(ErrorType.ValidationError, 'DatasetName cannot be an empty string!');
    }
  
    // Funzione per confrontare solo i campi presenti
    function hasChanges(existing: Dataset, updates: any): boolean {
      if (updates.name !== undefined && existing.name !== updates.name) return true;
      if (updates.description !== undefined && existing.description !== updates.description) return true;
      if (updates.tags !== undefined && !arraysEqual(existing.tags, updates.tags)) return true;
      return false;
    }
  
    // Trova il dataset esistente con lo stesso nome per l'utente
    if (updateValues.name){
      const existingDataset = await Dataset.findOne({
        where: {
          name: updateValues.name,
          userId: dataset.userId
        }
      });
    
      // Controlla se esiste un dataset con lo stesso nome
      if (existingDataset && existingDataset.name !== dataset.name) {
        throw ErrorFactory.createError(ErrorType.ValidationError, `Dataset name '${existingDataset.name}' already exists for this user.`);
      }
    }
  
    // Confronta i valori aggiornati solo se sono presenti
    if (!hasChanges(dataset, updateValues)) {
      throw ErrorFactory.createError(ErrorType.ValidationError, 'Nothing new to update!');
    }
  
    // Applica gli aggiornamenti
    await dataset.update(updateValues);
  }

  /**
   * Deletes a Dataset from the database.
   * @param {Dataset} dataset - The Dataset to delete.
   * @returns {Promise<void>} A Promise that resolves when the Dataset is deleted.
   */
  async delete(dataset: Dataset): Promise<void> {
    await dataset.destroy();
  }

  /**
   * Retrieves all Datasets belonging to a specific user from the database.
   * @param {string} userID - The ID of the user whose Datasets to retrieve.
   * @returns {Promise<Dataset[]>} A Promise that resolves with an array of Datasets.
   */
  async getAllDatasetsByUser(userID: string): Promise<Dataset[]> {
    return await Dataset.findAll({ where: { userId: userID } });
  }

  /**
   * Retrieves a Dataset by its name and userId.
   * @param {string} dbName - The name of the Dataset to retrieve.
   * @param {number} userId - The ID of the user owning the Dataset.
   * @returns {Promise<Dataset | null>} A Promise that resolves with the found Dataset or null if not found.
   */
  async getByName(dbName: string, userId: number): Promise<Dataset | null> {
    const existingDataset = await Dataset.findOne({
      where: {
        name: dbName,
        userId: userId
      }
    });
    return existingDataset;
  }
}


/**
 * DatasetDAOApplication class that uses DatasetDaoImpl to perform Dataset operations.
 */
class DatasetDAOApplication {
  datasetDao: DatasetDaoImpl;

  /**
   * Constructor that initializes an instance of DatasetDaoImpl.
   */
  constructor() {
    this.datasetDao = new DatasetDaoImpl();
  }

  /**
   * Retrieves a Dataset by its ID.
   * @param {number} id - The ID of the Dataset to retrieve.
   * @returns {Promise<Dataset | null>} A Promise that resolves with the found Dataset or null if not found.
   */
  async getDataset(id: number): Promise<Dataset | null> {
    return await this.datasetDao.get(id);
  }

  /**
   * Retrieves all Datasets.
   * @returns {Promise<Dataset[]>} A Promise that resolves with an array of Datasets.
   */
  async getAllDatasets(): Promise<Dataset[]> {
    return await this.datasetDao.getAll();
  }

  /**
   * Adds a new Dataset.
   * @param {DatasetCreationAttributes} datasetAttributes - The attributes needed to create a new Dataset.
   * @returns {Promise<void>} A Promise that resolves when the Dataset is saved.
   */
  async addDataset(datasetAttributes: DatasetCreationAttributes): Promise<void> {
    return await this.datasetDao.save(datasetAttributes);
  }

  /**
   * Updates an existing Dataset.
   * @param {Dataset} dataset - The Dataset to update.
   * @param {Partial<Dataset>} updateValues - The updated attributes of the Dataset.
   * @returns {Promise<void>} A Promise that resolves when the Dataset is updated.
   */
  async updateDataset(dataset: Dataset, updateValues: Partial<Dataset>): Promise<void> {
    return await this.datasetDao.update(dataset, updateValues);
  }

  /**
   * Deletes a Dataset.
   * @param {Dataset} dataset - The Dataset to delete.
   * @returns {Promise<void>} A Promise that resolves when the Dataset is deleted.
   */
  async deleteDataset(dataset: Dataset): Promise<void> {
    return await this.datasetDao.delete(dataset);
  }

  /**
   * Retrieves all Datasets belonging to a specific user.
   * @param {string} userID - The ID of the user whose Datasets to retrieve.
   * @returns {Promise<Dataset[]>} A Promise that resolves with an array of Datasets.
   */
  async getAllDatasetsByUser(userID: string): Promise<Dataset[]> {
    return await this.datasetDao.getAllDatasetsByUser(userID);
  }

  /**
   * Retrieves a Dataset by its name and userId.
   * @param {string} name - The name of the Dataset to retrieve.
   * @param {number} userId - The ID of the user owning the Dataset.
   * @returns {Promise<Dataset | null>} A Promise that resolves with the found Dataset or null if not found.
   */
  async getByName(name: string, userId: number): Promise<Dataset | null> {
    return await this.datasetDao.getByName(name, userId);
  }
}

// Export the DatasetDAOApplication class as the default export
export default DatasetDAOApplication;
