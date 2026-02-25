import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        await query("DELETE FROM programacion_cambios WHERE id = ?", [id])
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("DELETE Scheduled Change Error:", error)
        return NextResponse.json({ error: "Error al eliminar programacion" }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
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
