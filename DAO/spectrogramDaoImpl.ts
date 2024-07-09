import { Dao } from './dao';
import Spectrogram from '../Model/spectrogram';  // Assicurati di avere il percorso corretto
import { SpectrogramCreationAttributes } from '../Model/spectrogram'; // Dovrai definire questa interfaccia

class SpectrogramDaoImpl implements Dao<Spectrogram> {
    async get(id: string): Promise<Spectrogram | null> {
      return await Spectrogram.findByPk(id);
    }
  
    async getAll(): Promise<Spectrogram[]> {
      return await Spectrogram.findAll();
    }
  
    async save(spectrogramAttributes: SpectrogramCreationAttributes): Promise<void> {
      await Spectrogram.create(spectrogramAttributes);
    }
  
    async update(spectrogram: Spectrogram, ...params: any[]): Promise<void> {
      const [updateValues] = params;
      await spectrogram.update(updateValues);
    }
  
    async delete(spectrogram: Spectrogram): Promise<void> {
      await spectrogram.destroy();
    }
}


class SpectrogramDAOApplication {
    spectrogramDao: SpectrogramDaoImpl;
  
    constructor() {
      this.spectrogramDao = new SpectrogramDaoImpl();
    }
  
    async getSpectrogram(id: string): Promise<Spectrogram | null> {
      return await this.spectrogramDao.get(id);
    }
  
    async getAllSpectrograms(): Promise<Spectrogram[]> {
      return await this.spectrogramDao.getAll();
    }
  
    async addSpectrogram(spectrogramAttributes: SpectrogramCreationAttributes): Promise<void> {
      return await this.spectrogramDao.save(spectrogramAttributes);
    }
  
    async updateSpectrogram(spectrogram: Spectrogram, updateValues: Partial<Spectrogram>): Promise<void> {
      return await this.spectrogramDao.update(spectrogram, updateValues);
    }
  
    async deleteSpectrogram(spectrogram: Spectrogram): Promise<void> {
      return await this.spectrogramDao.delete(spectrogram);
    }
  }
  
  export default SpectrogramDAOApplication;