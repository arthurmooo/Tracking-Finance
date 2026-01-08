"use client"

import { Card } from "@/components/ui/card"

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
}

export function InsightsSection({
    feePercent,
    potentialSavings,
    feeStatus,
    dividendYield,
    projected12mDividends,
    geographicBreakdown
}: InsightsSectionProps) {
    // Sort and take top 4 regions for display
    const topRegions = geographicBreakdown.slice(0, 4)

    // Remap status to colors
    const feeStatusColor = feeStatus === 'Great' ? 'bg-emerald-500/10 text-emerald-500' :
        feeStatus === 'Good' ? 'bg-emerald-500/10 text-emerald-500' :
            feeStatus === 'Average' ? 'bg-amber-500/10 text-amber-500' :
                'bg-red-500/10 text-red-500'

    return (
        <div className="space-y-4 pt-4">
            <h3 className="text-xl font-medium">Insights</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fee Scanner Card */}
                <Card className="p-6 bg-card border-border relative overflow-hidden group">
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

                {/* Diversification Card */}
                <Card className="p-6 bg-card border-border relative overflow-hidden">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-6">
                        Diversification
                    </h4>

                    <div className="space-y-4">
                        {topRegions.length > 0 ? topRegions.map((item, index) => (
                            <div key={item.region} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{item.percent}%</span>
                                    <span>{item.region}</span>
                                </div>
                                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-200/80 rounded-full"
                                        style={{
                                            width: `${item.percent}%`,
                                            opacity: 1 - (index * 0.2)
                                        }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground">No data available</p>
                        )}
                    </div>
                </Card>

                {/* Dividend Tracker Card */}
                <Card className="p-6 bg-card border-border relative overflow-hidden">
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
    )
}
