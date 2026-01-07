"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

interface ScannerCardProps {
    title: string
    score: string
    scoreLabel: string
    metric: string
    metricLabel: string
    status: "Great" | "Good" | "Average" | "Insufficient" | "Advanced"
    data: { value: number }[]
    color?: string
}

export function ScannerCard({ title, score, scoreLabel, metric, metricLabel, status, data, color = "#22c55e" }: ScannerCardProps) {
    return (
        <Card className="bg-card/50 backdrop-blur-sm border-sidebar-border shadow-none overflow-hidden relative">

            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xl font-bold">{status}</span>
                            <Badge variant="outline" className={`${status === 'Great' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                status === 'Advanced' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                } text-[10px] px-1.5 py-0 pointer-events-none`}>{score}</Badge>
                        </div>
                        <div className="text-2xl font-bold mb-1">{metric}</div>
                        <div className="text-xs text-muted-foreground">{metricLabel}</div>
                    </div>
                    <div className="h-[60px] w-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={color}
                                    strokeWidth={2}
                                    fill={`url(#grad-${title})`}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
