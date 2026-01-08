"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PassiveIncomeCardProps {
    yieldPercent: number
    projectedAmount: number
}

export function PassiveIncomeCard({ yieldPercent, projectedAmount }: PassiveIncomeCardProps) {
    // Generate mock monthly bars for visual effect based on projected amount
    const data = Array.from({ length: 12 }, (_, i) => ({
        value: projectedAmount / 12 * (0.8 + Math.random() * 0.4) // Random variation around average
    }))

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    Passive income
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Includes estimated Dividends (based on current yield) <br /> + Projected Crowdlending Interest (Net 30%)</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{yieldPercent.toFixed(2)}%</span>
                            <span className="text-xs text-muted-foreground">Yield (avg)</span>
                        </div>
                        <div className="text-2xl font-bold">€{projectedAmount.toLocaleString()}</div>
                        <span className="text-xs text-muted-foreground">Projected (12 months)</span>
                    </div>
                    <div className="h-[60px] w-[100px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
