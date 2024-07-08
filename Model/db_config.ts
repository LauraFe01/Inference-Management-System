import { Sequelize } from 'sequelize';

console.log("Hello world")

const sequelize = new Sequelize('progettopa', 'myuser', 'password', {
  host: 'localhost',
  dialect: 'postgres', // Può essere 'mysql', 'postgres', 'sqlite', 'mssql', ecc.
  logging: false, // Disabilita il logging delle query SQL (opzionale)
});

// Verifica che la configurazione sia stata applicata correttamente
console.log('Host:', sequelize.config.host);
console.log('Dialect:', sequelize.getDialect());


// Verifica della connessione
sequelize.authenticate()
  .then(() => {
    console.log('Connessione riuscita.');
  })
  .catch(err => {
    console.error('Impossibile connettersi al database:', err);
  });

export default sequelize;
