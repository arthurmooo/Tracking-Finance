"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Info, RotateCcw } from "lucide-react"
import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"



export function SimulationTool() {
    const [monthlySavings, setMonthlySavings] = useState(250)
    const [timePeriod, setTimePeriod] = useState(30)
    const [initialSavings] = useState(100000)
    const returnRate = 0.08

    const simulationData = React.useMemo(() => {
        return Array.from({ length: timePeriod }, (_, i) => {
            const year = 2024 + i
            // Base: Initial savings + monthly contributions without interest
            const baseline = initialSavings + (i * 12 * monthlySavings)

            // Compound: Future Value of Lump Sum + Future Value of Series
            // FV_lump = P * (1 + r)^n
            // FV_series = PMT * (((1 + r)^n - 1) / r) * (1+r) if (beginning of period) or without last (1+r) if end. 
            // The original code used: 100000 * Math.pow(1.08, i) + (250 * 12 * ((Math.pow(1.08, i) - 1) / 0.08))
            // This implies annual contribution of (250*12) added at end of year? 
            // Let's stick closer to a monthly compounding or simple annual approximation to match original logic.

            const compound = initialSavings * Math.pow(1 + returnRate, i) +
                (monthlySavings * 12 * ((Math.pow(1 + returnRate, i) - 1) / returnRate))

            return { year, baseline, compound }
        })
    }, [monthlySavings, timePeriod, initialSavings, returnRate])

    const finalData = simulationData[simulationData.length - 1]
    const totalSavings = finalData.baseline
    const futureWealth = finalData.compound
    const investmentReturn = futureWealth - totalSavings

    // Calculate annualized return (CAGR) roughly or just show the fixed rate
    // For "Annual return" metric in UI, it seems to imply the rate used.

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-EU', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(value)
    }

    return (
        <Card className="bg-card/50 backdrop-blur-sm border-sidebar-border shadow-none overflow-hidden relative col-span-2">


            <div className="flex flex-col lg:flex-row h-full">
                {/* Left: Chart */}
                <div className="flex-1 p-6 border-r border-sidebar-border/50">
                    <div className="mb-8">
                        <CardTitle className="text-xl mb-1">Portfolio simulation</CardTitle>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">My future wealth</div>
                        <div className="text-4xl font-bold">{formatCurrency(futureWealth)}</div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={simulationData}>
                                <defs>
                                    <linearGradient id="colorCompound" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="year"
                                    stroke="#52525b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                                    formatter={(value: number | undefined) => [value !== undefined ? formatCurrency(value) : '0', '']}
                                    labelFormatter={(label) => `Year ${label}`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="compound"
                                    name="Projected Wealth"
                                    stroke="#fbbf24"
                                    strokeWidth={2}
                                    fill="url(#colorCompound)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="baseline"
                                    name="Total Contributions"
                                    stroke="#52525b"
                                    strokeWidth={1}
                                    strokeDasharray="5 5"
                                    fill="transparent"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="p-4 rounded-lg bg-secondary/30">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                                Total savings <Info className="h-3 w-3" />
                            </div>
                            <div className="font-semibold text-sm">{formatCurrency(totalSavings)}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/30">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                                Investment return <Info className="h-3 w-3" />
                            </div>
                            <div className="font-semibold text-sm text-green-500">+{formatCurrency(investmentReturn)}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/30">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                                Contribution rate <Info className="h-3 w-3" />
                            </div>
                            <div className="font-semibold text-sm">{(monthlySavings * 12 / 1000).toFixed(1)}k/yr</div>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/30">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                                Annual return <Info className="h-3 w-3" />
                            </div>
                            <div className="font-semibold text-sm">{returnRate * 100}%</div>
                        </div>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="w-full lg:w-[350px] p-6 bg-card/30 flex flex-col justify-between">
                    <div>
                        <CardTitle className="mb-6">Edit your simulation</CardTitle>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                                    Monthly savings <Info className="h-3 w-3" />
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={monthlySavings}
                                        onChange={(e) => setMonthlySavings(Number(e.target.value))}
                                        className="bg-background/50 border-sidebar-border pr-12 font-mono text-lg"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">EUR</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                                    Time period
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[10, 20, 30].map((period) => (
                                        <Button
                                            key={period}
                                            variant={timePeriod === period ? "default" : "outline"}
                                            onClick={() => setTimePeriod(period)}
                                            className={timePeriod === period
                                                ? "text-xs h-9 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                                                : "text-xs h-9"}
                                        >
                                            {period} years
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className="p-4 rounded border border-sidebar-border bg-background/30 flex items-center justify-between cursor-pointer hover:bg-background/50 transition-colors">
                                        <span className="text-sm text-[#fbbf24]">Understand my simulation</span>
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Understanding Your Portfolio Simulation</DialogTitle>
                                        <DialogDescription className="space-y-4 pt-4">
                                            <p>
                                                This simulation shows the projected growth of your portfolio based on <strong>compound interest</strong> and regular monthly contributions.
                                            </p>
                                            <div>
                                                <strong>Key Assumptions:</strong>
                                                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                                    <li>Annual return rate: 8% (historical stock market average)</li>
                                                    <li>Monthly contributions are added at the end of each year</li>
                                                    <li>Returns are reinvested (no dividends withdrawn)</li>
                                                    <li>No taxes or fees are deducted in this projection</li>
                                                </ul>
                                            </div>
                                            <p>
                                                <strong>The yellow line</strong> shows your projected wealth with compound growth.
                                                <br />
                                                <strong>The dashed line</strong> shows what you would have if you just saved without investing.
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Note: Past performance does not guarantee future results. This is a simplified model for illustration purposes.
                                            </p>
                                        </DialogDescription>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <Button
                        onClick={() => {
                            setMonthlySavings(250)
                            setTimePeriod(30)
                        }}
                        className="w-full bg-[#fbbf24] text-black hover:bg-[#fbbf24]/90 mt-8 font-semibold"
                    >
                        Re-launch simulation
                    </Button>
                </div>
            </div>
        </Card>
    )
}
