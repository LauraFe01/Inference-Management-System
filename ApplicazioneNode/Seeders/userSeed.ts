import { User } from '../Model/user';
import { hashPasswords } from '../Utils/utils';

// Initial data for users to be seeded into the database
const users = [
  { email: 'user@example.com', password: 'user', numToken: 100, isAdmin: false },
  { email: 'admin@example.com', password: 'admin', numToken: 100, isAdmin: true },
];

/**
 * Seed function to populate the User table with initial data.
 * Uses Sequelize's bulkCreate method to insert multiple rows into the database.
 * Logs success message and exits process if successful; logs error message and exits with error code if there's an error.
 */
export default async function seed() {
  try {
    await hashPasswords(users);
    await User.bulkCreate(users);
    console.log('Added data successfully'); 
    process.exit(0); // Exit process with success code (0)
  } catch (error) {
    console.error('Error during adding data:', error); 
    process.exit(1); // Exit process with error code (1)
  }
}
