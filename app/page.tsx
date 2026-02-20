"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCards } from "@/components/stats-cards"
import { ChangesTable } from "@/components/changes-table"

import { DashboardCharts } from "@/components/dashboard-charts"
import { LineStatus } from "@/components/line-status"
import { LiveCounter } from "@/components/live-counter"
import { useCounterState } from "@/hooks/use-counter-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, List, Timer, Package } from "lucide-react"
import { MaterialsTab } from "@/components/materials-tab"

export default function Page() {
  const counterState = useCounterState()
  const [counterFullscreen, setCounterFullscreen] = useState(false)
  const [materialsFullscreen, setMaterialsFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState("registros")



  return (
    <>
      {counterFullscreen && (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center overflow-auto">
          <div className="w-full max-w-4xl px-4">
            <LiveCounter
              isFullscreen
              onToggleFullscreen={() => setCounterFullscreen(false)}
              counterState={counterState}
            />
          </div>
        </div>
      )}

      {materialsFullscreen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col p-6 overflow-hidden">
          <div className="w-full h-full max-w-7xl mx-auto">
            <MaterialsTab
              isFullscreen
              onToggleFullscreen={() => setMaterialsFullscreen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-col bg-background">
        <DashboardHeader />
        <main className="flex-1 px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground text-balance">
                  Panel de Control
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Monitorea y registra cambios de molde en las 5 lineas
                </p>
              </div>

            </div>

            <LineStatus />

            <div className="mt-6">
              <StatsCards />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="bg-card border border-border">
                <TabsTrigger
                  value="registros"
                  className="gap-2 text-muted-foreground data-[state=active]:bg-secondary data-[state=active]:text-foreground"
                >
                  <List className="h-4 w-4" />
                  Registros
                </TabsTrigger>
                <TabsTrigger
                  value="graficas"
                  className="gap-2 text-muted-foreground data-[state=active]:bg-secondary data-[state=active]:text-foreground"
                >
                  <BarChart3 className="h-4 w-4" />
                  Graficas
                </TabsTrigger>
                <TabsTrigger
                  value="materiales"
                  className="gap-2 text-muted-foreground data-[state=active]:bg-secondary data-[state=active]:text-foreground"
                >
                  <Package className="h-4 w-4" />
                  Materiales
                </TabsTrigger>
                <TabsTrigger
                  value="contador"
                  className="gap-2 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative"
                >
                  <Timer className="h-4 w-4" />
                  Contador
                  {counterState.isRunning && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[hsl(142,72%,42%)] animate-pulse" />
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="registros" className="mt-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-foreground">
                      Historial de Cambios de Molde
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ChangesTable />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="graficas" className="mt-4">
                <DashboardCharts />
              </TabsContent>

              <TabsContent value="materiales" className="mt-4">
                <MaterialsTab onToggleFullscreen={() => setMaterialsFullscreen(true)} />
              </TabsContent>

              <TabsContent value="contador" className="mt-4">
                <div className="mx-auto max-w-3xl">
                  <LiveCounter
                    onToggleFullscreen={() => setCounterFullscreen(true)}
                    counterState={counterState}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </>
  )
}
