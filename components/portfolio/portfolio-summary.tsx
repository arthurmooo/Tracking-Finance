"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChevronRight, Check } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type TimeTab = '1D' | '7D' | '1M' | 'YTD' | '1Y' | 'ALL'

interface CategoryData {
    id: string
    name: string
    totalValue: number
    percentage: number
    pnl: number
    pnlPercent: number
}

interface PortfolioSummaryProps {
    totalWorth: number
    snapshots: { date: string; value: number }[]
    ytdPnl: number
    ytdPnlPercent: number
    categories?: CategoryData[]
    className?: string
}

const categoryOptions = [
    { id: 'all', label: 'All categories' },
    { id: 'stocks', label: 'Stocks & Funds' },
    { id: 'crypto', label: 'Cryptos' },
    { id: 'cash', label: 'Checking accounts' },
    { id: 'real_estate', label: 'Real Estate' },
    { id: 'crowdfunding', label: 'Participatory Financing' },
]

function filterSnapshotsByRange(
    snapshots: { date: string; value: number }[],
    range: TimeTab,
    category: string = 'all',
    categoryData?: CategoryData[],
    totalWorth?: number
) {
    const currentYear = new Date().getFullYear().toString()

    // Calculate the ratio for the selected category based on real data
    let categoryRatio = 1
    if (category !== 'all' && categoryData && totalWorth && totalWorth > 0) {
        const selectedCat = categoryData.find(c => c.id === category)
        if (selectedCat) {
            categoryRatio = selectedCat.totalValue / totalWorth
        }
    }

    // Scale snapshots by the category ratio
    const processingSnapshots = snapshots.map((s) => ({
        ...s,
        value: s.value * categoryRatio
    }))

    let filtered = processingSnapshots

    switch (range) {
        case '1D':
            filtered = processingSnapshots.slice(-2)
            break
        case '7D':
            filtered = processingSnapshots.slice(-7)
            break
        case '1M':
            filtered = processingSnapshots.slice(-30)
            break
        case 'YTD':
            // Handle both ISO format (YYYY-MM-DD) and US locale format (MM/DD/YYYY)
            filtered = processingSnapshots.filter(s =>
                s.date.startsWith(currentYear) || // ISO format: 2026-01-07
                s.date.includes('/' + currentYear) || // US format: 01/07/2026
                s.date.endsWith('/' + currentYear) // Also catch edge cases
            )
            break
        case '1Y':
            filtered = processingSnapshots.slice(-365)
            break
        case 'ALL':
        default:
            filtered = processingSnapshots
            break
    }
    return filtered
}

interface TimeTabsProps {
    selected: TimeTab
    onSelect: (tab: TimeTab) => void
}

