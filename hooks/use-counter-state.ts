"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { Linea, MoldChange } from "@/lib/types"
import { toast } from "sonner"
import { useMoldChanges } from "./use-mold-changes"

export interface CounterState {
  selectedLine: string
  setSelectedLine: (v: Linea | "") => void
  supervisor: string
  setSupervisor: (v: string) => void
  moldeAnterior: string
  setMoldeAnterior: (v: string) => void
  moldeNuevo: string
  setMoldeNuevo: (v: string) => void
  motivo: string
  setMotivo: (v: string) => void
  retrasoMotivo: string
  setRetrasoMotivo: (v: string) => void
  retrasoDescripcion: string
  setRetrasoDescripcion: (v: string) => void
  seconds: number
  isRunning: boolean
  startedAt: string | null
  saved: boolean
  setSaved: (v: boolean) => void
  activeChangeId: string | null
  setActiveChangeId: (id: string | null) => void
  startTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  resetAll: () => void
}

export function useCounterState(): CounterState {
  // Local form state
  const [selectedLine, setSelectedLine] = useState<Linea | "">("")
  const [supervisor, setSupervisor] = useState("")
  const [moldeAnterior, setMoldeAnterior] = useState("")
  const [moldeNuevo, setMoldeNuevo] = useState("")
  const [motivo, setMotivo] = useState("")
  const [retrasoMotivo, setRetrasoMotivo] = useState("")
  const [retrasoDescripcion, setRetrasoDescripcion] = useState("")

  // Timer state
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [activeChangeId, setActiveChangeId] = useState<string | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // DB Sync
  const { changes } = useMoldChanges()

  // Sincronización con la Base de Datos
  useEffect(() => {
    // Buscar si hay algún cambio pendiente o en proceso
    const activeChange = changes.find(c => c.estado === 'pendiente' || c.estado === 'en_proceso')

    if (activeChange) {
      // Si encontramos un cambio activo en el servidor, actualizamos el estado local
      setActiveChangeId(activeChange.id.toString())
      setSelectedLine(activeChange.linea)
      setSupervisor(activeChange.supervisor)
      setMoldeAnterior(activeChange.moldeAnterior)
      setMoldeNuevo(activeChange.moldeNuevo)
      setMotivo(activeChange.motivo)
      setStartedAt(activeChange.fechaInicio)
      setSaved(false)

      // Calculamos los segundos transcurridos desde el inicio
      const start = new Date(activeChange.fechaInicio).getTime()
      const now = new Date().getTime()
      const elapsed = Math.max(0, Math.floor((now - start) / 1000))
      setSeconds(elapsed)

      // Si no está corriendo localmente, lo activamos
      if (!intervalRef.current) {
        setIsRunning(true)
        intervalRef.current = setInterval(() => {
          setSeconds((prev) => prev + 1)
        }, 1000)
      }
    } else {
      // Si no hay cambios activos en el servidor pero tenemos un ID activo localmente,
      // significa que alguien más lo completó o eliminó.
      if (activeChangeId && !saved) {
        toast.info("Un cambio fue completado o eliminado por otro usuario.")
        resetAll()
      }
    }
  }, [changes, activeChangeId, saved])

  const startTimer = useCallback(() => {
    if (!selectedLine || !supervisor || !moldeAnterior || !moldeNuevo || !motivo) {
      toast.error("Completa todos los campos antes de iniciar")
      return
    }
    if (intervalRef.current) return

    setIsRunning(true)
    setSaved(false)

    if (!startedAt) {
      setStartedAt(new Date().toISOString())
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
  }, [selectedLine, supervisor, moldeAnterior, moldeNuevo, motivo, startedAt])

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }, [])

  const resetTimer = useCallback(() => {
    stopTimer()
    setSeconds(0)
    setStartedAt(null)
    setSaved(false)
  }, [stopTimer])

  const resetAll = useCallback(() => {
    stopTimer()
    setSeconds(0)
    setStartedAt(null)
    setSaved(false)
    setSelectedLine("")
    setSupervisor("")
    setMoldeAnterior("")
    setMoldeNuevo("")
    setMotivo("")
    setRetrasoMotivo("")
    setRetrasoDescripcion("")
    setActiveChangeId(null)
  }, [stopTimer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return {
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
    activeChangeId,
    setActiveChangeId,
    startTimer,
    stopTimer,
    resetTimer,
    resetAll,
  }
}
