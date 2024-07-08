import sequelize from './db_config';
import User from './user'; 

const syncDatabase = async () => {
    try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
      await User.sync({ force: true }); // Usa { force: true } per resettare la tabella ogni volta
      console.log('The table for the ExampleTable model was just (re)created!');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
};


const dropTable = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await User.drop(); // Elimina la tabella
        console.log('The table for the ExampleTable model was dropped!');
    } catch (error) {
        console.error('Unable to drop the table:', error);
    } finally {
        await sequelize.close();
    }
};
      
//syncDatabase();

async function createUser(id: string, email: string, password: string, numToken: number, isAdmin: boolean) {
    try {
      const newUser = await User.create({
        id,
        email,
        password,
        numToken,
        isAdmin,
      });
      console.log('Utente creato con successo:', newUser.toJSON());
    } catch (error) {
      console.error('Errore durante la creazione dell\'utente:', error);
    }
  }
  
  // Utilizzo della funzione createUser
createUser('john_doe', 'john@example.com', 'password123', 21, true);

User.findAll()
.then(users => {
console.log('Utenti trovati:', users);
})
.catch(err => {
console.error('Errore durante la lettura degli utenti:', err);
});

