"use client"

import { Wrench, Factory } from "lucide-react"

export function DashboardHeader() {
  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Wrench className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">MoldTrack</h1>
          <p className="text-xs text-muted-foreground">Control de Cambios de Molde</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
          <Factory className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">5 Lineas Activas</span>
        </div>
        <span className="text-xs text-muted-foreground capitalize">{today}</span>
      </div>
    </header>
  )
}
