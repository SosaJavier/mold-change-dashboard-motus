import 'dotenv/config';
import { query } from './lib/db';

async function checkSchema() {
    try {
        console.log('Checking programacion_cambios table schema...');
        const result = await query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'programacion_cambios'
        `);
        console.log('Schema:', JSON.stringify(result, null, 2));

        console.log('\nChecking current data in programacion_cambios...');
        const data = await query('SELECT TOP 5 * FROM programacion_cambios');
        console.log('Data:', JSON.stringify(data, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Check failed:');
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
