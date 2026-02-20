"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { useMoldChanges } from "@/hooks/use-mold-changes"
import { LINEAS } from "@/lib/types"
import type { Linea } from "@/lib/types"


const LINE_COLORS: Record<Linea, string> = {
  TB1: "hsl(220, 70%, 50%)",
  TB2: "hsl(199, 89%, 48%)",
  TB3: "hsl(262, 83%, 58%)",
  EDF1: "hsl(25, 95%, 53%)",
  EDF2: "hsl(346, 77%, 50%)",
}

function getLast7Days() {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(
      d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" })
    )
  }
  return days
}

export function DashboardCharts() {
  const { changes } = useMoldChanges()

  // Filter for last 7 days
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const weeklyChanges = changes.filter(c => new Date(c.fechaInicio) >= sevenDaysAgo)

  // Changes per line (Weekly)
  const perLine = LINEAS.map((linea) => ({
    linea,
    cambios: weeklyChanges.filter((c) => c.linea === linea).length,
    fill: LINE_COLORS[linea],
  }))

  // Status distribution (Keep total for overview or make weekly? User said "cambios por linea" and "tiempo promedio" should be semanal)
  const completados = changes.filter((c) => c.estado === "completado").length
  const enProceso = changes.filter((c) => c.estado === "en_proceso").length
  const pendientes = changes.filter((c) => c.estado === "pendiente").length
  const statusData = [
    { name: "Completados", value: completados, fill: "hsl(142, 72%, 42%)" },
    { name: "En Proceso", value: enProceso, fill: "hsl(38, 92%, 50%)" },
    { name: "Pendientes", value: pendientes, fill: "hsl(220, 14%, 70%)" },
  ].filter((d) => d.value > 0)

  // Avg time per line (Weekly)
  const avgPerLine = LINEAS.map((linea) => {
    const completed = weeklyChanges.filter(
      (c) =>
        c.linea === linea && c.estado === "completado" && c.tiempoMuerto > 0
    )
    const avg =
      completed.length > 0
        ? Math.round(
          completed.reduce((s, c) => s + c.tiempoMuerto, 0) / completed.length
        )
        : 0
    return { linea, tiempo: avg, fill: LINE_COLORS[linea] }
  })

  // Trend data (last 7 days)
  const last7 = getLast7Days()
  const trendData = last7.map((day) => {
    const dayChanges = changes.filter((c) => {
      const d = new Date(c.fechaInicio)
      const label = d.toLocaleDateString("es-MX", {
        weekday: "short",
        day: "numeric",
      })
      return label === day
    })
    return {
      dia: day,
      cambios: dayChanges.length,
      completados: dayChanges.filter((c) => c.estado === "completado").length,
    }
  })

  return (
    <div className="grid gap-4">
      {/* Row 1: Trend */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">
            Tendencia de Cambios (Ultimos 7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart
              data={trendData}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCambios" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(220, 70%, 50%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(220, 70%, 50%)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="colorCompletados"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(142, 72%, 42%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(142, 72%, 42%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(220, 13%, 88%)"
              />
              <XAxis
                dataKey="dia"
                tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 13%, 88%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="cambios"
                stroke="hsl(220, 70%, 50%)"
                strokeWidth={2}
                fill="url(#colorCambios)"
                name="Total"
              />
              <Area
                type="monotone"
                dataKey="completados"
                stroke="hsl(142, 72%, 42%)"
                strokeWidth={2}
                fill="url(#colorCompletados)"
                name="Completados"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Cambios por Linea (Semanal)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={perLine} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="hsl(220, 13%, 88%)"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }}
                />
                <YAxis
                  dataKey="linea"
                  type="category"
                  tick={{
                    fontSize: 12,
                    fontWeight: 600,
                    fill: "hsl(220, 20%, 10%)",
                  }}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 13%, 88%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="cambios" radius={[0, 4, 4, 0]} barSize={18}>
                  {perLine.map((entry) => (
                    <Cell key={entry.linea} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Estado de Cambios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  formatter={(value: string) => (
                    <span
                      style={{ color: "hsl(220, 10%, 46%)", fontSize: "11px" }}
                    >
                      {value}
                    </span>
                  )}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 13%, 88%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Tiempo Promedio (min) (Semanal)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={avgPerLine} margin={{ left: -10 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(220, 13%, 88%)"
                />
                <XAxis
                  dataKey="linea"
                  tick={{
                    fontSize: 12,
                    fontWeight: 600,
                    fill: "hsl(220, 20%, 10%)",
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 13%, 88%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value} min`, "Promedio"]}
                />
                <Bar dataKey="tiempo" radius={[4, 4, 0, 0]} barSize={28}>
                  {avgPerLine.map((entry) => (
                    <Cell key={entry.linea} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
