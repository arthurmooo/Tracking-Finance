"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Calendar, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SummaryCardsProps {
    totalInvested: number
    averageYield: number
    nextPayout: number
}

export function SummaryCards({ totalInvested, averageYield, nextPayout }: SummaryCardsProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card/50 border-sidebar-border backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="h-12 w-12" />
                </div>
                <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Total Investi</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <h2 className="text-3xl font-bold">{formatCurrency(totalInvested)}</h2>
                        <span className="text-xs text-emerald-500 font-medium flex items-center gap-0.5">
                            <ArrowUpRight className="h-3 w-3" />
                            Active
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/50 border-sidebar-border backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="h-12 w-12" />
                </div>
                <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Rendement Moyen (Pondéré)</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <h2 className="text-3xl font-bold">{averageYield.toFixed(2)}%</h2>
                        <span className="text-xs text-emerald-500 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            Net
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/50 border-sidebar-border backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Calendar className="h-12 w-12" />
                </div>
                <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Prochain Versement (Prévu)</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <h2 className="text-3xl font-bold">{formatCurrency(nextPayout)}</h2>
                        <span className="text-xs text-muted-foreground font-medium">
                            Sous 30 jours
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
