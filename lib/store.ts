import type { MoldChange } from "./types"

function generateId() {
  return `MC-${Date.now().toString(36).toUpperCase()}`
}

const today = new Date()
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)
const twoDaysAgo = new Date(today)
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

const sampleChanges: MoldChange[] = [
  {
    id: "MC-001",
    linea: "TB1",
    moldeAnterior: "M-1200",
    moldeNuevo: "M-1350",
    supervisor: "Carlos Ramirez",
    turno: "Primer turno",
    motivo: "Cambio de producto",
    fechaInicio: today.toISOString(),
    fechaFin: new Date(today.getTime() + 45 * 60000).toISOString(),
    tiempoMuerto: 45,
    estado: "completado",
    observaciones: "Sin incidentes",
  },
  {
    id: "MC-002",
    linea: "TB2",
    moldeAnterior: "M-0800",
    moldeNuevo: "M-0950",
    supervisor: "Miguel Torres",
    turno: "Primer turno",
    motivo: "Mantenimiento preventivo",
    fechaInicio: today.toISOString(),
    fechaFin: null,
    tiempoMuerto: 0,
    estado: "en_proceso",
    observaciones: "Esperando pieza de repuesto",
  },
  {
    id: "MC-003",
    linea: "EDF1",
    moldeAnterior: "M-2100",
    moldeNuevo: "M-2200",
    supervisor: "Ana Lopez",
    turno: "Segundo turno",
    motivo: "Desgaste del molde",
    fechaInicio: yesterday.toISOString(),
    fechaFin: new Date(yesterday.getTime() + 60 * 60000).toISOString(),
    tiempoMuerto: 60,
    estado: "completado",
    observaciones: "Molde anterior enviado a reparacion",
  },
  {
    id: "MC-004",
    linea: "TB3",
    moldeAnterior: "M-0500",
    moldeNuevo: "M-0510",
    supervisor: "Roberto Diaz",
    turno: "Tercer turno",
    motivo: "Defectos de calidad",
    fechaInicio: yesterday.toISOString(),
    fechaFin: new Date(yesterday.getTime() + 90 * 60000).toISOString(),
    tiempoMuerto: 90,
    estado: "completado",
    observaciones: "Piezas defectuosas retiradas de linea",
  },
  {
    id: "MC-005",
    linea: "EDF2",
    moldeAnterior: "M-3000",
    moldeNuevo: "M-3100",
    supervisor: "Laura Martinez",
    turno: "Primer turno",
    motivo: "Cambio de producto",
    fechaInicio: twoDaysAgo.toISOString(),
    fechaFin: new Date(twoDaysAgo.getTime() + 35 * 60000).toISOString(),
    tiempoMuerto: 35,
    estado: "completado",
    observaciones: "",
  },
  {
    id: "MC-006",
    linea: "TB1",
    moldeAnterior: "M-1100",
    moldeNuevo: "M-1200",
    supervisor: "Carlos Ramirez",
    turno: "Segundo turno",
    motivo: "Cambio de producto",
    fechaInicio: twoDaysAgo.toISOString(),
    fechaFin: new Date(twoDaysAgo.getTime() + 50 * 60000).toISOString(),
    tiempoMuerto: 50,
    estado: "completado",
    observaciones: "",
  },
  {
    id: "MC-007",
    linea: "EDF1",
    moldeAnterior: "M-2000",
    moldeNuevo: "M-2100",
    supervisor: "Pedro Sanchez",
    turno: "Tercer turno",
    motivo: "Mantenimiento preventivo",
    fechaInicio: twoDaysAgo.toISOString(),
    fechaFin: new Date(twoDaysAgo.getTime() + 70 * 60000).toISOString(),
    tiempoMuerto: 70,
    estado: "completado",
    observaciones: "Programado segun calendario",
  },
  {
    id: "MC-008",
    linea: "TB2",
    moldeAnterior: "M-0700",
    moldeNuevo: "M-0800",
    supervisor: "Miguel Torres",
    turno: "Primer turno",
    motivo: "Cambio de producto",
    fechaInicio: twoDaysAgo.toISOString(),
    fechaFin: new Date(twoDaysAgo.getTime() + 40 * 60000).toISOString(),
    tiempoMuerto: 40,
    estado: "completado",
    observaciones: "",
  },
]

let changes: MoldChange[] = [...sampleChanges]

export function getChanges(): MoldChange[] {
  return [...changes].sort(
    (a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()
  )
}

export function addChange(
  change: Omit<MoldChange, "id">
): MoldChange {
  const newChange: MoldChange = {
    ...change,
    id: generateId(),
  }
  changes.push(newChange)
  return newChange
}

export function deleteChange(id: string): boolean {
  const idx = changes.findIndex((c) => c.id === id)
  if (idx === -1) return false
  changes.splice(idx, 1)
  return true
}

export function updateChange(
  id: string,
  updates: Partial<Omit<MoldChange, "id">>
): MoldChange | null {
  const idx = changes.findIndex((c) => c.id === id)
  if (idx === -1) return null
  changes[idx] = { ...changes[idx], ...updates }
  return changes[idx]
}
