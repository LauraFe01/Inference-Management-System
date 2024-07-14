import { Sequelize } from 'sequelize';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

// Leggi il certificato CA dal file system
const ca = fs.readFileSync('./Config/ca.pem').toString();

console.log("Hello world")

class Database {
    private static instance: Database;
    private sequelize: Sequelize;

    private constructor() {
        this.sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD!, {
            host: process.env.DB_HOST,
            dialect: 'postgres',
            logging: false,
            port: Number(process.env.DB_PORT),
            dialectOptions: {
                ssl: {
                    rejectUnauthorized: true,
                    ca: ca,
                },
            },
        });

        // Verifica che la configurazione sia stata applicata correttamente
        console.log('Host:', this.sequelize.config.host);
        console.log('Dialect:', this.sequelize.getDialect());

        // Verifica della connessione
        this.sequelize.authenticate()
            .then(() => {
                console.log('Connessione riuscita.');
            })
            .catch(err => {
                console.error('Impossibile connettersi al database:', err);
            });
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public getSequelize(): Sequelize {
        return this.sequelize;
    }
}

const dbInstance = Database.getInstance();
export default dbInstance.getSequelize();