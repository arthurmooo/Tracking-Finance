"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts"
import { useEffect, useState } from "react"

interface DashboardChartsProps {
    snapshots: { date: string; netWorth: number }[]
    assets: { name: string; type: string; value: number }[]
}

export function DashboardCharts({ snapshots, assets }: DashboardChartsProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Prepare Allocation Data
    const allocation = assets.reduce((acc, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + asset.value
        return acc
    }, {} as Record<string, number>)

    const allocationData = Object.entries(allocation).map(([name, value]) => ({ name, value }))
    const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)']

    if (!mounted) {
        return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 h-[300px] bg-muted/5 animate-pulse rounded-lg" />
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Main Chart */}
            <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-sidebar-border shadow-none">
                <CardHeader>
                    <CardTitle>Net Worth Evolution</CardTitle>
                    <CardDescription>Your wealth growth over time.</CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={snapshots}>
                                <defs>
                                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
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
                                    tickFormatter={(value) => `€${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="netWorth"
                                    stroke="var(--chart-1)"
                                    fillOpacity={1}
                                    fill="url(#colorNetWorth)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Allocation Chart */}
            <Card className="col-span-3 bg-card/50 backdrop-blur-sm border-sidebar-border shadow-none">
                <CardHeader>
                    <CardTitle>Asset Allocation</CardTitle>
                    <CardDescription>Distribution by asset class.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={allocationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {allocationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                    formatter={(value: number | string | undefined) => value !== undefined ? `€${Number(value).toLocaleString()}` : ''}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 text-xs mt-4">
                        {allocationData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-muted-foreground capitalize">{entry.name.toLowerCase()}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
