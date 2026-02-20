"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMoldChanges } from "@/hooks/use-mold-changes"
import { useScheduledChange } from "@/hooks/use-scheduled-change"
import type { ScheduledChange } from "@/hooks/use-scheduled-change"
import { Clock, Save, Info, Maximize2, Minimize2, CalendarClock, Trash2, History, Package, Download, Pencil, Check, X } from "lucide-react"
import { toast } from "sonner"
import { exportToExcel } from "@/lib/export-utils"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend
} from "recharts"
import { LINEAS } from "@/lib/types"

// ... inside component


interface MaterialsTabProps {
    isFullscreen?: boolean
    onToggleFullscreen?: () => void
}

// Extracted Component to prevent re-render flickering
function CountdownDisplay({
    nextChange,
    onComplete,
    large = false
}: {
    nextChange: ScheduledChange | undefined,
    onComplete?: () => void,
    large?: boolean
}) {
    const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number, totalSeconds: number } | null>(null)
    const [isExpired, setIsExpired] = useState(false)

    useEffect(() => {
        if (!nextChange) {
            setTimeLeft(null)
            setIsExpired(false)
            return
        }

        const targetDate = new Date(nextChange.date)

        const updateTimer = () => {
            const now = new Date()
            const diff = targetDate.getTime() - now.getTime()

            if (diff <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 })
                setIsExpired(true)
                return
            }

            setIsExpired(false)
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)
            const totalSeconds = Math.floor(diff / 1000)

            setTimeLeft({ hours, minutes, seconds, totalSeconds })
        }

        updateTimer() // Initial call
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [nextChange])

    if (!nextChange) return <div className="text-muted-foreground opacity-70 p-4 border rounded-lg border-dashed text-center">No hay cambios programados proximamente.</div>

    // Determine Status Color
    let statusColor = "text-primary"
    let statusBg = "bg-primary/5 border-primary/10"
    let iconColor = "text-primary"
    let isUrgent = false

    if (timeLeft) {
        if (isExpired) {
            statusColor = "text-destructive animate-pulse"
            statusBg = "bg-destructive/20 border-destructive/50"
            iconColor = "text-destructive"
            isUrgent = true
        } else if (timeLeft.totalSeconds <= 5 * 60) { // Less than 5 mins
            statusColor = "text-destructive animate-pulse"
            statusBg = "bg-destructive/10 border-destructive/20 animate-pulse"
            iconColor = "text-destructive"
            isUrgent = true
        } else if (timeLeft.totalSeconds <= 15 * 60) { // Less than 15 mins
            statusColor = "text-orange-500"
            statusBg = "bg-orange-500/10 border-orange-500/20"
            iconColor = "text-orange-500"
        }
    }

    return (
        <div className="flex flex-col items-center animate-in zoom-in duration-300 w-full">
            <div className={`${statusBg} rounded-2xl p-6 w-full border relative overflow-hidden transition-colors duration-500`}>
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <CalendarClock className={`${large ? "h-64 w-64" : "h-32 w-32"} ${iconColor}`} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left flex-1">
                        <span className={`text-xs font-bold tracking-wider uppercase mb-2 block ${isUrgent ? "animate-bounce text-destructive" : iconColor}`}>
                            {isExpired ? "¡TIEMPO AGOTADO!" : (isUrgent ? "¡CAMBIO INMINENTE!" : "Siguiente Cambio Programado")}
                        </span>

                        {isExpired && onComplete ? (
                            <div className="flex flex-col items-center md:items-start gap-4 animate-in fade-in zoom-in">
                                <div className={`font-mono font-bold tracking-tighter tabular-nums ${large ? "text-7xl" : "text-5xl"} ${statusColor} mb-2`}>
                                    00:00:00
                                </div>
                                <Button
                                    size="lg"
                                    variant="destructive"
                                    onClick={onComplete}
                                    className="w-full md:w-auto text-xl h-16 px-8 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)] transition-all"
                                >
                                    <Clock className="mr-3 h-6 w-6" />
                                    INICIAR CAMBIO AHORA
                                </Button>
                            </div>
                        ) : (
                            timeLeft ? (
                                <div className={`font-mono font-bold tracking-tighter tabular-nums ${large ? "text-9xl" : "text-6xl"} ${statusColor}`}>
                                    {timeLeft.hours.toString().padStart(2, '0')}:
                                    {timeLeft.minutes.toString().padStart(2, '0')}:
                                    {timeLeft.seconds.toString().padStart(2, '0')}
                                </div>
                            ) : (
                                <div className="text-4xl animate-pulse">Calculando...</div>
                            )
                        )}

                        {!isExpired && (
                            <div className="flex flex-col md:flex-row gap-3 mt-4">
                                <p className="text-muted-foreground font-medium bg-background/50 inline-block px-3 py-1 rounded-full border border-border/50">
                                    Programado: {new Date(nextChange.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {nextChange.linea && (
                                    <p className="font-bold text-foreground bg-secondary inline-block px-3 py-1 rounded-full border border-border/50">
                                        Linea: {nextChange.linea}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className={`bg-card rounded-xl p-6 border shadow-sm min-w-[300px] ${large ? "md:min-w-[450px]" : ""}`}>
                        <div className="flex items-start gap-5">
                            <div className={`${isUrgent ? "bg-destructive/10" : "bg-primary/10"} p-4 rounded-xl transition-colors duration-500`}>
                                <Package className={`h-10 w-10 ${iconColor}`} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Molde a instalar</h3>
                                    {nextChange.linea && (
                                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold border border-primary/20 shadow-sm">
                                            {nextChange.linea}
                                        </span>
                                    )}
                                </div>
                                <div className="text-4xl font-bold text-foreground mt-1 tracking-tight">{nextChange.moldId}</div>
                                {nextChange.description && (
                                    <p className="text-base text-muted-foreground mt-3 border-t pt-3 border-border/50 leading-relaxed">
                                        {nextChange.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function MaterialsTab({ isFullscreen = false, onToggleFullscreen }: MaterialsTabProps) {
    const { changes } = useMoldChanges()
    const { schedules, nextChange, addSchedule, removeSchedule, updateSchedule } = useScheduledChange()

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editTime, setEditTime] = useState("")

    // Local state for scheduling form
    const [scheduleTime, setScheduleTime] = useState("")
    const [scheduleMoldId, setScheduleMoldId] = useState("")
    const [scheduleDesc, setScheduleDesc] = useState("")
    const [scheduleLinea, setScheduleLinea] = useState("")

    // Local state for mold info form
    const [moldId, setMoldId] = useState("")
    const [cycleTime, setCycleTime] = useState("")
    const [description, setDescription] = useState("")

    // Persistence for Current Mold Info
    useEffect(() => {
        const savedMoldId = localStorage.getItem("mold-dashboard-current-mold-id")
        const savedCycleTime = localStorage.getItem("mold-dashboard-current-cycle-time")
        const savedDescription = localStorage.getItem("mold-dashboard-current-description")

        if (savedMoldId) setMoldId(savedMoldId)
        if (savedCycleTime) setCycleTime(savedCycleTime)
        if (savedDescription) setDescription(savedDescription)
    }, [])


    // Calculate averages (Logic reused)
    const stats = useMemo(() => {
        const now = new Date()
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const completedChanges = changes.filter(c => c.estado === "completado" && c.tiempoMuerto > 0)

        const weeklyChanges = completedChanges.filter(c => new Date(c.fechaInicio) >= oneWeekAgo)
        const monthlyChanges = completedChanges.filter(c => new Date(c.fechaInicio) >= oneMonthAgo)

        const calculateAverage = (items: typeof changes) => {
            if (items.length === 0) return 0
            const total = items.reduce((acc, curr) => acc + curr.tiempoMuerto, 0)
            return Math.round(total / items.length)
        }

        return {
            weekly: calculateAverage(weeklyChanges),
            monthly: calculateAverage(monthlyChanges)
        }
    }, [changes])

    // Get Last 30 Days History
    const historyLast30 = useMemo(() => {
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return changes
            .filter(c => new Date(c.fechaInicio) >= thirtyDaysAgo && c.estado === "completado")
            .sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime())
    }, [changes])

    // Get Upcoming 7 Days
    const upcoming7Days = useMemo(() => {
        const now = new Date()
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        return schedules.filter(s => {
            const d = new Date(s.date)
            return d > now && d <= sevenDaysLater
        })
    }, [schedules])

    const handleExportToExcel = () => {
        const completedChanges = changes.filter(c => c.estado === "completado")

        if (completedChanges.length === 0) {
            toast.error("No hay registros para exportar")
            return
        }

        try {
            exportToExcel(completedChanges, "historial_cambios_molde")
            toast.success("Reporte descargado en formato Excel")
        } catch (error) {
            console.error("Export Error:", error)
            toast.error("Error al exportar el reporte")
        }
    }

    const chartData = [
        { name: "Semanal", tiempo: stats.weekly, fill: "hsl(220, 70%, 50%)" },
        { name: "Mensual", tiempo: stats.monthly, fill: "hsl(142, 72%, 42%)" },
    ]

    const handleCreateSchedule = () => {
        if (!scheduleTime || !scheduleMoldId || !scheduleLinea) {
            toast.error("Hora, Linea y ID de Molde requeridos")
            return
        }

        const [hours, minutes] = scheduleTime.split(":").map(Number)
        const now = new Date()
        const scheduledDate = new Date()
        scheduledDate.setHours(hours, minutes, 0, 0)

        if (scheduledDate < now) {
            scheduledDate.setDate(scheduledDate.getDate() + 1)
        }

        addSchedule(scheduledDate, scheduleMoldId, scheduleDesc, scheduleLinea)
        setScheduleTime("")
        setScheduleMoldId("")
        setScheduleDesc("")
        setScheduleLinea("")
    }

    const handleStartEdit = (id: string, dateStr: string) => {
        setEditingId(id)
        const date = new Date(dateStr)
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        setEditTime(`${hours}:${minutes}`)
    }

    const handleSaveEdit = (id: string) => {
        if (!editTime) return

        const [hours, minutes] = editTime.split(":").map(Number)
        const newDate = new Date()
        newDate.setHours(hours, minutes, 0, 0)

        // If time is in the past for today, assume tomorrow
        if (newDate < new Date()) {
            newDate.setDate(newDate.getDate() + 1)
        }

        updateSchedule(id, newDate)
        setEditingId(null)
    }

    const handleNextChangeComplete = () => {
        if (nextChange) {
            removeSchedule(nextChange.id)
            toast.success("¡Cambio de molde iniciado!")
        }
    }

    const handleSaveInfo = () => {
        if (!moldId) {
            toast.error("Por favor ingrese un ID de Molde")
            return
        }
        localStorage.setItem("mold-dashboard-current-mold-id", moldId)
        localStorage.setItem("mold-dashboard-current-cycle-time", cycleTime)
        localStorage.setItem("mold-dashboard-current-description", description)

        toast.success("Información del molde guardada correctamente")
    }

    // Only render simplified view if NOT fullscreen
    if (!isFullscreen) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Info className="h-6 w-6 text-primary" />
                        Control de Materiales
                    </h2>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportToExcel} className="gap-2">
                            <Download className="h-4 w-4" /> Exportar
                        </Button>
                        {onToggleFullscreen && (
                            <Button variant="outline" size="sm" onClick={onToggleFullscreen} className="gap-2">
                                <Maximize2 className="h-4 w-4" /> Pantalla Completa
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column: Scheduler & List */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CalendarClock className="h-4 w-4" /> Programar Cambio
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Hora</Label>
                                        <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ID Molde</Label>
                                        <Input value={scheduleMoldId} onChange={e => setScheduleMoldId(e.target.value)} placeholder="Ej. M-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Linea</Label>
                                        <Select value={scheduleLinea} onValueChange={setScheduleLinea}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {LINEAS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Descripción (Opcional)</Label>
                                        <Input value={scheduleDesc} onChange={e => setScheduleDesc(e.target.value)} placeholder="Detalles..." />
                                    </div>
                                </div>

                                <Button onClick={handleCreateSchedule} className="w-full">Agendar</Button>

                                {/* Mini List of Upcoming */}
                                <div className="mt-6 pt-4 border-t">
                                    <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Próximos en lista</h4>
                                    <div className="space-y-2 max-h-[200px] overflow-auto pr-2 custom-scrollbar">
                                        {schedules.length === 0 && <p className="text-sm text-muted-foreground italic">Sin cambios pendientes.</p>}
                                        {schedules.map(s => {
                                            const isEditing = editingId === s.id
                                            return (
                                                <div key={s.id} className="flex items-center justify-between text-sm p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                                                    <div className="flex-1">
                                                        {isEditing ? (
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    type="time"
                                                                    className="h-8 w-24 text-xs"
                                                                    value={editTime}
                                                                    onChange={e => setEditTime(e.target.value)}
                                                                />
                                                                <span className="font-semibold text-primary">{s.moldId}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold font-mono bg-background px-1.5 rounded">{new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                <span className="font-semibold text-primary">{s.moldId}</span>
                                                                <span className="text-[10px] bg-primary/10 px-1.5 py-0.5 rounded text-primary">{s.linea}</span>
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">{s.description}</div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {isEditing ? (
                                                            <>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500 hover:text-emerald-600" onClick={() => handleSaveEdit(s.id)}>
                                                                    <Check className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setEditingId(null)}>
                                                                    <X className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleStartEdit(s.id, s.date)}>
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeSchedule(s.id)}>
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Countdown & Mold Info */}
                    <div className="space-y-6">

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Próxima Actividad</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CountdownDisplay nextChange={nextChange} onComplete={handleNextChangeComplete} />
                            </CardContent>
                        </Card>

                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-base">Métricas de Tiempo (Meta: 45 min)</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 min-h-[300px]">
                                <div className="grid grid-cols-2 gap-2 h-full">
                                    {/* Weekly Donut */}
                                    <div className="flex flex-col items-center justify-center relative">
                                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                            <span className={`text-3xl font-bold ${stats.weekly > 45 ? "text-red-500" : "text-emerald-500"}`}>
                                                {stats.weekly}'
                                            </span>
                                            <span className="text-xs text-muted-foreground uppercase">Semanal</span>
                                        </div>
                                        <div className="h-[180px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Tiempo', value: stats.weekly },
                                                            { name: 'Restante', value: Math.max(0, 60 - stats.weekly) }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        startAngle={180}
                                                        endAngle={0}
                                                        paddingAngle={0}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        <Cell fill={stats.weekly > 45 ? "#ef4444" : "#10b981"} />
                                                        <Cell fill="#e5e7eb" />
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Monthly Donut */}
                                    <div className="flex flex-col items-center justify-center relative">
                                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                            <span className={`text-3xl font-bold ${stats.monthly > 45 ? "text-red-500" : "text-emerald-500"}`}>
                                                {stats.monthly}'
                                            </span>
                                            <span className="text-xs text-muted-foreground uppercase">Mensual</span>
                                        </div>
                                        <div className="h-[180px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Tiempo', value: stats.monthly },
                                                            { name: 'Restante', value: Math.max(0, 60 - stats.monthly) }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        startAngle={180}
                                                        endAngle={0}
                                                        paddingAngle={0}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        <Cell fill={stats.monthly > 45 ? "#ef4444" : "#10b981"} />
                                                        <Cell fill="#e5e7eb" />
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    // FULLSCREEN LAYOUT
    return (
        <div className="h-full flex flex-col gap-6 p-2">
            {/* Top Header */}
            <div className="flex items-center justify-between shrink-0 bg-card p-4 rounded-xl border border-border shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        Tablero de Control de Materiales
                        <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">EN VIVO</span>
                    </h1>
                    <p className="text-muted-foreground">Información en tiempo real para cambios de molde</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <div className="text-3xl font-bold font-mono tracking-tight">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-sm text-muted-foreground uppercase font-medium">{new Date().toLocaleDateString("es-MX", { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportToExcel} className="gap-2 h-12 px-6 text-lg">
                            <Download className="h-5 w-5" /> Exportar
                        </Button>
                        {onToggleFullscreen && (
                            <Button variant="default" onClick={onToggleFullscreen} className="gap-2 h-12 px-6 text-lg">
                                <Minimize2 className="h-5 w-5" /> Salir
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Hero Section: NEXT CHANGE */}
            <div className="shrink-0">
                <CountdownDisplay nextChange={nextChange} large onComplete={handleNextChangeComplete} />
            </div>

            {/* Split Content: Schedule vs History */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">

                {/* Left: Upcoming Schedule */}
                <Card className="flex flex-col border-0 shadow-lg bg-card/50 h-full overflow-hidden ring-1 ring-border/50">
                    <CardHeader className="bg-secondary/20 pb-4 border-b">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <CalendarClock className="h-6 w-6 text-primary" />
                            Agenda Semanal (Próximos 7 días)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-4 space-y-3 custom-scrollbar">
                        {upcoming7Days.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                <CalendarClock className="h-16 w-16 mb-4" />
                                <p className="text-lg font-medium">No hay cambios programados para esta semana</p>
                            </div>
                        ) : (
                            upcoming7Days.map(s => {
                                const isEditing = editingId === s.id
                                return (
                                    <div key={s.id} className="flex items-center gap-5 p-5 bg-background rounded-xl border border-border/60 shadow-sm hover:shadow-md transition-all hover:border-primary/20">
                                        <div className="flex flex-col items-center justify-center bg-primary/5 text-primary h-20 w-20 rounded-xl shrink-0 border border-primary/10">
                                            <span className="text-xs font-bold uppercase tracking-wider">{new Date(s.date).toLocaleDateString("es-MX", { weekday: 'short' })}</span>
                                            <span className="text-3xl font-bold leading-none">{new Date(s.date).getDate()}</span>
                                            <span className="text-[10px] opacity-70 uppercase">{new Date(s.date).toLocaleDateString("es-MX", { month: 'short' })}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-bold text-2xl truncate text-foreground">{s.moldId}</h4>
                                                    {s.linea && (
                                                        <span className="text-xs font-bold bg-secondary px-2 py-0.5 rounded border border-border">{s.linea}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="time"
                                                                className="h-10 w-32 text-lg font-mono font-bold"
                                                                value={editTime}
                                                                onChange={e => setEditTime(e.target.value)}
                                                            />
                                                            <Button size="icon" className="h-10 w-10 text-emerald-500 hover:text-emerald-600 bg-emerald-500/10" onClick={() => handleSaveEdit(s.id)}>
                                                                <Check className="h-5 w-5" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground" onClick={() => setEditingId(null)}>
                                                                <X className="h-5 w-5" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-secondary px-3 py-1 rounded-lg border border-border">
                                                                <span className="font-mono font-bold text-lg">
                                                                    {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleStartEdit(s.id, s.date)}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeSchedule(s.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-base text-muted-foreground truncate">{s.description || "Sin descripción adicional"}</p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </CardContent>
                </Card>

                {/* Right: History List (Last Month) */}
                <Card className="flex flex-col border-0 shadow-lg bg-card/50 h-full overflow-hidden ring-1 ring-border/50">
                    <CardHeader className="bg-secondary/20 pb-4 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <History className="h-6 w-6 text-primary" />
                                Historial Reciente (30 días)
                            </CardTitle>
                            <div className="flex gap-4 text-sm font-medium bg-background/50 px-3 py-1.5 rounded-lg border">
                                <span className="text-muted-foreground">Promedio Mes: <span className="text-foreground font-bold">{stats.monthly} min</span></span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0 custom-scrollbar">
                        <div className="divide-y divide-border/60">
                            {historyLast30.length === 0 ? (
                                <div className="h-40 flex items-center justify-center text-muted-foreground opacity-50">
                                    <p className="text-lg">No hay registros recientes.</p>
                                </div>
                            ) : (
                                historyLast30.map(change => (
                                    <div key={change.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-bold text-lg text-foreground">{change.moldeNuevo}</span>
                                                <span className="text-muted-foreground text-sm">reemplazó a {change.moldeAnterior}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                                                <span className="bg-secondary px-2 py-0.5 rounded border border-border/50">
                                                    {new Date(change.fechaInicio).toLocaleDateString("es-MX", { day: 'numeric', month: 'short' })}
                                                </span>
                                                <span>•</span>
                                                <span>{change.turno}</span>
                                                <span>•</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${change.linea.includes('TB') ? 'bg-blue-500/10 text-blue-600' : 'bg-orange-500/10 text-orange-600'}`}>
                                                    {change.linea}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="font-bold font-mono text-2xl tabular-nums">{change.tiempoMuerto} <span className="text-sm font-sans font-normal text-muted-foreground">min</span></div>
                                            </div>
                                            <div className={`h-3 w-3 rounded-full shadow-sm ring-2 ring-background ${change.tiempoMuerto > 45 ? "bg-red-500" : "bg-emerald-500"}`} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
