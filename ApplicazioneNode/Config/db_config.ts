import { Sequelize } from 'sequelize';
import * as fs from 'fs';

// Leggi il certificato CA dal file system
const ca = fs.readFileSync('./Config/ca.pem').toString();

console.log("Hello world")

class Database {
    private static instance: Database;
    private sequelize: Sequelize;

    private constructor() {
        this.sequelize = new Sequelize('progettoPA', 'avnadmin', 'AVNS_qcf614JMDUL6nNWPIqx', {
            host: 'pg-1988b497-progettopa3-dbb5.k.aivencloud.com',
            dialect: 'postgres',
            logging: false,
            port: 12479,
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