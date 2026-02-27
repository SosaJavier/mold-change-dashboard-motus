
import dotenv from "dotenv";
dotenv.config();
import { query } from "./lib/db";

async function checkSchema() {
    try {
        console.log("Checking schema for cambios_moldes...");
        const results = await query(`
            SELECT 
                COLUMN_NAME, 
                DATA_TYPE, 
                CHARACTER_MAXIMUM_LENGTH 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'cambios_moldes'
        `);

        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

checkSchema();
