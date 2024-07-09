// src/index.ts
import UserDAOApplication from './DAO/userDao';
import { UserCreationAttributes } from './Model/user';
import { initModels, User, Dataset, Spectrogram } from './Model/init_database';

(async () => {
  try {
    // Sincronizza il database
    await initModels();

    const app = new UserDAOApplication();

    // Aggiungi un nuovo utente
    const newUser: UserCreationAttributes = { id: '14', email: 'testprov222242a@mail.com', password: 'passswd', numToken: 5, isAdmin: false };
    await app.addUser(newUser);

    // Ottieni un utente
    const user = await app.getUser('4');
    console.log(user);

    // Ottieni tutti gli utenti
    const users = await app.getAllUsers();
    console.log(users);

    // Test di updateUser
    console.log('Updating the user...');
    await app.updateUser(user!, { numToken: 15 });
    const updatedUser = await app.getUser('4');
    console.log('Updated user:', updatedUser);

    // Test di deleteUser
    console.log('Deleting the user...');
    const deletedUser = await app.getUser('6');
    await app.deleteUser(deletedUser!);
    console.log('Deleted user:', deletedUser);

    // Esempio di test per getTokensNameById
    console.log('Getting numToken by ID...');
    const numTokens = await app.getTokensNameById('3');
    
    console.log('numToken:', numTokens);

  } catch (error) {
    console.error('Error:', error);
  }
})();
