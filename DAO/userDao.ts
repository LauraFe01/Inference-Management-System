import { Dao } from './dao';
import { User, UserCreationAttributes } from '../Model/user';
import { UniqueConstraintError } from 'sequelize';

class UserDaoImpl implements Dao<User> {
    async get(id: string): Promise<User | null> {
      return await User.findByPk(id);
    }
  
    async getAll(): Promise<User[]> {
      return await User.findAll();
    }
  
    async save(userAttributes: UserCreationAttributes): Promise<void> {
      try {
        await User.create(userAttributes);
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new Error('ID or email already exists');
        }
        throw error;
      }
    }
  
    async update(user: User, ...params: any[]): Promise<void> {
      const [updateValues] = params;
      try {
        await user.update(updateValues);
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new Error('ID or email already exists'); //manda l'errore corrispondente nel caso di valore non unico
        }
        throw error;
      }
    }
  
    async delete(user: User): Promise<void> {
      await user.destroy();
    }

    async getAttributeById(id: string, attribute: keyof User): Promise<any | null> {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }
      return user[attribute]; 
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
  async getTokensNameById(id: string): Promise<string | null> {
    return await this.userDao.getAttributeById(id, 'numToken');
  }
}

export default UserDAOApplication;