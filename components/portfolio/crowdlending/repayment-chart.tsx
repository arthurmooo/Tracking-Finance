"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

interface RepaymentData {
    month: string
    amount: number
}

interface RepaymentChartProps {
    data: RepaymentData[]
}

export function RepaymentChart({ data }: RepaymentChartProps) {
    return (
        <Card className="bg-card/50 border-sidebar-border backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg font-medium">Projections des Versements (12 mois)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis
                                dataKey="month"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `€${value}`}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const amount = typeof payload[0].value === 'number'
                                            ? payload[0].value.toFixed(1)
                                            : payload[0].value
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <span className="font-medium uppercase text-muted-foreground">
                                                        Mois
                                                    </span>
                                                    <span className="font-bold text-foreground">
                                                        {payload[0].payload.month}
                                                    </span>
                                                    <span className="font-medium uppercase text-muted-foreground">
                                                        Montant
                                                    </span>
                                                    <span className="font-bold text-emerald-500">
                                                        €{amount}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar
                                dataKey="amount"
                                radius={[4, 4, 0, 0]}
                                className="fill-primary/60"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        className={index === 0 ? "fill-primary" : "fill-primary/60"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
