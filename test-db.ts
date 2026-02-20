import 'dotenv/config';
import { query } from './lib/db';

async function testConnection() {
    try {
        console.log('Attempting to connect to SQL Server...');
        const result = await query('SELECT 1 as result');
        console.log('Database connection verification success:', result);
        process.exit(0);
    } catch (error) {
        console.error('Database connection verification failed:');
        console.error(error);
        process.exit(1);
    }
}

testConnection();
