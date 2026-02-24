"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, Clock, CheckCircle2, Loader2, BarChart3 } from "lucide-react"
import { useMoldChanges } from "@/hooks/use-mold-changes"

export function StatsCards() {
  const { changes } = useMoldChanges()

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // 1. Cambios Hoy
  const todayChanges = changes.filter(c => new Date(c.fechaInicio) >= startOfToday)
  const todayCompleted = todayChanges.filter(c => c.estado === "completado").length

  // 2. Completados Semana
  const weeklyChanges = changes.filter(c => new Date(c.fechaInicio) >= sevenDaysAgo)
  const weeklyCompletedCount = weeklyChanges.filter(c => c.estado === "completado").length
  const weeklyEffectivity = weeklyChanges.length > 0
    ? Math.round((weeklyCompletedCount / weeklyChanges.length) * 100)
    : 0

  // 3. En Proceso
  const enProceso = changes.filter(c => c.estado === "en_proceso")
  const activeMolds = enProceso.length > 0
    ? enProceso.map(c => c.moldeNuevo).join(", ")
    : "Ninguno"

  // 4. Tiempo Promedio Semanal
  const weeklyCompleted = weeklyChanges.filter(c => c.estado === "completado")
  const avgTime = weeklyCompleted.length > 0
    ? Math.round(weeklyCompleted.reduce((sum, c) => sum + (c.tiempoMuerto || 0), 0) / weeklyCompleted.length)
    : 0

  const stats = [
    {
      label: "Cambios Hoy",
      value: todayChanges.length,
      icon: BarChart3,
      change: `${todayCompleted} completado(s)`,
      trend: "up" as const,
    },
    {
      label: "Completados Semana",
      value: weeklyCompletedCount,
      icon: CheckCircle2,
      change: `${weeklyEffectivity}% efectividad`,
      trend: "up" as const,
    },
    {
      label: "En Proceso",
      value: enProceso.length,
      icon: Loader2,
      change: activeMolds,
      trend: enProceso.length > 0 ? ("down" as const) : ("up" as const),
    },
    {
      label: "Tiempo Prom. Semanal",
      value: `${avgTime} min`,
      icon: Clock,
      change: avgTime <= 45 ? "Dentro de meta" : "Fuera de meta",
      trend: avgTime <= 45 ? ("up" as const) : ("down" as const),
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
