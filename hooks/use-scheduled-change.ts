import { useState, useEffect } from "react"
import { toast } from "sonner"

export interface ScheduledChange {
    id: string
    date: string // ISO string
    moldId: string
    description: string
    linea: string
}

export function useScheduledChange() {
    const [schedules, setSchedules] = useState<ScheduledChange[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchSchedules = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/scheduled-changes')
            if (!response.ok) throw new Error("Failed to fetch")
            const data = await response.json()
            setSchedules(data)
        } catch (error) {
            console.error("Failed to load schedules", error)
            toast.error("Error al cargar cambios programados")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSchedules()

        // Optional: Poll for changes every 30 seconds to keep devices in sync
        const interval = setInterval(fetchSchedules, 30000)
        return () => clearInterval(interval)
    }, [])

    const addSchedule = async (date: Date, moldId: string, description: string, linea: string) => {
        try {
            const response = await fetch('/api/scheduled-changes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: date.toISOString(), moldId, description, linea })
            })

            if (!response.ok) throw new Error("Failed to add")

            const newSchedule = await response.json()
            setSchedules(prev => [...prev, newSchedule].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
            return newSchedule
        } catch (error) {
            console.error("Failed to add schedule", error)
            throw error
        }
    }

    const removeSchedule = async (id: string) => {
        try {
            const response = await fetch(`/api/scheduled-changes/${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error("Failed to remove")

            setSchedules(prev => prev.filter(s => s.id !== id))
            toast.success("Programacion eliminada")
        } catch (error) {
            console.error("Failed to remove schedule", error)
            toast.error("Error al eliminar programacion")
        }
    }

    const updateSchedule = async (id: string, newDate: Date) => {
        try {
            const response = await fetch(`/api/scheduled-changes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: newDate.toISOString() })
            })

            if (!response.ok) throw new Error("Failed to update")

            setSchedules(prev => prev.map(s =>
                s.id === id ? { ...s, date: newDate.toISOString() } : s
            ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
            toast.success("Horario actualizado correctamente")
        } catch (error) {
            console.error("Failed to update schedule", error)
            toast.error("Error al actualizar programacion")
        }
    }

    const nextChange = schedules.length > 0 ? schedules[0] : undefined

    return {
        schedules,
        nextChange,
        isLoading,
        addSchedule,
        removeSchedule,
        updateSchedule,
        refreshSchedules: fetchSchedules
    }
}
