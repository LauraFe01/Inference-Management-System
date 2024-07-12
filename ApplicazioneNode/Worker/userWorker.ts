// src/workers/userWorker.ts
import { Worker } from 'bullmq';
import { redisOptions } from '../Config/redis_config';
import UserDAOApplication from '../DAO/userDao';
import { UserCreationAttributes } from '../Model/user';
import { initModels } from '../Model/init_database';

const userWorker = new Worker('userQueue', async job => {
  try {
    await initModels();
    const app = new UserDAOApplication();
    const user: UserCreationAttributes = job.data;
    await app.addUser(user);
    console.log('User added:', user);
  } catch (error) {
    console.error('Error processing job:', error);
  }
}, {
  connection: redisOptions
});

export default userWorker;
