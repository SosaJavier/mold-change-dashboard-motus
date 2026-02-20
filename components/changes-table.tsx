"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, CheckCircle2, Download } from "lucide-react"
import { useMoldChanges } from "@/hooks/use-mold-changes"
import { toast } from "sonner"
import { exportToExcel } from "@/lib/export-utils"
import type { EstadoCambio, Linea } from "@/lib/types"

const estadoBadge: Record<EstadoCambio, { label: string; className: string }> = {
  completado: {
    label: "Completado",
    className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  },
  en_proceso: {
    label: "En Proceso",
    className: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  },
  pendiente: {
    label: "Pendiente",
    className: "bg-muted text-muted-foreground border-border",
  },
}

const lineaColors: Record<Linea, string> = {
  TB1: "bg-primary/15 text-primary border-primary/20",
  TB2: "bg-sky-500/15 text-sky-600 border-sky-500/20",
  TB3: "bg-violet-500/15 text-violet-600 border-violet-500/20",
  EDF1: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  EDF2: "bg-rose-500/15 text-rose-600 border-rose-500/20",
}

export function ChangesTable() {
  const { changes, isLoading, removeChange, completeChange } = useMoldChanges()

  const handleExportToExcel = () => {
    if (changes.length === 0) {
      toast.error("No hay registros para exportar")
      return
    }

    try {
      exportToExcel(changes, "registros_moldes")
      toast.success("Registros exportados en formato Excel")
    } catch (error) {
      console.error("Export Error:", error)
      toast.error("Error al exportar los registros")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (changes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">No hay cambios registrados</p>
      </div>
    )
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  async function handleDelete(id: string) {
    try {
      await removeChange(id)
      toast.success("Registro eliminado correctamente")
    } catch {
      toast.error("Error al eliminar registro")
    }
  }

  async function handleComplete(id: string, fechaInicio: string) {
    const minutes = Math.round(
      (Date.now() - new Date(fechaInicio).getTime()) / 60000
    )
    try {
      await completeChange(id, minutes)
      toast.success("Cambio marcado como completado")
    } catch {
      toast.error("Error al completar el cambio")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">Listado Completo</h3>
          <p className="text-xs text-muted-foreground">{changes.length} registros encontrados</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-8 text-xs bg-background hover:bg-secondary"
          onClick={handleExportToExcel}
        >
          <Download className="h-3.5 w-3.5" />
          Exportar Excel
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs text-muted-foreground font-medium">ID</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Linea</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Molde Ant.</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Molde Nvo.</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Supervisor</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Turno</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Inicio</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Tiempo</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Estado</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Motivo Retraso</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium sr-only">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {changes.map((change) => {
              const badge = estadoBadge[change.estado]
              return (
                <TableRow key={change.id} className="border-border">
                  <TableCell className="font-mono text-xs text-foreground">
                    {change.id}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={lineaColors[change.linea]}>
                      {change.linea}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {change.moldeAnterior}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground font-medium">
                    {change.moldeNuevo}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {change.supervisor}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {change.turno}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(change.fechaInicio)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground">
                    {change.tiempoMuerto > 0 ? `${change.tiempoMuerto} min` : "--"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={badge.className}>
                      {badge.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {change.retrasoMotivo ? (
                      <Badge variant="outline" className="text-[10px] bg-destructive/5 text-destructive border-destructive/10">
                        {change.retrasoMotivo}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {change.estado === "en_proceso" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                          onClick={() =>
                            handleComplete(change.id, change.fechaInicio)
                          }
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="sr-only">Completar</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(change.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
