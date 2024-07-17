import {User} from '../Model/user';


const users = [
  { email: 'user1@example.com', password: 'user1', numToken: 10, isAdmin: true },
  { email: 'user2@example.com', password: 'user2', numToken: 10, isAdmin: false },
];

export default async function seed() {
  try {
    await User.bulkCreate(users);
    console.log('Dati aggiunti con successo');
    process.exit(0);
  } catch (error) {
    console.error('Errore durante aggiunta dei dati:', error);
    process.exit(1);
  }
}
