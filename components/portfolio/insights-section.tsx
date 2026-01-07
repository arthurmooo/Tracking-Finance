"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export function InsightsSection() {
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
                            <span className="text-2xl font-semibold">Great</span>
                            <span className="bg-emerald-500/10 text-emerald-500 text-xs px-1.5 py-0.5 rounded">
                                0.41%
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">/year</p>
                    </div>
                    <div>
                        <div className="text-xl font-medium">€4,412</div>
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
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">57%</span>
                                <span>United States</span>
                            </div>
                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="w-[57%] h-full bg-amber-200/80 rounded-full" />
                            </div>
                        </div>
                        {/* Revealed content */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">15%</span>
                                <span>Europe</span>
                            </div>
                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="w-[15%] h-full bg-amber-200/50 rounded-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">10%</span>
                                <span>Asia</span>
                            </div>
                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="w-[10%] h-full bg-amber-200/40 rounded-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">5%</span>
                                <span>Other</span>
                            </div>
                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="w-[5%] h-full bg-amber-200/30 rounded-full" />
                            </div>
                        </div>
                    </div>
                </Card>


                {/* Dividend Tracker Card */}
                <Card className="p-6 bg-card border-border relative overflow-hidden">

                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-6">
                        Dividend Tracker
                    </h4>

                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <div className="text-2xl font-semibold">2.65%</div>
                            <div className="text-sm text-muted-foreground">Yield</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-medium">€328</div>
                            <div className="text-xs text-muted-foreground">Projected (12 months)</div>
                        </div>
                    </div>

                    {/* Tiny Bar Chart Visualization */}
                    <div className="flex items-end justify-between h-12 gap-1">
                        {[40, 30, 60, 45, 80, 55, 70, 40, 60, 50, 90, 60].map((h, i) => (
                            <div key={i} className="w-full bg-muted-foreground/30 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                    </div>

                </Card>
            </div>
        </div >
    )
}
