"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export interface Project {
    id: string
    investedAmount: number
    interestRate: number
    mensualite: number
    startDate: string
    durationMonths: number
    status: 'ACTIVE' | 'COMPLETED' | 'LATE'
}

interface RepaymentChartProps {
    projects: Project[]
}

type ViewMode = 'monthly' | 'quarterly' | 'yearly'

export function RepaymentChart({ projects }: RepaymentChartProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('monthly')

    const chartData = useMemo(() => {
        const now = new Date()
        // Reset to start of current month to be consistent
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        // Define horizon based on view mode
        let monthsToProject = 12
        if (viewMode === 'quarterly') monthsToProject = 24 // 2 years
        if (viewMode === 'yearly') monthsToProject = 60 // 5 years

        const dataPoints: Record<string, number> = {}
        const labels: Record<string, string> = {}
        const keys: string[] = []

        // 1. Initialize buckets
        for (let i = 0; i < monthsToProject; i++) {
            const d = new Date(startOfCurrentMonth.getFullYear(), startOfCurrentMonth.getMonth() + i, 1)
            let key = ""
            let label = ""

            if (viewMode === 'monthly') {
                key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                label = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
            } else if (viewMode === 'quarterly') {
                const q = Math.floor(d.getMonth() / 3) + 1
                key = `${d.getFullYear()}-Q${q}`
                label = `T${q} ${d.getFullYear()}`
            } else {
                key = `${d.getFullYear()}`
                label = `${d.getFullYear()}`
            }

            if (!dataPoints[key]) {
                dataPoints[key] = 0
                labels[key] = label
                keys.push(key)
            }
        }

        // 2. Fill buckets with project payments
        projects.filter(p => p.status === 'ACTIVE').forEach(p => {
            // Calculate monthly net payment
            const grossMonthly = p.mensualite > 0
                ? p.mensualite
                : (p.investedAmount * (p.interestRate / 100) / 12)
            const netMonthly = grossMonthly * 0.7

            // Determine project end date
            // Handle various date formats if necessary, but assuming ISO or standard parsable from page.tsx props
            // Actually page.tsx produces normalized ISO string or parsable format for startDate
            const startDate = new Date(p.startDate)
            const endDate = new Date(startDate)
            endDate.setMonth(endDate.getMonth() + p.durationMonths)

            // Iterate through projection months
            for (let i = 0; i < monthsToProject; i++) {
                const d = new Date(startOfCurrentMonth.getFullYear(), startOfCurrentMonth.getMonth() + i, 1)

                // If this projection month is within project lifespan
                // We check if "d" is >= startDate AND "d" < endDate
                // (Simple logic: if the project is active in this month, it pays)
                if (d >= startDate && d < endDate) {
                    let key = ""
                    if (viewMode === 'monthly') {
                        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                    } else if (viewMode === 'quarterly') {
                        const q = Math.floor(d.getMonth() / 3) + 1
                        key = `${d.getFullYear()}-Q${q}`
                    } else {
                        key = `${d.getFullYear()}`
                    }

                    if (dataPoints[key] !== undefined) {
                        dataPoints[key] += netMonthly
                    }
                }
            }
        })

        // 3. Convert to array
        // We use 'keys' array to ensure chronological order
        // Remove duplicates from keys which were added sequentially
        const uniqueKeys = Array.from(new Set(keys))

        return uniqueKeys.map(key => ({
            period: labels[key],
            amount: dataPoints[key]
        }))

    }, [projects, viewMode])

    return (
        <Card className="bg-card/50 border-sidebar-border backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Projections des Versements</CardTitle>
                <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue placeholder="Vue" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="monthly">Mensuel</SelectItem>
                        <SelectItem value="quarterly">Trimestriel</SelectItem>
                        <SelectItem value="yearly">Annuel</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis
                                dataKey="period"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `€${Math.round(value)}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const amount = typeof payload[0].value === 'number'
                                            ? payload[0].value.toFixed(2)
                                            : payload[0].value
                                        return (
                                            <div className="rounded-lg border bg-background p-2.5 shadow-xl text-xs">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="font-medium uppercase text-muted-foreground text-[10px]">
                                                        {payload[0].payload.period}
                                                    </span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="font-bold text-lg text-emerald-500">
                                                            €{amount}
                                                        </span>
                                                        <span className="text-muted-foreground text-[10px]">
                                                            net estimé
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar
                                dataKey="amount"
                                radius={[4, 4, 0, 0]}
                                className="fill-emerald-500/80 hover:fill-emerald-500 transition-colors"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
