import dotenv from "dotenv";
dotenv.config();

import { query } from "./lib/db";

async function check() {
    try {
        console.log("Checking last 10 mold changes...");
        const results = await query(`
            SELECT TOP 10 
                id, 
                linea, 
                retraso_motivo, 
                observaciones,
                fecha_fin
            FROM cambios_moldes 
            WHERE estado = 'completado'
            ORDER BY fecha_fin DESC
        `);

        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

check();
