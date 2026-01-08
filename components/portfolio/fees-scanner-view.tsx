"use client"

import { Card } from "@/components/ui/card"
import { ArrowLeft, Check, Info, RefreshCw, Eye, Plus, MoreHorizontal, Zap } from "lucide-react"
import Link from "next/link"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface AssetFeeDetails {
    id: string
    name: string
    type: string
    value: number
    feePercent: number
    feeAmount: number
    currency: string
}

interface FeesScannerViewProps {
    totalFees: number
    feePercent: number
    cumulativeFees30y: number
    cumulativeFeesPercent30y: number
    assets: AssetFeeDetails[]
    savingsPotential: number
}

export function FeesScannerView({
    totalFees,
    feePercent,
    cumulativeFees30y,
    cumulativeFeesPercent30y,
    assets,
    savingsPotential
}: FeesScannerViewProps) {

    // Generate chart data simulating 30 years growth
    // Curve 1: With current fees (assume 7% gross return)
    // Curve 2: With low fees (0.2%)
    const chartData = []
    const startValue = 100000 // Base for simulation or use actual portfolio total
    const grossReturn = 0.07 // 7%
    const currentFeeRate = feePercent / 100
    const optimizedFeeRate = 0.002 // 0.2%

    let currentVal = startValue
    let optimizedVal = startValue

    const currentYear = new Date().getFullYear()

    for (let i = 0; i <= 30; i++) {
        chartData.push({
            year: currentYear + i,
            current: Math.round(currentVal),
            optimized: Math.round(optimizedVal),
            gap: Math.round(optimizedVal - currentVal)
        })

        currentVal = currentVal * (1 + grossReturn - currentFeeRate)
        optimizedVal = optimizedVal * (1 + grossReturn - optimizedFeeRate)
    }

    return (
        <div className="flex flex-col space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/portfolio/stocks-funds" className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-2xl font-bold">Frais d'investissement</h1>
            </div>

            {/* Explanation */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Comment ça marche ?</span>
                <span className="text-primary hover:underline cursor-pointer">Plus d'informations</span>
                <Info className="h-4 w-4" />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-card border-border relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                        <span className="text-sm font-medium">Frais annuels</span>
                        <Info className="h-4 w-4" />
                    </div>
                    <div className="flex items-baseline gap-4">
                        <span className="text-4xl font-bold">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalFees)}
                        </span>
                        <span className="text-2xl text-muted-foreground">
                            {feePercent.toFixed(2)} %
                        </span>
                    </div>
                </Card>

                <Card className="p-6 bg-card border-border relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                        <span className="text-sm font-medium">Frais cumulés (30 ans)</span>
                        <Info className="h-4 w-4" />
                    </div>
                    <div className="flex items-baseline gap-4">
                        <span className="text-4xl font-bold">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(cumulativeFees30y)}
                        </span>
                        <span className="text-2xl text-muted-foreground">
                            {cumulativeFeesPercent30y.toFixed(2)} %
                        </span>
                    </div>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Chart Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <span className="text-sm">Impact des frais sur votre performance</span>
                        <Info className="h-4 w-4" />
                    </div>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d4a373" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#d4a373" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#888888" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#888888" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="year"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: 'var(--muted-foreground)' }}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value / 1000}k €`}
                                    tick={{ fill: 'var(--muted-foreground)' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: '8px' }}
                                    formatter={(value: any) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)}
                                    itemStyle={{ color: 'var(--popover-foreground)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="optimized"
                                    stroke="#d4a373"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorOptimized)"
                                    name="Fees Optimized (0.2%)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="current"
                                    stroke="#888888"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorCurrent)"
                                    name="Current Scenario"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Assets List Section */}
                <Card className="bg-card border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                                </div>
                                <span className="font-medium">PEA</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="bg-secondary/20 hover:bg-secondary/40 text-xs h-7">Fonds</Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs h-7">SCPI</Button>
                        </div>
                    </div>

                    <div className="p-0">
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-muted-foreground border-b border-border/50">
                            <div className="col-span-6">Nom</div>
                            <div className="col-span-2 text-right">Type</div>
                            <div className="col-span-2 text-right">Frais/an (%)</div>
                            <div className="col-span-2 text-right">Valeur</div>
                        </div>

                        <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
                            {assets.map((asset) => (
                                <div key={asset.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-secondary/10 transition-colors">
                                    <div className="col-span-6 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm truncate">{asset.name}</span>
                                            {asset.feePercent > 1.5 ? (
                                                <div className="w-4 h-4 rounded-full border border-rose-500/50 flex items-center justify-center text-rose-500">
                                                    <Zap className="h-2.5 w-2.5" />
                                                </div>
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border border-emerald-500/50 flex items-center justify-center text-emerald-500">
                                                    <Check className="h-2.5 w-2.5" />
                                                </div>
                                            )}
                                        </div>
                                        {asset.feePercent > 1.5 && (
                                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20 px-1.5 py-0 h-5 font-normal rounded-sm flex w-fit items-center gap-1">
                                                <Zap className="h-3 w-3" />
                                                ÉCONOMIES DÉTECTÉES
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="col-span-2 text-right text-sm text-muted-foreground">
                                        {asset.type}
                                    </div>
                                    <div className={`col-span-2 text-right text-sm font-medium ${asset.feePercent > 1.5 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {asset.feePercent.toFixed(2)} %
                                    </div>
                                    <div className="col-span-2 text-right text-sm text-foreground">
                                        {Math.round(asset.value).toLocaleString('fr-FR')} €
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-border bg-secondary/5 flex justify-between items-center text-sm font-medium">
                            <span className="text-muted-foreground">Total</span>
                            <div className="flex gap-8">
                                <span className={feePercent > 1 ? 'text-rose-500' : 'text-emerald-500'}>
                                    {feePercent.toFixed(2)} %
                                </span>
                                <span>
                                    {Math.round(assets.reduce((sum, a) => sum + a.value, 0)).toLocaleString('fr-FR')} €
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
