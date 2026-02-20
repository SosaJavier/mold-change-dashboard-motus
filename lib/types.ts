export const LINEAS = ["TB1", "TB2", "TB3", "EDF1", "EDF2"] as const
export type Linea = (typeof LINEAS)[number]

export type EstadoCambio = "completado" | "en_proceso" | "pendiente"

export interface MoldChange {
  id: string
  linea: Linea
  moldeAnterior: string
  moldeNuevo: string
  supervisor: string
  turno: "Primer turno" | "Segundo turno" | "Tercer turno"
  motivo: string
  fechaInicio: string
  fechaFin: string | null
  tiempoMuerto: number // minutes
  estado: EstadoCambio
  retrasoMotivo?: string
  observaciones: string
}
