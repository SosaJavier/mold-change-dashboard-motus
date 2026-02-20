import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const results = await query(`
      SELECT 
        id, 
        linea, 
        molde_anterior AS moldeAnterior, 
        molde_nuevo AS moldeNuevo, 
        supervisor, 
        turno, 
        motivo, 
        fecha_inicio AS fechaInicio, 
        fecha_fin AS fechaFin, 
        tiempo_muerto AS tiempoMuerto, 
        estado, 
        retraso_motivo AS retrasoMotivo, 
        observaciones 
      FROM cambios_moldes 
      ORDER BY fecha_inicio DESC
    `)

    return NextResponse.json(results)

  } catch (error) {
    console.error("GET Error:", error)
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 🔥 Convertimos fechas correctamente
    const fechaInicio = body.fechaInicio
      ? new Date(body.fechaInicio)
      : new Date()

    const fechaFin = body.fechaFin
      ? new Date(body.fechaFin)
      : null

    const result: any = await query(
      `INSERT INTO cambios_moldes 
      (
        linea, 
        molde_anterior, 
        molde_nuevo, 
        supervisor, 
        turno, 
        motivo, 
        fecha_inicio, 
        fecha_fin, 
        tiempo_muerto, 
        estado, 
        retraso_motivo, 
        observaciones
      ) 
      OUTPUT INSERTED.id
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.linea,
        body.moldeAnterior,
        body.moldeNuevo,
        body.supervisor,
        body.turno,
        body.motivo,
        fechaInicio,
        fechaFin,
        body.tiempoMuerto || 0,
        body.estado,
        body.retrasoMotivo || null,
        body.observaciones || ""
      ]
    )

    const newId = result[0]?.id;

    return NextResponse.json(
      { id: newId, ...body },
      { status: 201 }
    )

  } catch (error) {
    console.error("POST Error:", error)
    return NextResponse.json(
      { error: "Error al crear registro" },
      { status: 500 }
    )
  }
}
