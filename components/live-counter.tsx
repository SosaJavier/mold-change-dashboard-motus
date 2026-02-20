"use client"

import { useEffect } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Play,
  Square,
  RotateCcw,
  Timer,
  Maximize2,
  Minimize2,
  Save,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { LINEAS } from "@/lib/types"
import type { Linea, MoldChange } from "@/lib/types"
import { useMoldChanges } from "@/hooks/use-mold-changes"
import { toast } from "sonner"
import type { CounterState } from "@/hooks/use-counter-state"

const TARGET_SECONDS = 45 * 60 // 45 minutes



const MOTIVOS = [
  "Cambio de producto",
  "Mantenimiento preventivo",
  "Desgaste del molde",
  "Defectos de calidad",
  "Programacion de produccion",
  "Otro",
]

const RETRASO_MOTIVOS = [
  "Cambio de fierro a fierro",
  "Liberación de pieza",
  "Falla mecánica",
  "Falla eléctrica",
  "Ajuste de proceso",
  "Limpieza de moldes",
  "Falta de personal",
  "Otro",
]

const lineaDotColors: Record<Linea, string> = {
  TB1: "bg-[hsl(220,70%,50%)]",
  TB2: "bg-sky-500",
  TB3: "bg-violet-500",
  EDF1: "bg-amber-500",
  EDF2: "bg-rose-500",
}

const lineaRingColors: Record<Linea, string> = {
  TB1: "stroke-[hsl(220,70%,50%)]",
  TB2: "stroke-sky-500",
  TB3: "stroke-violet-500",
  EDF1: "stroke-amber-500",
  EDF2: "stroke-rose-500",
}

function formatTime(totalSeconds: number) {
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  return {
    hrs: hrs.toString().padStart(2, "0"),
    mins: mins.toString().padStart(2, "0"),
    secs: secs.toString().padStart(2, "0"),
  }
}

interface LiveCounterProps {
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  counterState: CounterState
}

