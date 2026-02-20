import { useState, useEffect } from "react"
import { toast } from "sonner"

const STORAGE_KEY = "mold-dashboard-scheduled-changes-v2"

export interface ScheduledChange {
    id: string
    date: string // ISO string
    moldId: string
    description: string
    linea: string
}

export function useScheduledChange() {
    const [schedules, setSchedules] = useState<ScheduledChange[]>([])

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as ScheduledChange[]
                // Filter out past events that are older than 24 hours (cleanup)
                const now = new Date()
                const valid = parsed.filter(s => new Date(s.date).getTime() > now.getTime() - 24 * 60 * 60 * 1000)
                setSchedules(valid)
            } catch (e) {
                console.error("Failed to parse schedules", e)
            }
        }
    }, [])

    const saveSchedules = (newSchedules: ScheduledChange[]) => {
        setSchedules(newSchedules)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSchedules))
    }

    const addSchedule = (date: Date, moldId: string, description: string, linea: string) => {
        const newSchedule: ScheduledChange = {
            id: crypto.randomUUID(),
            date: date.toISOString(),
            moldId,
            description,
            linea
        }
        const updated = [...schedules, newSchedule].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        saveSchedules(updated)
        toast.success("Cambio programado correctamente")
    }

    const removeSchedule = (id: string) => {
        const updated = schedules.filter(s => s.id !== id)
        saveSchedules(updated)
        toast.success("Programacion eliminada")
    }

    const updateSchedule = (id: string, newDate: Date) => {
        const updated = schedules.map(s =>
            s.id === id ? { ...s, date: newDate.toISOString() } : s
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        saveSchedules(updated)
        toast.success("Horario actualizado correctamente")
    }

    // Get the *next* upcoming change (or the one currently waiting for confirmation)
    // We just take the first one because the list is sorted by date, and users manually remove them.
    const nextChange = schedules.length > 0 ? schedules[0] : undefined

    return {
        schedules,
        nextChange,
        addSchedule,
        removeSchedule,
        updateSchedule
    }
}
