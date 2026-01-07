"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { ChevronRight, ChevronDown, Check } from "lucide-react"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Types matching the component logic
export interface Asset {
    id: string
    name: string
    symbol?: string
    isin?: string
    quantity: number
    price: number
    value: number
    portfolioId: string
    portfolioName?: string
    type: string // STOCK, ETF, CASH, etc.
}

export interface PortfolioGroup {
    id: string
    name: string
    totalValue: number
    pnl: number // This might need estimation if not provided directly
    pnlPercent: number
    assets: Asset[]
}

export interface AssetCategory {
    id: string
    name: string // "Stocks & Funds"
    totalValue: number
    percentage: number
    pnl: number
    pnlPercent: number
    portfolios: PortfolioGroup[]
}

interface AssetsBreakdownProps {
    categories: AssetCategory[]
}

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

type TimeRange = 'YTD' | '1M' | '3M' | '6M' | '1Y' | 'ALL'

const categoryOptions = [
    { id: 'all', label: 'All categories' },
    { id: 'stocks', label: 'Stocks & Funds' },
    { id: 'crypto', label: 'Cryptos' },
    { id: 'cash', label: 'Checking accounts' },
    { id: 'real_estate', label: 'Real Estate' },
]

const timeRangeOptions: { id: TimeRange; label: string }[] = [
    { id: 'YTD', label: 'Year to date' },
    { id: '1M', label: 'Last month' },
    { id: '3M', label: 'Last 3 months' },
    { id: '6M', label: 'Last 6 months' },
    { id: '1Y', label: 'Last year' },
    { id: 'ALL', label: 'All time' },
]

export function AssetsBreakdown({ categories }: AssetsBreakdownProps) {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('YTD')

    const toggleCategory = (id: string) => {
        setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }))
    }

    // Filter categories based on selection
    const filteredCategories = useMemo(() => {
        if (selectedCategory === 'all') return categories
        return categories.filter(c => c.id === selectedCategory)
    }, [categories, selectedCategory])

    const donutData = filteredCategories.map(c => ({
        name: c.name,
        value: c.totalValue
    })).filter(d => d.value > 0)

    const totalValue = filteredCategories.reduce((sum, c) => sum + c.totalValue, 0)

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)

    const selectedCategoryLabel = categoryOptions.find(c => c.id === selectedCategory)?.label || 'All categories'
    const selectedTimeRangeLabel = timeRangeOptions.find(t => t.id === selectedTimeRange)?.label || 'Year to date'

    return (
        <Card className="mt-6 bg-card/50 backdrop-blur-xl border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
                <CardTitle className="text-lg">Assets</CardTitle>
                <div className="flex gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-background hover:bg-secondary/50 transition-colors flex items-center gap-2">
                                {selectedCategoryLabel} <span className="text-[10px] text-muted-foreground">▼</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {categoryOptions.map((cat) => (
                                <DropdownMenuItem
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className="flex items-center justify-between"
                                >
                                    {cat.label}
                                    {selectedCategory === cat.id && <Check className="h-4 w-4 text-primary" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-background hover:bg-secondary/50 transition-colors flex items-center gap-2">
                                {selectedTimeRangeLabel} <span className="text-[10px] text-muted-foreground">▼</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {timeRangeOptions.map((range) => (
                                <DropdownMenuItem
                                    key={range.id}
                                    onClick={() => setSelectedTimeRange(range.id)}
                                    className="flex items-center justify-between"
                                >
                                    {range.label}
                                    {selectedTimeRange === range.id && <Check className="h-4 w-4 text-primary" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid md:grid-cols-3">
                    {/* Assets List */}
                    <div className="md:col-span-2 border-r border-border/50">
                        {/* List Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-muted-foreground border-b border-border/50 bg-secondary/10">
                            <div className="col-span-5">Name</div>
                            <div className="col-span-2 text-center">Split</div>
                            <div className="col-span-2 text-right">Value <span className="text-[10px]">▼</span></div>
                            <div className="col-span-3 text-right">{selectedTimeRange} P&L</div>
                        </div>

                        <div className="divide-y divide-border/50">
                            {filteredCategories.map((category) => (
                                <div key={category.id} className="group">
                                    {/* Category Row */}
                                    <div
                                        className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-secondary/20 transition-colors items-center cursor-pointer select-none"
                                        onClick={() => toggleCategory(category.id)}
                                    >
                                        <div className="col-span-5 flex items-center gap-3">
                                            <button className="text-muted-foreground hover:text-foreground">
                                                {expandedCategories[category.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            </button>
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[categories.indexOf(category) % COLORS.length] }} />
                                            <span className="font-medium text-sm">{category.name}</span>
                                        </div>
                                        <div className="col-span-2 text-center text-sm text-muted-foreground">
                                            {category.percentage}%
                                        </div>
                                        <div className="col-span-2 text-right text-sm font-medium">
                                            {formatCurrency(category.totalValue)}
                                        </div>
                                        <div className="col-span-3 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className={cn("text-sm font-medium", category.pnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                                    {category.pnl >= 0 ? "+" : ""}{formatCurrency(category.pnl)}
                                                </div>
                                                <div className={cn("text-[10px] font-bold px-1.5 rounded-sm mt-0.5", category.pnl >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
                                                    {category.pnl >= 0 ? "+" : ""}{category.pnlPercent.toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content (Portfolios) */}
                                    {expandedCategories[category.id] && (
                                        <div className="bg-background/50 divide-y divide-border/50 border-t border-border/50 shadow-inner">
                                            {category.portfolios.map(portfolio => (
                                                <div key={portfolio.id} className="grid grid-cols-12 gap-4 px-6 py-3 pl-14 hover:bg-secondary/20 transition-colors items-center text-sm">
                                                    <div className="col-span-5 flex items-center gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs shrink-0">
                                                            {portfolio.name.includes("PEA") ? "🔹" : "💰"}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{portfolio.name}</div>
                                                            {portfolio.name.includes("Arthur Mo") && <Badge variant="destructive" className="h-4 text-[9px] px-1 py-0 uppercase">Provider Error</Badge>}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 text-center text-muted-foreground text-xs">
                                                        {Math.round((portfolio.totalValue / totalValue) * 100)}%
                                                    </div>
                                                    <div className="col-span-2 text-right text-muted-foreground">
                                                        {formatCurrency(portfolio.totalValue)}
                                                    </div>
                                                    <div className="col-span-3 text-right">
                                                        <div className={cn("text-xs font-medium", portfolio.pnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                                            {portfolio.pnl >= 0 ? "+" : ""}{portfolio.pnlPercent.toFixed(2)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Allocation Donut */}
                    <div className="md:col-span-1 p-6 flex flex-col items-center justify-center min-h-[350px]">
                        <div className="w-full h-[300px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={donutData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={95}
                                        outerRadius={115}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={4}
                                    >
                                        {donutData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: '8px' }}
                                        itemStyle={{ color: 'var(--popover-foreground)' }}
                                        formatter={(value: number | string | undefined) => value !== undefined ? formatCurrency(Number(value)) : ''}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold tracking-tight">{formatCurrency(totalValue)}</span>
                                <span className="text-sm text-muted-foreground uppercase tracking-widest text-[10px] mt-1">Total</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
