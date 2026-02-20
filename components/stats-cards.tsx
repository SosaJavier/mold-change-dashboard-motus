"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, Clock, CheckCircle2, Loader2, BarChart3 } from "lucide-react"
import { useMoldChanges } from "@/hooks/use-mold-changes"

export function StatsCards() {
  const { changes } = useMoldChanges()

  const todayStr = new Date().toDateString()
  const todayChanges = changes.filter(
    (c) => new Date(c.fechaInicio).toDateString() === todayStr
  )

  const completados = todayChanges.filter((c) => c.estado === "completado")
  const enProceso = todayChanges.filter((c) => c.estado === "en_proceso")
  const avgTime =
    completados.length > 0
      ? Math.round(
        completados.reduce((sum, c) => sum + c.tiempoMuerto, 0) / completados.length
      )
      : 0

  const stats = [
    {
      label: "Cambios Hoy",
      value: todayChanges.length,
      icon: BarChart3,
      change: "+2 vs ayer",
      trend: "up" as const,
    },
    {
      label: "Completados",
      value: completados.length,
      icon: CheckCircle2,
      change: `${todayChanges.length > 0 ? Math.round((completados.length / todayChanges.length) * 100) : 0}%`,
      trend: "up" as const,
    },
    {
      label: "En Proceso",
      value: enProceso.length,
      icon: Loader2,
      change: enProceso.length > 0 ? "Activos" : "Ninguno",
      trend: enProceso.length > 0 ? ("down" as const) : ("up" as const),
    },
    {
      label: "Tiempo Prom.",
      value: `${avgTime} min`,
      icon: Clock,
      change: avgTime <= 60 ? "Dentro de meta" : "Fuera de meta",
      trend: avgTime <= 60 ? ("up" as const) : ("down" as const),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </span>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">
              {stat.value}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {stat.trend === "up" ? (
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-amber-500" />
              )}
              <span
                className={`text-xs ${stat.trend === "up" ? "text-emerald-500" : "text-amber-500"}`}
              >
                {stat.change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
