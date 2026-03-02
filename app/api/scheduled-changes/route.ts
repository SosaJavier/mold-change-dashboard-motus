import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const results = await query(`
            SELECT 
                id, 
                fecha AS date, 
                molde_id AS moldId, 
                descripcion AS description, 
                linea,
                created_at AS createdAt
            FROM programacion_cambios 
            WHERE fecha >= CAST(GETDATE() AS DATE) 
            AND fecha < DATEADD(day, 31, CAST(GETDATE() AS DATE))
            ORDER BY fecha ASC
        `)

        return NextResponse.json(results)
    } catch (error) {
        console.error("GET Scheduled Changes Error:", error)
        return NextResponse.json({ error: "Error al obtener cambios programados" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { date, moldId, description, linea } = body

        if (!date || !moldId || !linea) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
        }

        const result: any = await query(`
            INSERT INTO programacion_cambios (fecha, molde_id, descripcion, linea)
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, ?)
        `, [new Date(date), moldId, description || "", linea])

        const newId = result[0]?.id

        return NextResponse.json({
            id: newId,
            date,
            moldId,
            description: description || "",
            linea
        }, { status: 201 })
    } catch (error) {
        console.error("POST Scheduled Changes Error:", error)
        return NextResponse.json({ error: "Error al programar cambio" }, { status: 500 })
    }
}
