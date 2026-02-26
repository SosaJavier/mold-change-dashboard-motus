import useSWR from "swr"
import { toast } from "sonner"

export interface ScheduledChange {
    id: string
    date: string // ISO string
    moldId: string
    description: string
    linea: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useScheduledChange() {
    const { data: schedules = [], error, isLoading, mutate } = useSWR<ScheduledChange[]>(
        '/api/scheduled-changes',
        fetcher,
        { refreshInterval: 5000 }
    )

    const addSchedule = async (date: Date, moldId: string, description: string, linea: string) => {
        try {
            const response = await fetch('/api/scheduled-changes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: date.toISOString(), moldId, description, linea })
            })

            if (!response.ok) throw new Error("Failed to add")

            const newSchedule = await response.json()
            await mutate() // Revalidate
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

            await mutate() // Revalidate
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

            await mutate() // Revalidate
            toast.success("Horario actualizado correctamente")
        } catch (error) {
            console.error("Failed to update schedule", error)
            toast.error("Error al actualizar programacion")
        }
    }

    const nextChange = (schedules && schedules.length > 0) ? schedules[0] : undefined

    return {
        schedules: schedules || [],
        nextChange,
        isLoading,
        addSchedule,
        removeSchedule,
        updateSchedule,
        refreshSchedules: mutate
    }
}
