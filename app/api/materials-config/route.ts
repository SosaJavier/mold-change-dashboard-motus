import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const results: any = await query(`
            SELECT 
                molde_id AS moldId, 
                tiempo_ciclo AS cycleTime, 
                descripcion
            FROM configuracion_materiales 
            WHERE id = 1
        `)

        return NextResponse.json(results[0] || { moldId: "", cycleTime: "", descripcion: "" })
    } catch (error) {
        console.error("GET Materials Config Error:", error)
        return NextResponse.json({ error: "Error al obtener configuracion" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { moldId, cycleTime, description } = body

        await query(`
            UPDATE configuracion_materiales 
            SET molde_id = ?, tiempo_ciclo = ?, descripcion = ?, updated_at = GETDATE()
            WHERE id = 1
        `, [moldId || "", cycleTime || "", description || ""])

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("POST Materials Config Error:", error)
        return NextResponse.json({ error: "Error al guardar configuracion" }, { status: 500 })
    }
}
