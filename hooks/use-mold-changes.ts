import useSWR from "swr"
import type { MoldChange } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useMoldChanges() {
  const { data, error, isLoading, mutate } = useSWR<MoldChange[]>(
    "/api/mold-changes",
    fetcher,
    { refreshInterval: 5000 }
  )

  const addChange = async (change: Omit<MoldChange, "id">) => {
    const res = await fetch("/api/mold-changes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(change),
    })
    if (!res.ok) throw new Error("Error al crear cambio")
    await mutate()
    return res.json()
  }

  const removeChange = async (id: string) => {
    const res = await fetch(`/api/mold-changes/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Error al eliminar")
    await mutate()
  }

  const completeChange = async (id: string, tiempoMuerto: number) => {
    const res = await fetch(`/api/mold-changes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estado: "completado",
        fechaFin: new Date().toISOString(),
        tiempoMuerto,
      }),
    })
    if (!res.ok) throw new Error("Error al completar")
    await mutate()
  }

  const updateChange = async (id: string, change: Partial<MoldChange>) => {
    const res = await fetch(`/api/mold-changes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(change),
    })
    if (!res.ok) throw new Error("Error al actualizar cambio")
    await mutate()
    return res.json()
  }

  return {
    changes: data ?? [],
    isLoading,
    isError: !!error,
    addChange,
    removeChange,
    completeChange,
    updateChange,
    mutate,
  }
}
