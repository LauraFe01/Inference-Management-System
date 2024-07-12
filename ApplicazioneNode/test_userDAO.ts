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
    const newUser: UserCreationAttributes = { email: 'testprova2@mail.com', password: 'password2', numToken: 10000, isAdmin: false };
    await app.addUser(newUser);

    console.log('nuovo User', newUser);

    /* // Ottieni un utente
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

     // Test di getUserByEmailPass
     console.log("Getting user by the email...");
     const emailUser= await app.getUserByEmailPass('testprov222243a@mail.com')
     console.log('User fetched: ', emailUser); */

  } catch (error) {
    console.error('Error:', error);
  }
})();
