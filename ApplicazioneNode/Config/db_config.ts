import { Sequelize } from 'sequelize';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

// Read the CA certificate from the file system
const ca = fs.readFileSync('./Config/ca.pem').toString();

/**
 * Represents a database connection manager using Sequelize.
 */
class Database {
    private static instance: Database;
    private sequelize: Sequelize;

    /**
     * Private constructor to initialize Sequelize connection.
     * Connects to the database using environment variables and SSL configuration.
     */
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

        // Check database connection
        this.sequelize.authenticate()
            .then(() => {
                console.log('Connection successful.');
            })
            .catch(err => {
                console.error('Unable to connect to the database:', err);
            });
    }

    /**
     * Returns the singleton instance of the Database class.
     * @returns The singleton instance of Database.
     */
    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    /**
     * Returns the Sequelize instance used for database operations.
     * @returns The Sequelize instance.
     */
    public getSequelize(): Sequelize {
        return this.sequelize;
    }
}

// Create and export a singleton instance of Database with Sequelize connection
const dbInstance = Database.getInstance();
export default dbInstance.getSequelize();
