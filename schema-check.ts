import 'dotenv/config';
import { query } from './lib/db';

async function checkSchema() {
    try {
        const result = await query(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'programacion_cambios'
        `);
        for (const col of result) {
            console.log(`${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.CHARACTER_MAXIMUM_LENGTH}) ${col.IS_NULLABLE}`);
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
