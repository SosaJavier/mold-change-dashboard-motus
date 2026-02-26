import 'dotenv/config';
import { query } from './lib/db';

async function testInsert() {
    try {
        const date = new Date().toISOString();
        const moldId = "TEST-MOLD";
        const description = "Test Description";
        const linea = "TB1";

        console.log('Testing INSERT with parameters...');
        const result: any = await query(`
            INSERT INTO programacion_cambios (fecha, molde_id, descripcion, linea)
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, ?)
        `, [new Date(date), moldId, description, linea]);

        console.log('Insert Result:', JSON.stringify(result, null, 2));

        if (result && result[0] && result[0].id) {
            console.log('SUCCESS! New ID:', result[0].id);

            // Clean up
            console.log('Cleaning up test data...');
            await query('DELETE FROM programacion_cambios WHERE id = ?', [result[0].id]);
            console.log('Cleaned up.');
        } else {
            console.log('FAILED! No ID returned.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Test failed:');
        console.error(error);
        process.exit(1);
    }
}

testInsert();
