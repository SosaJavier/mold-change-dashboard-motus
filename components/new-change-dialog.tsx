"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Timer } from "lucide-react"
import { LINEAS } from "@/lib/types"
import type { Linea, EstadoCambio, MoldChange } from "@/lib/types"
import { useMoldChanges } from "@/hooks/use-mold-changes"
import { toast } from "sonner"
import type { CounterState } from "@/hooks/use-counter-state"

const MOTIVOS = [
  "Cambio de producto",
  "Mantenimiento preventivo",
  "Desgaste del molde",
  "Defectos de calidad",
  "Programacion de produccion",
  "Otro",
]

const TURNOS = ["Primer turno", "Segundo turno", "Tercer turno"] as const

interface NewChangeDialogProps {
  counterState?: CounterState
}

export function NewChangeDialog({ counterState }: NewChangeDialogProps) {
  const { addChange } = useMoldChanges()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    linea: "" as Linea | "",
    moldeAnterior: "",
    moldeNuevo: "",
    supervisor: "",
    turno: "" as (typeof TURNOS)[number] | "",
    motivo: "",
    estado: "en_proceso" as EstadoCambio,
    observaciones: "",
  })

  function resetForm() {
    setForm({
      linea: "",
      moldeAnterior: "",
      moldeNuevo: "",
      supervisor: "",
      turno: "",
      motivo: "",
      estado: "en_proceso",
      observaciones: "",
    })
  }

  async function handleSubmit() {
    if (!form.linea || !form.moldeAnterior || !form.moldeNuevo || !form.supervisor || !form.turno || !form.motivo) {
      toast.error("Completa todos los campos requeridos")
      return
    }
    setLoading(true)
    try {
      const payload: Omit<MoldChange, "id"> = {
        linea: form.linea as Linea,
        moldeAnterior: form.moldeAnterior,
        moldeNuevo: form.moldeNuevo,
        supervisor: form.supervisor,
        turno: form.turno as (typeof TURNOS)[number],
        motivo: form.motivo,
        estado: form.estado,
        fechaInicio: new Date().toISOString(),
        fechaFin: form.estado === "completado" ? new Date().toISOString() : null,
        tiempoMuerto: 0,
        observaciones: form.observaciones,
      }
      await addChange(payload)
      toast.success("Cambio de molde registrado correctamente")
      resetForm()
      setOpen(false)
    } catch {
      toast.error("Error al registrar el cambio")
    } finally {
      setLoading(false)
    }
  }

  const handleStartTimer = () => {
    if (!counterState) return

    if (!form.linea || !form.moldeAnterior || !form.moldeNuevo || !form.supervisor || !form.motivo) {
      toast.error("Completa Linea, Supervisor, Moldes y Motivo para iniciar el cronometro")
      return
    }

    if (counterState.isRunning) {
      toast.error("Ya hay un cronometro activo. Detenlo primero.")
      return
    }

    // Set Counter State
    counterState.setSelectedLine(form.linea as Linea)
    counterState.setSupervisor(form.supervisor)
    counterState.setMoldeAnterior(form.moldeAnterior)
    counterState.setMoldeNuevo(form.moldeNuevo)
    counterState.setMotivo(form.motivo)

    // Start!
    counterState.startTimer()
    setOpen(false)
    toast.success("¡Cronometro Iniciado!", {
      description: "El cambio de molde esta siendo monitoreado en tiempo real."
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nuevo Cambio
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Registrar Cambio de Molde</DialogTitle>
        </DialogHeader>

        {/* ... (Keep existing form fields exactly as they are) */}

        <div className="grid gap-4 py-2">
          {/* ... Linea & Turno */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">Linea *</Label>
              <Select
                value={form.linea}
                onValueChange={(v) => setForm({ ...form, linea: v as Linea })}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {LINEAS.map((l) => (
                    <SelectItem key={l} value={l} className="text-foreground">
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">Turno *</Label>
              <Select
                value={form.turno}
                onValueChange={(v) =>
                  setForm({ ...form, turno: v as (typeof TURNOS)[number] })
                }
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {TURNOS.map((t) => (
                    <SelectItem key={t} value={t} className="text-foreground">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ... Moldes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">Molde Anterior *</Label>
              <Input
                placeholder="Ej: M-1200"
                value={form.moldeAnterior}
                onChange={(e) => setForm({ ...form, moldeAnterior: e.target.value })}
                className="bg-background border-border text-foreground font-mono"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">Molde Nuevo *</Label>
              <Input
                placeholder="Ej: M-1350"
                value={form.moldeNuevo}
                onChange={(e) => setForm({ ...form, moldeNuevo: e.target.value })}
                className="bg-background border-border text-foreground font-mono"
              />
            </div>
          </div>

          {/* ... Operador & Motivo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">Supervisor *</Label>
              <Input
                placeholder="Nombre del Supervisor"
                value={form.supervisor}
                onChange={(e) => setForm({ ...form, supervisor: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">Motivo *</Label>
              <Select
                value={form.motivo}
                onValueChange={(v) => setForm({ ...form, motivo: v })}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {MOTIVOS.map((m) => (
                    <SelectItem key={m} value={m} className="text-foreground">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs text-muted-foreground">Estado</Label>
            <Select
              value={form.estado}
              onValueChange={(v) =>
                setForm({ ...form, estado: v as EstadoCambio })
              }
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="en_proceso" className="text-foreground">En Proceso</SelectItem>
                <SelectItem value="completado" className="text-foreground">Completado</SelectItem>
                <SelectItem value="pendiente" className="text-foreground">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs text-muted-foreground">Observaciones</Label>
            <Textarea
              placeholder="Notas adicionales..."
              value={form.observaciones}
              onChange={(e) =>
                setForm({ ...form, observaciones: e.target.value })
              }
              className="bg-background border-border text-foreground resize-none"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {counterState && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleStartTimer}
              className="w-full sm:w-auto bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700 border border-green-500/20"
            >
              <Timer className="mr-2 h-4 w-4" />
              Iniciar Contador
            </Button>
          )}
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <DialogClose asChild>
              <Button variant="outline" className="border-border text-foreground bg-transparent">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "Registrando..." : "Registrar Manual"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
