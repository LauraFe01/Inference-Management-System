import { Dao } from './dao';
import Spectrogram from '../Model/spectrogram';
import { SpectrogramCreationAttributes } from '../Model/spectrogram';
import { Transaction, UniqueConstraintError } from 'sequelize';

/**
 * Implementation of SpectrogramDaoImpl class adhering to the Dao interface.
 */
class SpectrogramDaoImpl implements Dao<Spectrogram> {
  /**
   * Retrieves a Spectrogram from the database using its ID.
   * @param {number} id - The ID of the spectrogram to retrieve.
   * @returns {Promise<Spectrogram | null>} A Promise that resolves with the found Spectrogram or null if not found.
   */
  async get(id: number): Promise<Spectrogram | null> {
    return await Spectrogram.findByPk(id);
  }

  /**
   * Retrieves all Spectrograms from the database.
   * @returns {Promise<Spectrogram[]>} A Promise that resolves with an array of Spectrograms.
   */
  async getAll(): Promise<Spectrogram[]> {
    return await Spectrogram.findAll();
  }

  /**
   * Saves a new Spectrogram to the database.
   * @param {SpectrogramCreationAttributes} spectrogramAttributes - The attributes needed to create a new Spectrogram.
   * @param {Transaction} [transaction] - Optional transaction to perform the operation within a transaction context.
   * @returns {Promise<void>} A Promise that resolves when the Spectrogram is saved.
   * @throws Throws an error if the ID already exists (UniqueConstraintError).
   */
  async save(spectrogramAttributes: SpectrogramCreationAttributes, transaction?: Transaction): Promise<void> {
    try {
      await Spectrogram.create(spectrogramAttributes, { transaction });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new Error('ID already exists');
      }
      throw error;
    }
  }

  /**
   * Updates an existing Spectrogram in the database.
   * @param {Spectrogram} spectrogram - The Spectrogram to update.
   * @param {...any[]} params - Additional parameters needed for the update, in this case updateValues.
   * @returns {Promise<void>} A Promise that resolves when the Spectrogram is updated.
   * @throws Throws an error if the ID already exists (UniqueConstraintError).
   */
  async update(spectrogram: Spectrogram, ...params: any[]): Promise<void> {
    try {
      const [updateValues] = params;
      await spectrogram.update(updateValues);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new Error('ID already exists');
      }
      throw error;
    }
  }

  /**
   * Deletes a Spectrogram from the database.
   * @param {Spectrogram} spectrogram - The Spectrogram to delete.
   * @returns {Promise<void>} A Promise that resolves when the Spectrogram is deleted.
   */
  async delete(spectrogram: Spectrogram): Promise<void> {
    await spectrogram.destroy();
  }

  /**
   * Retrieves all Spectrograms associated with a specific Dataset ID from the database.
   * @param {number} datasetId - The ID of the Dataset whose Spectrograms to retrieve.
   * @returns {Promise<Spectrogram[]>} A Promise that resolves with an array of Spectrograms.
   */
  async getAllSpectrogramsByDataset(datasetId: number): Promise<Spectrogram[]> {
    return await Spectrogram.findAll({ where: { datasetId: datasetId } });
  }
}

/**
 * SpectrogramDAOApplication class that uses SpectrogramDaoImpl to perform Spectrogram operations.
 */
class SpectrogramDAOApplication {
  spectrogramDao: SpectrogramDaoImpl;

  /**
   * Constructor that initializes an instance of SpectrogramDaoImpl.
   */
  constructor() {
    this.spectrogramDao = new SpectrogramDaoImpl();
  }

  /**
   * Retrieves a Spectrogram by its ID.
   * @param {number} id - The ID of the Spectrogram to retrieve.
   * @returns {Promise<Spectrogram | null>} A Promise that resolves with the found Spectrogram or null if not found.
   */
  async getSpectrogram(id: number): Promise<Spectrogram | null> {
    return await this.spectrogramDao.get(id);
  }

  /**
   * Retrieves all Spectrograms.
   * @returns {Promise<Spectrogram[]>} A Promise that resolves with an array of Spectrograms.
   */
  async getAllSpectrograms(): Promise<Spectrogram[]> {
    return await this.spectrogramDao.getAll();
  }

  /**
   * Adds a new Spectrogram.
   * @param {SpectrogramCreationAttributes} spectrogramAttributes - The attributes needed to create a new Spectrogram.
   * @param {Transaction} [transaction] - Optional transaction to perform the operation within a transaction context.
   * @returns {Promise<void>} A Promise that resolves when the Spectrogram is saved.
   */
  async addSpectrogram(spectrogramAttributes: SpectrogramCreationAttributes, transaction?: Transaction): Promise<void> {
    return await this.spectrogramDao.save(spectrogramAttributes, transaction);
  }

  /**
   * Updates an existing Spectrogram.
   * @param {Spectrogram} spectrogram - The Spectrogram to update.
   * @param {Partial<Spectrogram>} updateValues - The updated attributes of the Spectrogram.
   * @returns {Promise<void>} A Promise that resolves when the Spectrogram is updated.
   */
  async updateSpectrogram(spectrogram: Spectrogram, updateValues: Partial<Spectrogram>): Promise<void> {
    return await this.spectrogramDao.update(spectrogram, updateValues);
  }

  /**
   * Deletes a Spectrogram.
   * @param {Spectrogram} spectrogram - The Spectrogram to delete.
   * @returns {Promise<void>} A Promise that resolves when the Spectrogram is deleted.
   */
  async deleteSpectrogram(spectrogram: Spectrogram): Promise<void> {
    return await this.spectrogramDao.delete(spectrogram);
  }

  /**
   * Retrieves all Spectrograms associated with a specific Dataset ID.
   * @param {number} datasetId - The ID of the Dataset whose Spectrograms to retrieve.
   * @returns {Promise<Spectrogram[]>} A Promise that resolves with an array of Spectrograms.
   */
  async getAllSpectrogramsByDataset(datasetId: number): Promise<Spectrogram[]> {
    return await this.spectrogramDao.getAllSpectrogramsByDataset(datasetId);
  }
}

// Export the SpectrogramDAOApplication class as the default export
export default SpectrogramDAOApplication;
