import { Dao } from './dao';
import { User, UserCreationAttributes } from '../Model/user';

class UserDaoImpl implements Dao<User> {
    async get(id: string): Promise<User | null> {
      return await User.findByPk(id);
    }
  
    async getAll(): Promise<User[]> {
      return await User.findAll();
    }
  
    async save(userAttributes: UserCreationAttributes): Promise<void> {
      await User.create(userAttributes);
    }
  
    async update(user: User, ...params: any[]): Promise<void> {
      const [updateValues] = params;
      await user.update(updateValues);
    }
  
    async delete(user: User): Promise<void> {
      await user.destroy();
    }
  }

  class UserDAOApplication {
    userDao: UserDaoImpl;
  
    constructor() {
      this.userDao = new UserDaoImpl();
    }
  
    async getUser(id: string): Promise<User | null> {
      return await this.userDao.get(id);
    }
  
    async getAllUsers(): Promise<User[]> {
      return await this.userDao.getAll();
    }
  
    async addUser(userAttributes: UserCreationAttributes): Promise<void> {
      return await this.userDao.save(userAttributes);
    }
  
    async updateUser(user: User, updateValues: Partial<User>): Promise<void> {
      return await this.userDao.update(user, updateValues);
    }
  
    async deleteUser(user: User): Promise<void> {
      return await this.userDao.delete(user);
    }
  }
  
  export default UserDAOApplication;