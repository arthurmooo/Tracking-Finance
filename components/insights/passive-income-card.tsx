"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, ResponsiveContainer, Cell } from "recharts"

interface PassiveIncomeCardProps {
    yieldVal: string
    projectedAmount: number
    data: { value: number }[]
}

export function PassiveIncomeCard({ yieldVal, projectedAmount, data }: PassiveIncomeCardProps) {
    return (
        <Card className="bg-card/50 backdrop-blur-sm border-sidebar-border shadow-none overflow-hidden relative">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Passive income</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-2xl font-bold mb-1">{yieldVal}</div>
                        <div className="text-xs text-muted-foreground mb-4">Yield (avg)</div>

                        <div className="text-lg font-bold">
                            €{projectedAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-xs text-muted-foreground">Projected (12 months)</div>
                    </div>
                    <div className="h-[80px] w-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#3f3f46" />
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
