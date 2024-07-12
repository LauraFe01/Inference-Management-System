import { Dao } from './dao';
import Spectrogram from '../Model/spectrogram';
import { SpectrogramCreationAttributes } from '../Model/spectrogram';
import { UniqueConstraintError } from 'sequelize';

// Implementazione della classe SpectrogramDaoImpl che aderisce all'interfaccia Dao per il modello Spectrogram
class SpectrogramDaoImpl implements Dao<Spectrogram> {
  /**
   * Recupera un Spectrogram dal database utilizzando il suo ID.
   * @param id - L'ID del spectrogram da recuperare.
   * @returns Una Promise che risolve con il Spectrogram trovato o null se non trovato.
   */
  async get(id: number): Promise<Spectrogram | null> {
    return await Spectrogram.findByPk(id);
  }

  /**
   * Recupera tutti i Spectrogram dal database.
   * @returns Una Promise che risolve con un array di Spectrogram.
   */
  async getAll(): Promise<Spectrogram[]> {
    return await Spectrogram.findAll();
  }

  /**
   * Salva un nuovo Spectrogram nel database.
   * @param spectrogramAttributes - Gli attributi necessari per creare un nuovo Spectrogram.
   * @returns Una Promise che si risolve quando il Spectrogram è stato salvato.
   */
  async save(spectrogramAttributes: SpectrogramCreationAttributes): Promise<void> {
    try {
      await Spectrogram.create(spectrogramAttributes);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new Error('ID already exists');
      }
      throw error;
    }
  }

  /**
   * Aggiorna un Spectrogram esistente nel database.
   * @param spectrogram - Il Spectrogram da aggiornare.
   * @param params - Altri parametri necessari per l'aggiornamento, in questo caso gli updateValues.
   * @returns Una Promise che si risolve quando il Spectrogram è stato aggiornato.
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
   * Elimina un Spectrogram dal database.
   * @param spectrogram - Il Spectrogram da eliminare.
   * @returns Una Promise che si risolve quando il Spectrogram è stato eliminato.
   */
  async delete(spectrogram: Spectrogram): Promise<void> {
    await spectrogram.destroy();
  }

  async getAllSpectrogramsByDataset(datasetId: number): Promise<Spectrogram[]>{
    return await Spectrogram.findAll({ where: { datasetId: datasetId } }); 
  }
}


// Classe SpectrogramDAOApplication che utilizza SpectrogramDaoImpl per eseguire operazioni sui Spectrogram
class SpectrogramDAOApplication {
  spectrogramDao: SpectrogramDaoImpl;

  // Costruttore che inizializza un'istanza di SpectrogramDaoImpl
  constructor() {
    this.spectrogramDao = new SpectrogramDaoImpl();
  }

  /**
   * Recupera un Spectrogram utilizzando il suo ID.
   * @param id - L'ID del Spectrogram da recuperare.
   * @returns Una Promise che risolve con il Spectrogram trovato o null se non trovato.
   */
  async getSpectrogram(id: number): Promise<Spectrogram | null> {
    return await this.spectrogramDao.get(id);
  }

  /**
   * Recupera tutti i Spectrogram.
   * @returns Una Promise che risolve con un array di Spectrogram.
   */
  async getAllSpectrograms(): Promise<Spectrogram[]> {
    return await this.spectrogramDao.getAll();
  }

  /**
   * Aggiunge un nuovo Spectrogram.
   * @param spectrogramAttributes - Gli attributi necessari per creare un nuovo Spectrogram.
   * @returns Una Promise che si risolve quando il Spectrogram è stato salvato.
   */
  async addSpectrogram(spectrogramAttributes: SpectrogramCreationAttributes): Promise<void> {
    return await this.spectrogramDao.save(spectrogramAttributes);
  }

  /**
   * Aggiorna un Spectrogram esistente.
   * @param spectrogram - Il Spectrogram da aggiornare.
   * @param updateValues - Gli attributi aggiornati del Spectrogram.
   * @returns Una Promise che si risolve quando il Spectrogram è stato aggiornato.
   */
  async updateSpectrogram(spectrogram: Spectrogram, updateValues: Partial<Spectrogram>): Promise<void> {
    return await this.spectrogramDao.update(spectrogram, updateValues);
  }

  /**
   * Elimina un Spectrogram.
   * @param spectrogram - Il Spectrogram da eliminare.
   * @returns Una Promise che si risolve quando il Spectrogram è stato eliminato.
   */
  async deleteSpectrogram(spectrogram: Spectrogram): Promise<void> {
    return await this.spectrogramDao.delete(spectrogram);
  }

  async getAllSpectrogramsByDataset(datasetId: number): Promise<Spectrogram[]> {
    return await this.spectrogramDao.getAllSpectrogramsByDataset(datasetId);
  }

}

// Esporta la classe SpectrogramDAOApplication come esportazione predefinita
export default SpectrogramDAOApplication;
