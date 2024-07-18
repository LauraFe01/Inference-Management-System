import { Dao } from './dao';
import { User, UserCreationAttributes } from '../Model/user';
import { UniqueConstraintError } from 'sequelize';
import { Transaction } from 'sequelize';

/**
 * Implementation of UserDaoImpl class adhering to the Dao interface.
 */
class UserDaoImpl implements Dao<User> {
  /**
   * Retrieves a User from the database using its ID.
   * @param {number} id - The ID of the user to retrieve.
   * @returns {Promise<User | null>} A Promise that resolves with the found User or null if not found.
   */
  async get(id: number): Promise<User | null> {
    return await User.findByPk(id);
  }

  /**
   * Retrieves all Users from the database.
   * @returns {Promise<User[]>} A Promise that resolves with an array of Users.
   */
  async getAll(): Promise<User[]> {
    return await User.findAll();
  }

  /**
   * Saves a new User to the database.
   * @param {UserCreationAttributes} userAttributes - The attributes needed to create a new User.
   * @returns {Promise<void>} A Promise that resolves when the User is saved.
   * @throws Throws an error if the ID or email already exists (UniqueConstraintError).
   */
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

  /**
   * Updates an existing User in the database.
   * @param {User} user - The User to update.
   * @param {Transaction} [transaction] - Optional transaction to perform the operation within a transaction context.
   * @param {...any[]} params - Additional parameters needed for the update, in this case updateValues.
   * @returns {Promise<void>} A Promise that resolves when the User is updated.
   * @throws Throws an error if the ID or email already exists (UniqueConstraintError).
   */
  async update(user: User, transaction?: Transaction, ...params: any[]): Promise<void> {
    const [updateValues] = params;
    try {
      await user.update(updateValues, { transaction });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new Error('ID or email already exists');
      }
      throw error;
    }
  }

  /**
   * Deletes a User from the database.
   * @param {User} user - The User to delete.
   * @returns {Promise<void>} A Promise that resolves when the User is deleted.
   */
  async delete(user: User): Promise<void> {
    await user.destroy();
  }

  /**
   * Retrieves a specific attribute of a User by ID.
   * @param {string} id - The ID of the User whose attribute to retrieve.
   * @param {keyof User} attribute - The name of the attribute to retrieve.
   * @returns {Promise<any | null>} A Promise that resolves with the value of the attribute or null if the User is not found.
   * @throws Throws an error if the User with the specified ID is not found.
   */
  async getAttributeById(id: string, attribute: keyof User): Promise<any | null> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return user[attribute];
  }

  /**
   * Retrieves Users by their email.
   * @param {string} email - The email address of the Users to retrieve.
   * @returns {Promise<User[]>} A Promise that resolves with an array of Users.
   */
  async getUserByEmail(email: string): Promise<User[]> {
    return await User.findAll({ where: { email: email } });
  }
}

/**
 * UserDAOApplication class that uses UserDaoImpl to perform User operations.
 */
class UserDAOApplication {
  userDao: UserDaoImpl;

  /**
   * Constructor that initializes an instance of UserDaoImpl.
   */
  constructor() {
    this.userDao = new UserDaoImpl();
  }

  /**
   * Retrieves a User by its ID.
   * @param {number} id - The ID of the User to retrieve.
   * @returns {Promise<User | null>} A Promise that resolves with the found User or null if not found.
   */
  async getUser(id: number): Promise<User | null> {
    return await this.userDao.get(id);
  }

  /**
   * Retrieves all Users.
   * @returns {Promise<User[]>} A Promise that resolves with an array of Users.
   */
  async getAllUsers(): Promise<User[]> {
    return await this.userDao.getAll();
  }

  /**
   * Adds a new User.
   * @param {UserCreationAttributes} userAttributes - The attributes needed to create a new User.
   * @returns {Promise<void>} A Promise that resolves when the User is saved.
   */
  async addUser(userAttributes: UserCreationAttributes): Promise<void> {
    return await this.userDao.save(userAttributes);
  }

  /**
   * Updates an existing User.
   * @param {User} user - The User to update.
   * @param {Partial<User>} updateValues - The updated attributes of the User.
   * @param {Transaction} [transaction] - Optional transaction to perform the operation within a transaction context.
   * @returns {Promise<void>} A Promise that resolves when the User is updated.
   */
  async updateUser(user: User, updateValues: Partial<User>, transaction?: Transaction): Promise<void> {
    return await this.userDao.update(user, transaction, updateValues);
  }

  /**
   * Deletes a User.
   * @param {User} user - The User to delete.
   * @returns {Promise<void>} A Promise that resolves when the User is deleted.
   */
  async deleteUser(user: User): Promise<void> {
    return await this.userDao.delete(user);
  }

  /**
   * Retrieves the number of tokens associated with a User by their ID.
   * @param {string} id - The ID of the User whose number of tokens to retrieve.
   * @returns {Promise<string | null>} A Promise that resolves with the number of tokens or null if the User is not found.
   */
  async getTokensNumById(id: string): Promise<string | null> {
    return await this.userDao.getAttributeById(id, 'numToken');
  }

  /**
   * Retrieves Users by their email.
   * @param {string} email - The email address of the Users to retrieve.
   * @returns {Promise<User[]>} A Promise that resolves with an array of Users.
   */
  async getUserByEmail(email: string): Promise<User[]> {
    return await this.userDao.getUserByEmail(email);
  }
}

// Export the UserDAOApplication class as the default export
export default UserDAOApplication;
