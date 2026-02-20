import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const result: any = await query('DELETE FROM cambios_moldes WHERE id = ?', [id]);
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()

    // Map camelCase to snake_case for the database
    const mapping: Record<string, string> = {
      moldeAnterior: 'molde_anterior',
      moldeNuevo: 'molde_nuevo',
      fechaInicio: 'fecha_inicio',
      fechaFin: 'fecha_fin',
      tiempoMuerto: 'tiempo_muerto',
      retrasoMotivo: 'retraso_motivo',
    };

    const payload: any = {};
    const dateFields = ['fechaInicio', 'fechaFin'];

    for (const key in body) {
      const dbKey = mapping[key] || key;
      let value = body[key];

      // Convert date strings to Date objects for MySQL
      if (dateFields.includes(key) && value) {
        value = new Date(value);
      }

      payload[dbKey] = value;
    }

    // Build dynamic UPDATE query
    const fields = Object.keys(payload);
    if (fields.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => payload[field]);
    values.push(id);

    const result: any = await query(`UPDATE cambios_moldes SET ${setClause} WHERE id = ?`, values);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    return NextResponse.json({ id, ...body })
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}
