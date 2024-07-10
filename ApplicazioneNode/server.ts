import express from 'express';
import bodyParser from 'body-parser';
import DatasetDAOApplication from './DAO/datasetDao'; // Assicurati di avere il percorso corretto
import { DatasetCreationAttributes } from './Model/dataset';
import { UserCreationAttributes } from './Model/user';
import { initModels, User, Dataset, Spectrogram } from './Model/init_database';
import UserDAOApplication from './DAO/userDao';

const app = express();
const port = 3000;

// Middleware per parsare il corpo delle richieste come JSON
app.use(bodyParser.json());

// Instanzia il DAO Application
const datasetApp = new DatasetDAOApplication();
const userApp = new UserDAOApplication();

// Rotta per creare un dataset vuoto
app.post('/datasets', async (req, res) => {
  try {
    const { id, name, description, userId } = req.body;

    // Controlla che tutti i campi necessari siano presenti
    if (!id || !name || !description || !userId) {
      return res.status(400).send({ error: 'Missing required fields' });
    }

    const newDataset: DatasetCreationAttributes = {
      id,
      name,
      description,
      userId,
    };

    await datasetApp.addDataset(newDataset);
    res.status(201).send(newDataset);
  } catch (error) {
    console.error('Error creating dataset:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.post('/login', async(req, res)=>{
  try{
    const{email, password}= req.body;
    // Controllare la presenza di campi
    if(!email||!password){
      return res.status(400).send({error:'Missing required fields'});
    }
    const user= await userApp.getUserByEmailPass(email);

    if(password!= user[0].password){
      return res.status(401).send({error:'Wrong Password inserted'});
    }
    res.status(200).send({ message: 'Login successful', user: user[0] });

  } catch{(error: any) =>{
      console.error('Error during login:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  }
});

// Sincronizza il database e avvia il server
(async () => {
  try {
    await initModels();
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
})();
