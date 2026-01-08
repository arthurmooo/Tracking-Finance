"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from "recharts"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PassiveIncomeCardProps {
    yieldPercent: number
    projectedAmount: number
}

export function PassiveIncomeCard({ yieldPercent, projectedAmount }: PassiveIncomeCardProps) {
    // Generate mock monthly bars that look more regular for passive income (dividends/interest usually stable or growing)
    const data = Array.from({ length: 12 }, (_, i) => ({
        month: i,
        // Create a slight upward trend or steady flow, not random noise
        value: (projectedAmount / 12) * (1 + (i * 0.02))
    }))

    return (
        <Card className="bg-sidebar border-sidebar-border shadow-sm flex flex-col justify-between h-full hover:bg-sidebar/80 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    Passive income
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-popover border-border text-popover-foreground text-xs">
                                <p>Includes estimated Dividends (based on current yield) <br /> + Projected Crowdlending Interest</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between gap-4">
                    <div className="flex flex-col gap-1 pb-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm text-green-500 font-medium">
                                {yieldPercent.toFixed(2)}%
                            </span>
                            <span className="text-xs text-muted-foreground">yield</span>
                        </div>
                        <div className="text-2xl font-bold tracking-tight">€{projectedAmount.toLocaleString()}</div>
                        <span className="text-xs text-muted-foreground">Projected /yr</span>
                    </div>
                    <div className="h-[60px] w-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} barGap={2}>
                                <RechartsTooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '4px', fontSize: '12px' }}
                                    formatter={(value: any) => [`€${Number(value).toFixed(0)}`, '']}
                                    labelFormatter={() => ''}
                                />
                                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#3b82f6" fillOpacity={0.6 + (index / 12) * 0.4} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
