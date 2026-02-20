import { MoldChange } from "./types"
import * as XLSX from "xlsx"

/**
 * Utility to export mold change data to a native Excel (.xlsx) file.
 * Includes all database fields and proper column formatting.
 */
export function exportToExcel(data: MoldChange[], filename: string) {
    if (data.length === 0) return

    // Prepare the data for XLSX
    const worksheetData = data.map(c => ({
        "ID": c.id,
        "Línea": c.linea,
        "Molde Anterior": c.moldeAnterior,
        "Molde Nuevo": c.moldeNuevo,
        "Supervisor": c.supervisor,
        "Turno": c.turno,
        "Motivo Cambio": c.motivo,
        "Fecha Inicio": new Date(c.fechaInicio).toLocaleString("es-MX"),
        "Fecha Fin": c.fechaFin ? new Date(c.fechaFin).toLocaleString("es-MX") : "-",
        "Tiempo Muerto (min)": c.tiempoMuerto,
        "Estado": c.estado,
        "Motivo Retraso": c.retrasoMotivo || "-",
        "Observaciones": c.observaciones || ""
    }))

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cambios de Molde")

    // Set column widths for better readability
    const wscols = [
        { wch: 10 }, // ID
        { wch: 10 }, // Línea
        { wch: 20 }, // Molde Anterior
        { wch: 20 }, // Molde Nuevo
        { wch: 20 }, // Supervisor
        { wch: 15 }, // Turno
        { wch: 20 }, // Motivo Cambio
        { wch: 25 }, // Fecha Inicio
        { wch: 25 }, // Fecha Fin
        { wch: 18 }, // Tiempo Muerto
        { wch: 15 }, // Estado
        { wch: 20 }, // Motivo Retraso
        { wch: 40 }, // Observaciones
    ]
    worksheet["!cols"] = wscols

    // Write and download the file
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}

/**
 * @deprecated Use exportToExcel instead. Kept for temporary backward compatibility.
 */
export function exportToCSV(data: MoldChange[], filename: string) {
    exportToExcel(data, filename)
}
