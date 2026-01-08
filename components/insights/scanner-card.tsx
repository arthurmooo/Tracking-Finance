"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ScannerCardProps {
    title: string
    score?: string
    metric?: string
    status: "Great" | "Good" | "Average" | "Insufficient" | "Advanced"
    data?: any[]
    color?: string
    type?: "area" | "donut" // keeping type prop for compatibility but treating 'area' as 'fee-scanner' style
    icon?: React.ReactNode
}

// Fixed colors for diversification
const COLORS = ['#3b82f6', '#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ScannerCard({ title, score, metric, status, data, color = "#10b981", type = "area", icon }: ScannerCardProps) {
    const getStatusColor = (s: string) => {
        switch (s) {
            case "Great": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            case "Good": return "text-blue-500 bg-blue-500/10 border-blue-500/20"
            case "Advanced": return "text-purple-500 bg-purple-500/10 border-purple-500/20"
            case "Average": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
            case "Insufficient": return "text-red-500 bg-red-500/10 border-red-500/20"
            default: return "text-gray-500 bg-gray-500/10 border-gray-500/20"
        }
    }

    // Determine color code for progress bar based on status if color not explicitly provided
    const getProgressColorClass = (s: string) => {
        switch (s) {
            case "Great": return "bg-emerald-500"
            case "Good": return "bg-blue-500"
            case "Advanced": return "bg-purple-500"
            case "Average": return "bg-yellow-500"
            case "Insufficient": return "bg-red-500"
            default: return "bg-gray-500"
        }
    }

    return (
        <Card className="bg-sidebar border-sidebar-border shadow-sm flex flex-col justify-between h-full hover:bg-sidebar/80 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground truncate pr-2" title={title}>
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="flex items-baseline justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold tracking-tight">{status}</span>
                            {score && (
                                <Badge variant="outline" className={cn("text-xs font-semibold px-2 py-0.5 h-auto", getStatusColor(status))}>
                                    {score}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {metric && (
                        <div className="text-sm font-medium text-muted-foreground">{metric}</div>
                    )}

                    {type === 'donut' ? (
                        <div className="h-[100px] w-full mt-2 relative">
                            <ResponsiveContainer width="100%" height="100%">
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
                                        stroke="none"
                                    >
                                        {data?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value: any) => `${Math.round(Number(value) || 0)}%`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Small indicator in center bottom if needed, or just leave as is */}
                        </div>
                    ) : (
                        /* Fee Scanner / Default view: Simple progress bar logic or savings emphasis */
                        <div className="w-full mt-4">
                            {/* Visual indicator of "Goodness" */}
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Efficiency</span>
                                <span>{status}</span>
                            </div>
                            <Progress
                                value={
                                    status === 'Great' ? 95 :
                                        status === 'Good' || status === 'Advanced' ? 75 :
                                            status === 'Average' ? 50 : 20
                                }
                                className="h-2"
                                indicatorClassName={getProgressColorClass(status)}
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