const TimeTabs = ({ selected, onSelect }: TimeTabsProps) => (
    <div className="flex bg-secondary/50 rounded-lg p-0.5">
        {(['1D', '7D', '1M', 'YTD', '1Y', 'ALL'] as TimeTab[]).map((tab) => (
            <button
                key={tab}
                onClick={() => onSelect(tab)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${tab === selected ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
                {tab}
            </button>
        ))}
    </div>
)

export function PortfolioSummary({ totalWorth, snapshots, ytdPnl, ytdPnlPercent, categories: categoryData, className }: PortfolioSummaryProps) {
    const [mounted, setMounted] = useState(false)
    const [selectedTab, setSelectedTab] = useState<TimeTab>('YTD')
    const [selectedCategory, setSelectedCategory] = useState('all')

    useEffect(() => {
        setMounted(true)
    }, [])

    // Get current category value for display
    const currentCategoryValue = useMemo(() => {
        if (selectedCategory === 'all' || !categoryData) return totalWorth
        const cat = categoryData.find(c => c.id === selectedCategory)
        return cat?.totalValue ?? totalWorth
    }, [selectedCategory, categoryData, totalWorth])

    const filteredSnapshots = useMemo(
        () => filterSnapshotsByRange(snapshots, selectedTab, selectedCategory, categoryData, totalWorth),
        [snapshots, selectedTab, selectedCategory, categoryData, totalWorth]
    )

    // Calculate P&L based on filtered data
    const startValue = filteredSnapshots.length > 0 ? filteredSnapshots[0].value : 0
    const endValue = filteredSnapshots.length > 0 ? filteredSnapshots[filteredSnapshots.length - 1].value : 0
    const displayPnl = selectedTab === 'YTD' ? ytdPnl : (endValue - startValue)
    const displayPnlPercent = selectedTab === 'YTD' ? ytdPnlPercent : (startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0)

    const selectedCategoryLabel = categoryOptions.find(c => c.id === selectedCategory)?.label || 'All categories'

    // Format current date
    const today = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    })

    if (!mounted) {
        return <div className={`grid gap-6 md:grid-cols-3 w-full h-[400px] bg-muted/5 animate-pulse rounded-lg ${className}`} />
    }

    return (
        <div className={`grid gap-6 md:grid-cols-3 w-full ${className}`}>
            {/* Total Worth Chart - Takes 2/3 of space */}
            <Card className="md:col-span-2 bg-card/50 backdrop-blur-xl border-border/50 shadow-sm flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-normal text-muted-foreground">Total Worth</CardTitle>
                    <div className="flex items-center gap-3">
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
                        <TimeTabs selected={selectedTab} onSelect={setSelectedTab} />
                    </div>
                </CardHeader>
                <CardContent className="pl-0 pb-0 pt-4 flex-1 flex flex-col">
                    <div className="px-6 flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground/60 font-medium">{today}</span>
                        <span className="text-5xl font-bold tracking-tight text-foreground">
                            {new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(currentCategoryValue)}
                        </span>
                    </div>
                    <div className="h-[280px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={filteredSnapshots} key={`${selectedTab}-${selectedCategory}`}>
                                <defs>
                                    <linearGradient id="colorWorth" x1="0" y1="0" x2="0" y2="1">
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
                                    minTickGap={50}
                                    tick={{ fill: 'var(--muted-foreground)' }}
                                    dy={10}
                                    tickFormatter={(value: string) => {
                                        const date = new Date(value)
                                        if (isNaN(date.getTime())) return value
                                        if (selectedTab === '1D') {
                                            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                        }
                                        if (selectedTab === '7D' || selectedTab === '1M') {
                                            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                                        }
                                        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                                    }}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value: number) =>
                                        new Intl.NumberFormat('fr-FR', {
                                            notation: 'compact',
                                            compactDisplay: 'short',
                                            style: 'currency',
                                            currency: 'EUR',
                                            maximumFractionDigits: 1
                                        }).format(value)
                                    }
                                    domain={['auto', 'auto']}
                                    tick={{ fill: 'var(--muted-foreground)' }}
                                    width={55}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--popover-foreground)' }}
                                    formatter={(value: number | string | undefined) => value !== undefined ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(Number(value)) : ''}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="var(--chart-1)"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorWorth)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Card - Takes 1/3 of space */}
            <Card className="md:col-span-1 bg-card/50 backdrop-blur-xl border-border/50 shadow-sm flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-normal text-muted-foreground">Performance</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 space-y-8 pt-6">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">
                            {selectedTab === 'YTD' ? 'Year to date' : selectedTab} P&L
                        </p>
                        <div className="flex items-center gap-3">
                            <span className={`text-3xl font-bold tracking-tight ${displayPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {displayPnl >= 0 ? '+' : ''}{new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(displayPnl)}
                            </span>
                            <span className={`px-2.5 py-1 rounded text-xs font-bold ${displayPnl >= 0 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>
                                {displayPnlPercent >= 0 ? '+' : ''}{displayPnlPercent.toFixed(2)}%
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Unrealized capital gain is the variation in your performance over the selected period. This amount does not include realized capital gains.
                    </p>

                    <div className="mt-auto">
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors group">
                                    See how it works <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>How Performance is Calculated</DialogTitle>
                                    <DialogDescription className="space-y-3 pt-4">
                                        <p>
                                            <strong>Unrealized P&L</strong> represents the difference between the current market value of your holdings and their original purchase price.
                                        </p>
                                        <p>
                                            This calculation does not include any assets you have sold (realized gains/losses), dividends received, or transaction fees.
                                        </p>
                                        <p>
                                            The percentage shown is relative to your initial investment in the selected time period.
                                        </p>
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
