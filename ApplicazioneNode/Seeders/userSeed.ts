import { User } from '../Model/user';

// Initial data for users to be seeded into the database
const users = [
  { email: 'user1@example.com', password: 'user1', numToken: 10, isAdmin: true },
  { email: 'user2@example.com', password: 'user2', numToken: 10, isAdmin: false },
];

/**
 * Seed function to populate the User table with initial data.
 * Uses Sequelize's bulkCreate method to insert multiple rows into the database.
 * Logs success message and exits process if successful; logs error message and exits with error code if there's an error.
 */
export default async function seed() {
  try {
    await User.bulkCreate(users);
    console.log('Added data with success'); 
    process.exit(0); // Exit process with success code (0)
  } catch (error) {
    console.error('Error during adding data::', error); 
    process.exit(1); // Exit process with error code (1)
  }
}
