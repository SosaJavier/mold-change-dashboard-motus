import 'dotenv/config';
import { query } from './lib/db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        console.log('Reading migration script...');
        const sql = fs.readFileSync(path.join(process.cwd(), 'create-materials-table.sql'), 'utf8');

        console.log('Executing migration...');
        const result = await query(sql);
        console.log('Migration result:', result);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:');
        console.error(error);
        process.exit(1);
    }
}

runMigration();
