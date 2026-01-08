"use client"

import Link from "next/link"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { PassiveIncomeDetails } from "./passive-income-details"

interface GeographicBreakdownItem {
    region: string
    percent: number
}

interface InsightsSectionProps {
    feePercent: number
    potentialSavings: number
    feeStatus: 'Great' | 'Good' | 'Average' | 'Insufficient'
    dividendYield: number
    projected12mDividends: number
    geographicBreakdown: GeographicBreakdownItem[]
    // New props supported by getInsightsData
    sectorBreakdown?: any[]
    sectorScore?: number
    sectorStatus?: string
    geoScore?: number
    geoStatus?: string
    // Real passive income data
    monthlyPassiveIncome?: any[]
    passiveIncomeTransactions?: any[]
    upcomingTransactions?: any[]
}

export function InsightsSection({
    feePercent,
    potentialSavings,
    feeStatus,
    dividendYield,
    projected12mDividends,
    geographicBreakdown,
    sectorBreakdown = [],
    sectorScore = 0,
    sectorStatus = 'Average',
    geoScore = 0,
    geoStatus = 'Average',
    monthlyPassiveIncome = [],
    passiveIncomeTransactions = [],
    upcomingTransactions = []
}: InsightsSectionProps) {
    // Sort and take top 4 regions for display
    const topRegions = geographicBreakdown.slice(0, 4)
    const [isPassiveIncomeOpen, setIsPassiveIncomeOpen] = useState(false)

    // Remap status to colors
    const feeStatusColor = feeStatus === 'Great' ? 'bg-emerald-500/10 text-emerald-500' :
        feeStatus === 'Good' ? 'bg-emerald-500/10 text-emerald-500' :
            feeStatus === 'Average' ? 'bg-amber-500/10 text-amber-500' :
                'bg-red-500/10 text-red-500'

    return (
        <div className="space-y-4 pt-4">
            <h3 className="text-xl font-medium">Insights</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/portfolio/stocks-funds/fees/scanner" className="block transition-transform hover:scale-[1.02]">
                    <Card className="p-6 bg-card border-border relative overflow-hidden group h-full cursor-pointer hover:border-primary/50 transition-colors">
                        <div className="mb-6">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                                Fee Scanner
                            </h4>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-2xl font-semibold">{feeStatus}</span>
                                <span className={`${feeStatusColor} text-xs px-1.5 py-0.5 rounded`}>
                                    {feePercent.toFixed(2)}%
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">/year</p>
                        </div>
                        <div>
                            <div className="text-xl font-medium">
                                €{potentialSavings.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                            </div>
                            <p className="text-sm text-muted-foreground">Potential savings</p>
                        </div>
                        {/* Decorative Graph Line */}
                        <div className="absolute bottom-0 right-0 w-32 h-16 opacity-20">
                            <svg viewBox="0 0 100 50" className="w-full h-full fill-none stroke-foreground">
                                <path d="M0 50 L 50 20 L 100 0" strokeWidth="2" />
                            </svg>
                        </div>
                    </Card>
                </Link>

                {/* Diversification Card - Redesigned */}
                <Card className="p-6 bg-card border-border relative overflow-hidden">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                        Diversification
                    </h4>

                    {/* Score Indicators */}
                    <div className="flex items-center justify-around mb-4">
                        <div className="flex flex-col items-center">
                            <div className="relative w-16 h-16">
                                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                                    <circle
                                        cx="18" cy="18" r="15.5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        className="text-muted-foreground/20"
                                    />
                                    <circle
                                        cx="18" cy="18" r="15.5"
                                        fill="none"
                                        stroke="url(#sectorGradient)"
                                        strokeWidth="3"
                                        strokeDasharray={`${(sectorScore / 10) * 97.4} 97.4`}
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="sectorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-semibold">{sectorScore}</span>
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">Sector</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="relative w-16 h-16">
                                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                                    <circle
                                        cx="18" cy="18" r="15.5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        className="text-muted-foreground/20"
                                    />
                                    <circle
                                        cx="18" cy="18" r="15.5"
                                        fill="none"
                                        stroke="url(#geoGradient)"
                                        strokeWidth="3"
                                        strokeDasharray={`${(geoScore / 10) * 97.4} 97.4`}
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="geoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#06b6d4" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-semibold">{geoScore}</span>
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">Geographic</span>
                        </div>
                    </div>

                    {/* Region Breakdown List with Progress Bars */}
                    <div className="space-y-2.5">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Top Regions</div>
                        {topRegions.length > 0 ? topRegions.map((item, index) => {
                            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
                            return (
                                <div key={item.region} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: colors[index % colors.length] }}
                                            />
                                            <span className="text-foreground/80">{item.region}</span>
                                        </div>
                                        <span className="font-medium">{item.percent}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted-foreground/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${item.percent}%`,
                                                backgroundColor: colors[index % colors.length]
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        }) : (
                            <div className="text-sm text-muted-foreground">No data available</div>
                        )}
                    </div>
                </Card>

                {/* Dividend Tracker Card */}
                <div onClick={() => setIsPassiveIncomeOpen(true)} className="cursor-pointer transition-transform hover:scale-[1.02]">
                    <Card className="p-6 bg-card border-border relative overflow-hidden h-full hover:border-primary/50 transition-colors">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-6">
                            Dividend Tracker
                        </h4>

                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <div className="text-2xl font-semibold">
                                    {dividendYield > 0 ? `${dividendYield.toFixed(2)}%` : 'N/A'}
                                </div>
                                <div className="text-sm text-muted-foreground">Yield</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-medium">
                                    €{projected12mDividends.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                                </div>
                                <div className="text-xs text-muted-foreground">Projected (12 months)</div>
                            </div>
                        </div>

                        {/* Tiny Bar Chart Visualization - dynamic based on monthly estimate */}
                        <div className="flex items-end justify-between h-12 gap-1">
                            {Array.from({ length: 12 }, (_, i) => {
                                const monthlyBase = projected12mDividends / 12
                                // Add some visual variation
                                const variation = 0.5 + Math.sin(i * 0.7) * 0.5
                                const height = monthlyBase > 0 ? 30 + (variation * 60) : 20
                                return (
                                    <div
                                        key={i}
                                        className="w-full bg-muted-foreground/30 rounded-t-sm"
                                        style={{ height: `${height}%` }}
                                    />
                                )
                            })}
                        </div>
                    </Card>
                </div>
            </div>

            <PassiveIncomeDetails
                isOpen={isPassiveIncomeOpen}
                onOpenChange={setIsPassiveIncomeOpen}
                dividendYield={dividendYield}
                totalDividends={projected12mDividends}
                monthlyData={monthlyPassiveIncome}
                transactions={passiveIncomeTransactions}
                upcomingTransactions={upcomingTransactions}
            />
        </div>
    )
}
