import 'dotenv/config';
import { query } from './lib/db';

async function checkDefaults() {
    try {
        const result = await query(`
            SELECT COLUMN_NAME, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'programacion_cambios'
        `);
        for (const col of result) {
            console.log(`${col.COLUMN_NAME}: ${col.COLUMN_DEFAULT}`);
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkDefaults();
