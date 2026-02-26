import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        console.log(`DELETING scheduled change with ID: ${id}`);
        const result = await query("DELETE FROM programacion_cambios WHERE id = ?", [id])
        console.log("DELETE Result:", result);
        return NextResponse.json({ success: true, result })
    } catch (error) {
        console.error("DELETE Scheduled Change Error:", error)
        return NextResponse.json({ error: "Error al eliminar programacion" }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { date } = body

        if (!date) {
            return NextResponse.json({ error: "Fecha no proporcionada" }, { status: 400 })
        }

        await query("UPDATE programacion_cambios SET fecha = ? WHERE id = ?", [new Date(date), id])
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("PATCH Scheduled Change Error:", error)
        return NextResponse.json({ error: "Error al actualizar programacion" }, { status: 500 })
    }
}
