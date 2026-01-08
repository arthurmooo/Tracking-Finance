"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Check, Info } from "lucide-react"

interface PassiveIncomeDetailsProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    dividendYield: number
    totalDividends: number
    monthlyData: any[]
    transactions: any[]
    upcomingTransactions: any[]
}

export function PassiveIncomeDetails({
    isOpen,
    onOpenChange,
    dividendYield,
    totalDividends,
    monthlyData,
    transactions,
    upcomingTransactions
}: PassiveIncomeDetailsProps) {
    const [activeTab, setActiveTab] = useState<"upcoming" | "received">("upcoming")
    const [hoveredMonth, setHoveredMonth] = useState<number | null>(null)

    // Display transactions based on active tab
    const displayedTransactions = activeTab === "upcoming" ? upcomingTransactions : transactions

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md md:max-w-[600px] overflow-y-auto bg-background p-0 border-l border-border">
                <div className="p-6 space-y-8">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-xl font-normal">Revenus passifs</SheetTitle>
                    </SheetHeader>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card/50 p-4 rounded-lg border border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                <span>Rendement</span>
                                <Info className="w-3 h-3" />
                            </div>
                            <div className="text-2xl font-normal tracking-tight">
                                {dividendYield.toFixed(2)}%
                            </div>
                        </div>
                        <div className="bg-card/50 p-4 rounded-lg border border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                <span>Total</span>
                                <Info className="w-3 h-3" />
                            </div>
                            <div className="text-2xl font-normal tracking-tight">
                                {totalDividends.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).replace('€', '').trim()} €
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div>
                        <h3 className="text-sm text-muted-foreground mb-6">Calendrier</h3>
                        <div className="h-[250px] w-full relative">
                            {/* Horizontal Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                                {[1400, 1200, 1000].map((val) => (
                                    <div key={val} className="w-full border-t border-dashed border-border/30 h-0 flex items-center">
                                        <span className="text-[10px] text-muted-foreground bg-background pr-1 translate-y-[-50%]">{val} €</span>
                                    </div>
                                ))}
                                <div className="border-t border-dashed border-border/30 h-0" />
                            </div>

                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} onMouseMove={(state) => {
                                    if (state.activeTooltipIndex !== undefined) {
                                        setHoveredMonth(Number(state.activeTooltipIndex))
                                    }
                                }} onMouseLeave={() => setHoveredMonth(null)}>
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload
                                                return (
                                                    <div className="bg-popover text-popover-foreground text-xs p-2 rounded border border-border/50 shadow-xl flex gap-4 min-w-[150px] justify-between items-center">
                                                        <span>{data.fullDate}</span>
                                                        <span className="font-mono font-medium">{data.value} €</span>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={8}>
                                        {monthlyData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={index === (hoveredMonth ?? -1) ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                                                fillOpacity={index === (hoveredMonth ?? -1) ? 1 : 0.3}
                                            />
                                        ))}
                                    </Bar>
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                                        dy={10}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Transactions Section */}
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab("upcoming")}
                                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${activeTab === "upcoming" ? "bg-amber-800/40 text-amber-500" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                            >
                                À venir
                            </button>
                            <button
                                onClick={() => setActiveTab("received")}
                                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${activeTab === "received" ? "bg-amber-800/40 text-amber-500" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                            >
                                Perçus
                            </button>
                        </div>

                        <div className="space-y-1">
                            {/* Header */}
                            <div className="grid grid-cols-12 text-xs text-muted-foreground px-2 py-2">
                                <div className="col-span-6">Nom</div>
                                <div className="col-span-2 text-right">Statut</div>
                                <div className="col-span-2 text-right">Date</div>
                                <div className="col-span-2 text-right">Montant</div>
                            </div>

                            {/* List */}
                            {displayedTransactions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    {activeTab === "upcoming" ? "Aucun paiement prévu" : "Aucun paiement reçu"}
                                </div>
                            ) : displayedTransactions.map((tx) => (
                                <div key={tx.id} className="grid grid-cols-12 items-center px-2 py-4 hover:bg-muted/30 rounded-lg transition-colors group cursor-default">
                                    <div className="col-span-6 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            {tx.logo ? (
                                                <img src={tx.logo} alt={tx.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="text-[10px] font-bold text-black">{tx.ticker}</div>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium">{tx.name}</span>
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <div className={`flex items-center gap-1 text-xs ${tx.isProjected ? 'text-amber-500' : 'text-muted-foreground'}`}>
                                            {tx.status}
                                            {!tx.isProjected && <Check className="w-3 h-3 text-muted-foreground" />}
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-right text-sm text-foreground">
                                        {tx.date}
                                    </div>
                                    <div className="col-span-2 text-right text-sm font-medium">
                                        {tx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
