"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMoldChanges } from "@/hooks/use-mold-changes"
import { LINEAS } from "@/lib/types"
import type { Linea } from "@/lib/types"

const lineaLabels: Record<Linea, string> = {
  TB1: "Termoformadora B1",
  TB2: "Termoformadora B2",
  TB3: "Termoformadora B3",
  EDF1: "Estacion de Formado 1",
  EDF2: "Estacion de Formado 2",
}

const lineaDotColors: Record<Linea, string> = {
  TB1: "bg-primary",
  TB2: "bg-sky-500",
  TB3: "bg-violet-500",
  EDF1: "bg-amber-500",
  EDF2: "bg-rose-500",
}

export function LineStatus() {
  const { changes } = useMoldChanges()

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
      {LINEAS.map((linea) => {
        const lineChanges = changes.filter((c) => c.linea === linea)
        const inProcess = lineChanges.some((c) => c.estado === "en_proceso")
        const lastCompleted = lineChanges.find((c) => c.estado === "completado")
        const totalToday = lineChanges.filter(
          (c) => new Date(c.fechaInicio).toDateString() === new Date().toDateString()
        ).length

        return (
          <Card key={linea} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${lineaDotColors[linea]}`} />
                  <span className="text-sm font-bold text-foreground">{linea}</span>
                </div>
                {inProcess ? (
                  <Badge
                    variant="outline"
                    className="bg-amber-500/15 text-amber-600 border-amber-500/20 text-[10px] px-1.5"
                  >
                    En cambio
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px] px-1.5"
                  >
                    Operando
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mb-2 leading-tight">
                {lineaLabels[linea]}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Hoy: {totalToday}</span>
                {lastCompleted && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {lastCompleted.moldeNuevo}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