export function LiveCounter({
  isFullscreen = false,
  onToggleFullscreen,
  counterState,
}: LiveCounterProps) {

  const {
    selectedLine,
    setSelectedLine,
    supervisor,
    setSupervisor,
    moldeAnterior,
    setMoldeAnterior,
    moldeNuevo,
    setMoldeNuevo,
    motivo,
    setMotivo,
    retrasoMotivo,
    setRetrasoMotivo,
    retrasoDescripcion,
    setRetrasoDescripcion,
    seconds,
    isRunning,
    startedAt,
    saved,
    setSaved,
    startTimer,
    stopTimer,
    resetTimer,
    resetAll,
    activeChangeId,
    setActiveChangeId,
  } = counterState

  const { addChange, updateChange } = useMoldChanges()

  // Check for Target Time Alert
  useEffect(() => {
    if (seconds === TARGET_SECONDS + 1) {
      toast.error("¡TIEMPO META EXCEDIDO!", {
        description: "El cambio ha superado los 45 minutos.",
        duration: 10000,
      })
    }
  }, [seconds])

  const isOverTarget = seconds > TARGET_SECONDS
  const targetRemaining = TARGET_SECONDS - seconds

  const handleStartTimer = async () => {
    if (!selectedLine || !supervisor || !moldeAnterior || !moldeNuevo || !motivo) {
      toast.error("Completa todos los campos antes de iniciar")
      return
    }

    // Si ya hay un ID activo del servidor, simplemente iniciamos el timer local (si no lo está)
    if (activeChangeId) {
      startTimer()
      return
    }

    // Si no hay ID activo, verificamos si alguien más inició uno recientemente en el servidor
    // antes de crear uno nuevo.
    try {
      if (seconds === 0) {
        const now = new Date()
        const turno =
          now.getHours() < 14
            ? "Primer turno"
            : now.getHours() < 22
              ? "Segundo turno"
              : "Tercer turno"

        const payload: Omit<MoldChange, "id"> = {
          linea: selectedLine as Linea,
          moldeAnterior,
          moldeNuevo,
          supervisor,
          turno,
          motivo,
          estado: "pendiente",
          fechaInicio: new Date().toISOString(),
          fechaFin: null,
          tiempoMuerto: 0,
          observaciones: "PENDIENTE | En curso...",
        }

        const res = await addChange(payload)
        setActiveChangeId(res.id)
      }
      startTimer()
    } catch (error) {
      console.error("Error al crear registro pendiente:", error)
      toast.error("No se pudo iniciar el registro en la base de datos")
      return
    }
  }

  const saveChange = async () => {
    if (!selectedLine || !supervisor || !moldeAnterior || !moldeNuevo || !motivo) {
      toast.error("Datos incompletos")
      return
    }
    if (seconds === 0) {
      toast.error("El contador debe tener tiempo registrado")
      return
    }

    stopTimer()
    const tiempoMinutos = Math.ceil(seconds / 60)

    const now = new Date()
    const turno =
      now.getHours() < 14
        ? "Primer turno"
        : now.getHours() < 22
          ? "Segundo turno"
          : "Tercer turno"

    const t = formatTime(seconds)
    const metaLabel = isOverTarget ? "FUERA DE META" : "EN META"
    const retrasoPart = isOverTarget && retrasoMotivo ? ` | Motivo Retraso: ${retrasoMotivo}` : ""

    const payload: any = {
      linea: selectedLine as Linea,
      moldeAnterior,
      moldeNuevo,
      supervisor,
      turno,
      motivo,
      estado: "completado",
      retrasoMotivo: isOverTarget
        ? (retrasoMotivo === "Otro" ? retrasoDescripcion : retrasoMotivo)
        : undefined,
      fechaFin: new Date().toISOString(),
      tiempoMuerto: tiempoMinutos,
      observaciones: `${metaLabel}${retrasoPart} | Tiempo: ${t.hrs}:${t.mins}:${t.secs} (Meta: 45 min)`,
    }

    try {
      if (activeChangeId) {
        await updateChange(activeChangeId, payload)
      } else {
        await addChange({
          ...payload,
          fechaInicio: startedAt ?? new Date().toISOString(),
        })
      }
      toast.success(
        `Cambio registrado: ${selectedLine} - ${tiempoMinutos} min ${isOverTarget ? "(Fuera de meta)" : "(En meta)"}`
      )
      setSaved(true)
    } catch {
      toast.error("Error al guardar el cambio")
    }
  }

  const time = formatTime(seconds)
  const progress = Math.min(seconds / TARGET_SECONDS, 1)

  const ringSize = isFullscreen ? 340 : 200
  const ringStroke = isFullscreen ? 12 : 8
  const ringRadius = (ringSize - ringStroke * 2) / 2
  const circumference = 2 * Math.PI * ringRadius
  const dashOffset = circumference - progress * circumference

  // Determine ring color: normal line color, or red if over target
  const currentRingStroke = isOverTarget
    ? "stroke-destructive"
    : selectedLine
      ? lineaRingColors[selectedLine as Linea]
      : "stroke-muted-foreground"

  const timerDigitClass = isFullscreen
    ? `text-8xl font-bold tracking-tight font-mono ${isOverTarget ? "text-destructive" : "text-foreground"}`
    : `text-4xl font-bold font-mono ${isOverTarget ? "text-destructive" : "text-foreground"}`

  const colonClass = isFullscreen
    ? `text-5xl mx-1 ${isOverTarget ? "text-destructive/60" : "text-muted-foreground"}`
    : `text-xl ${isOverTarget ? "text-destructive/60" : "text-muted-foreground"}`

  const isFormDisabled = isRunning || saved

  return (
    <Card
      className={`border-border transition-colors duration-300 ${isFullscreen
        ? "border-0 shadow-none bg-background"
        : isOverTarget
          ? "bg-card border-destructive/40"
          : "bg-card"
        }`}
    >
      <CardContent className={isFullscreen ? "p-8" : "p-6"}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-lg ${isOverTarget ? "bg-destructive/10" : "bg-primary/10"
                }`}
            >
              {isOverTarget ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : (
                <Timer className="h-4 w-4 text-primary" />
              )}
            </div>
            <div>
              <h3
                className={`font-semibold text-foreground ${isFullscreen ? "text-xl" : "text-sm"}`}
              >
                Registrar Cambio de Molde
              </h3>
              {isOverTarget && (isRunning || seconds > 0) ? (
                <span className="text-xs text-destructive font-semibold animate-pulse">
                  FUERA DE META
                </span>
              ) : isRunning ? (
                <span className="text-xs text-primary font-medium animate-pulse">
                  Cronometro activo
                </span>
              ) : null}
            </div>
          </div>
          {onToggleFullscreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFullscreen}
              className="gap-1.5 border-border text-foreground bg-transparent hover:bg-secondary"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-4 w-4" />
                  Salir
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4" />
                  Pantalla Completa
                </>
              )}
            </Button>
          )}
        </div>

        <div
          className={`flex gap-6 ${isFullscreen ? "flex-row items-start" : "flex-col"}`}
        >
          {/* Form Fields */}
          <div
            className={`grid gap-3 ${isFullscreen ? "flex-1 grid-cols-2" : "grid-cols-2"}`}
          >
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Linea *</Label>
              <Select
                value={selectedLine}
                onValueChange={(v) => setSelectedLine(v as Linea)}
                disabled={isFormDisabled}
              >
                <SelectTrigger className="h-9 bg-secondary border-border text-foreground">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {LINEAS.map((l) => (
                    <SelectItem key={l} value={l}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${lineaDotColors[l]}`}
                        />
                        {l}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Supervisor *
              </Label>
              <Input
                placeholder="Nombre del Supervisor"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                disabled={isFormDisabled}
                className="h-9 bg-secondary border-border text-foreground"
              />
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Molde Anterior *
              </Label>
              <Input
                placeholder="Ej: M-1200"
                value={moldeAnterior}
                onChange={(e) => setMoldeAnterior(e.target.value)}
                disabled={isFormDisabled}
                className="h-9 bg-secondary border-border text-foreground font-mono"
              />
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Molde Nuevo *
              </Label>
              <Input
                placeholder="Ej: M-1350"
                value={moldeNuevo}
                onChange={(e) => setMoldeNuevo(e.target.value)}
                disabled={isFormDisabled}
                className="h-9 bg-secondary border-border text-foreground font-mono"
              />
            </div>

            <div className="col-span-2 grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Motivo *</Label>
              <Select
                value={motivo}
                onValueChange={setMotivo}
                disabled={isFormDisabled}
              >
                <SelectTrigger className="h-9 bg-secondary border-border text-foreground">
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {MOTIVOS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isOverTarget && (
              <div className="col-span-2 grid gap-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-xs text-destructive font-semibold">Motivo de Retraso *</Label>
                <Select
                  value={retrasoMotivo}
                  onValueChange={setRetrasoMotivo}
                  disabled={saved}
                >
                  <SelectTrigger className="h-9 bg-destructive/5 border-destructive/20 text-foreground">
                    <SelectValue placeholder="Seleccionar motivo de retraso" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {RETRASO_MOTIVOS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isOverTarget && retrasoMotivo === "Otro" && (
              <div className="col-span-2 grid gap-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-xs text-destructive font-semibold">Especificar Motivo *</Label>
                <Input
                  placeholder="Describe a detalle el motivo del retraso"
                  value={retrasoDescripcion}
                  onChange={(e) => setRetrasoDescripcion(e.target.value)}
                  disabled={saved}
                  className="h-9 bg-destructive/5 border-destructive/20 text-foreground"
                />
              </div>
            )}
          </div>

          {/* Timer Ring + Target */}
          <div
            className={`flex flex-col items-center gap-4 ${isFullscreen ? "flex-1" : ""}`}
          >
            <div className="relative flex items-center justify-center">
              <svg
                width={ringSize}
                height={ringSize}
                viewBox={`0 0 ${ringSize} ${ringSize}`}
                className="-rotate-90"
              >
                {/* Background track */}
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  fill="none"
                  className="stroke-secondary"
                  strokeWidth={ringStroke}
                />
                {/* Progress ring */}
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  fill="none"
                  className={currentRingStroke}
                  strokeWidth={ringStroke}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
                {/* Over-target: second full ring pulsing red */}
                {isOverTarget && (
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={ringRadius}
                    fill="none"
                    className="stroke-destructive/20"
                    strokeWidth={ringStroke + 6}
                    style={{
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="flex items-baseline font-mono">
                  <span className={timerDigitClass}>{time.hrs}</span>
                  <span className={colonClass}>:</span>
                  <span className={timerDigitClass}>{time.mins}</span>
                  <span className={colonClass}>:</span>
                  <span className={timerDigitClass}>{time.secs}</span>
                </div>

                {/* Target Badge */}
                {(isRunning || seconds > 0) && !saved && (
                  <div
                    className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${isOverTarget
                      ? "bg-destructive/15 text-destructive"
                      : "bg-[hsl(142,72%,42%)]/15 text-[hsl(142,72%,42%)]"
                      }`}
                  >
                    {isOverTarget ? (
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {`+${formatTime(seconds - TARGET_SECONDS).mins}:${formatTime(seconds - TARGET_SECONDS).secs} fuera de meta`}
                      </span>
                    ) : (
                      <span>
                        {"Faltan "}
                        {formatTime(targetRemaining).mins}:{formatTime(targetRemaining).secs}
                        {" para meta"}
                      </span>
                    )}
                  </div>
                )}

                {saved && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle2 className="h-4 w-4 text-[hsl(142,72%,42%)]" />
                    <span className="text-xs font-medium text-[hsl(142,72%,42%)]">
                      Guardado
                    </span>
                  </div>
                )}

                {!isRunning && seconds === 0 && !saved && (
                  <span
                    className={`text-muted-foreground mt-1 ${isFullscreen ? "text-sm" : "text-xs"}`}
                  >
                    Meta: 45 minutos
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {!isRunning && !saved ? (
                <Button
                  onClick={handleStartTimer}
                  size={isFullscreen ? "lg" : "sm"}
                  className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Play className="h-3.5 w-3.5" />
                  {seconds > 0 ? "Continuar" : "Iniciar"}
                </Button>
              ) : isRunning ? (
                <Button
                  onClick={stopTimer}
                  size={isFullscreen ? "lg" : "sm"}
                  variant="destructive"
                  className="gap-1.5"
                >
                  <Square className="h-3.5 w-3.5" />
                  Detener
                </Button>
              ) : null}

              {!isRunning && seconds > 0 && !saved && (
                <Button
                  onClick={saveChange}
                  disabled={isOverTarget && (!retrasoMotivo || (retrasoMotivo === "Otro" && !retrasoDescripcion))}
                  size={isFullscreen ? "lg" : "sm"}
                  className="gap-1.5 bg-[hsl(142,72%,42%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(142,72%,36%)] disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  Guardar Cambio
                </Button>
              )}

              <Button
                onClick={saved ? resetAll : resetTimer}
                size={isFullscreen ? "lg" : "sm"}
                variant="outline"
                className="gap-1.5 border-border text-foreground bg-transparent hover:bg-secondary"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {saved ? "Nuevo Cambio" : "Reiniciar"}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Footer: Target-based */}
        <div
          className={`grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border ${isFullscreen ? "max-w-lg mx-auto" : ""}`}
        >
          <div className="text-center">
            <div
              className={`font-bold font-mono ${isFullscreen ? "text-3xl" : "text-lg"} ${isOverTarget ? "text-destructive" : "text-foreground"
                }`}
            >
              {Math.ceil(seconds / 60)}
            </div>
            <div
              className={`text-muted-foreground ${isFullscreen ? "text-sm" : "text-[10px]"}`}
            >
              Min Transcurridos
            </div>
          </div>
          <div className="text-center">
            <div
              className={`font-bold font-mono text-foreground ${isFullscreen ? "text-3xl" : "text-lg"}`}
            >
              45
            </div>
            <div
              className={`text-muted-foreground ${isFullscreen ? "text-sm" : "text-[10px]"}`}
            >
              Meta (min)
            </div>
          </div>
          <div className="text-center">
            <div
              className={`font-bold font-mono ${isFullscreen ? "text-3xl" : "text-lg"} ${isOverTarget ? "text-destructive" : "text-[hsl(142,72%,42%)]"
                }`}
            >
              {isOverTarget
                ? `+${Math.ceil((seconds - TARGET_SECONDS) / 60)}`
                : Math.max(0, 45 - Math.ceil(seconds / 60))}
            </div>
            <div
              className={`text-muted-foreground ${isFullscreen ? "text-sm" : "text-[10px]"}`}
            >
              {isOverTarget ? "Min Excedidos" : "Min Restantes"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
