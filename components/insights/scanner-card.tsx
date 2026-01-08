"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Area, AreaChart, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"

interface ScannerCardProps {
    title: string
    score?: string
    metric?: string
    status: "Great" | "Good" | "Average" | "Insufficient" | "Advanced"
    data?: any[]
    color?: string
    type?: "area" | "donut"
}

// Fixed colors for diversification
const COLORS = ['#3b82f6', '#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ScannerCard({ title, score, metric, status, data, color = "#10b981", type = "area" }: ScannerCardProps) {
    const getStatusColor = (s: string) => {
        switch (s) {
            case "Great": return "text-emerald-500 bg-emerald-500/10"
            case "Good": return "text-blue-500 bg-blue-500/10"
            case "Advanced": return "text-purple-500 bg-purple-500/10"
            case "Average": return "text-yellow-500 bg-yellow-500/10"
            case "Insufficient": return "text-red-500 bg-red-500/10"
            default: return "text-gray-500 bg-gray-500/10"
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{status}</span>
                            {score && <Badge variant="secondary" className={getStatusColor(status)}>{score}</Badge>}
                        </div>
                        <div className="text-2xl font-bold">{metric}</div>
                    </div>
                </div>

                <div className="h-[80px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {type === 'donut' ? (
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="100%"
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {data?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: number) => `€${Math.round(value).toLocaleString()}`}
                                />
                            </PieChart>
                        ) : (
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={color}
                                    fillOpacity={1}
                                    fill={`url(#gradient-${title})`}
                                />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
