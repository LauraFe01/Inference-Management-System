// src/index.ts
import UserDAOApplication from './DAO/userDaoImpl';
import { UserCreationAttributes } from './Model/user';
import { initModels, User, Dataset, Spectrogram } from './Model/init';

(async () => {
  try {
    // Sincronizza il database
    await initModels();

    const app = new UserDAOApplication();

    // Aggiungi un nuovo utente
    const newUser: UserCreationAttributes = { id: '6', email: 'test1@mail.com', password: 'passswd', numToken: 5, isAdmin: false };
    await app.addUser(newUser);

    // Ottieni un utente
    const user = await app.getUser('2');
    console.log(user);

    // Ottieni tutti gli utenti
    const users = await app.getAllUsers();
    console.log(users);

    /* // Aggiorna un utente
    if (user) {
      await app.updateUser(user, { email: 'updateduser@mail.com' });
    }

    // Elimina un utente
    if (user) {
      await app.deleteUser(user);
    } */
  } catch (error) {
    console.error('Error:', error);
  }
})();
