import { Dao } from './dao';
import Dataset from '../Model/dataset';  // Assicurati di avere il percorso corretto
import { DatasetCreationAttributes } from '../Model/dataset'; // Dovrai definire questa interfaccia

class DatasetDaoImpl implements Dao<Dataset> {
    async get(id: string): Promise<Dataset | null> {
      return await Dataset.findByPk(id);
    }
  
    async getAll(): Promise<Dataset[]> {
      return await Dataset.findAll();
    }
  
    async save(datasetAttributes: DatasetCreationAttributes): Promise<void> {
      await Dataset.create(datasetAttributes);
    }
  
    async update(dataset: Dataset, ...params: any[]): Promise<void> {
      const [updateValues] = params;
      await dataset.update(updateValues);
    }
  
    async delete(dataset: Dataset): Promise<void> {
      await dataset.destroy();
    }
}



class DatasetDAOApplication {
    datasetDao: DatasetDaoImpl;
  
    constructor() {
      this.datasetDao = new DatasetDaoImpl();
    }
  
    async getDataset(id: string): Promise<Dataset | null> {
      return await this.datasetDao.get(id);
    }
  
    async getAllDatasets(): Promise<Dataset[]> {
      return await this.datasetDao.getAll();
    }
  
    async addDataset(datasetAttributes: DatasetCreationAttributes): Promise<void> {
      return await this.datasetDao.save(datasetAttributes);
    }
  
    async updateDataset(dataset: Dataset, updateValues: Partial<Dataset>): Promise<void> {
      return await this.datasetDao.update(dataset, updateValues);
    }
  
    async deleteDataset(dataset: Dataset): Promise<void> {
      return await this.datasetDao.delete(dataset);
    }
  }
  
  export default DatasetDAOApplication;
