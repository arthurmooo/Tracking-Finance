"use client"

import { SummaryCards } from "@/components/portfolio/crowdlending/summary-cards"
import { ProjectList } from "@/components/portfolio/crowdlending/project-list"
import { RepaymentChart } from "@/components/portfolio/crowdlending/repayment-chart"
import { Badge } from "@/components/ui/badge"
import { Landmark, TrendingUp } from "lucide-react"

// Mock Data for Crowdlending
const projects = [
    {
        id: "p1",
        name: "Résidence Les Oliviers",
        platform: "Bienprêter",
        investedAmount: 2500,
        interestRate: 11.5,
        startDate: "2025-06-15",
        durationMonths: 12,
        currentMonth: 7,
        status: "ACTIVE" as const
    },
    {
        id: "p2",
        name: "Rénovation Loft Paris",
        platform: "October",
        investedAmount: 1200,
        interestRate: 8.5,
        startDate: "2025-09-10",
        durationMonths: 24,
        currentMonth: 4,
        status: "ACTIVE" as const
    },
    {
        id: "p3",
        name: "Eoliennes du Nord",
        platform: "Enerfip",
        investedAmount: 4000,
        interestRate: 6.0,
        startDate: "2024-01-20",
        durationMonths: 36,
        currentMonth: 24,
        status: "ACTIVE" as const
    },
    {
        id: "p4",
        name: "Commerce Lyon 2",
        platform: "Bienprêter",
        investedAmount: 1500,
        interestRate: 10.0,
        startDate: "2025-01-05",
        durationMonths: 6,
        currentMonth: 6,
        status: "COMPLETED" as const
    },
    {
        id: "p5",
        name: "Hôtel de la Plage",
        platform: "Raizers",
        investedAmount: 3000,
        interestRate: 12.0,
        startDate: "2025-11-20",
        durationMonths: 18,
        currentMonth: 2,
        status: "LATE" as const
    }
]

const repaymentData = [
    { month: "Jan", amount: 125 },
    { month: "Fev", amount: 130 },
    { month: "Mar", amount: 128 },
    { month: "Avr", amount: 145 },
    { month: "Mai", amount: 150 },
    { month: "Juin", amount: 155 },
    { month: "Juil", amount: 160 },
    { month: "Aou", amount: 140 },
    { month: "Sep", amount: 145 },
    { month: "Oct", amount: 150 },
    { month: "Nov", amount: 155 },
    { month: "Dec", amount: 165 },
]

export default function ParticipatoryFinancingPage() {
    const totalInvested = projects.reduce((sum, p) => p.status === 'ACTIVE' || p.status === 'LATE' ? sum + p.investedAmount : sum, 0)
    const averageYield = projects.reduce((sum, p) => sum + p.interestRate, 0) / projects.length // Simplified for now
    const nextPayout = 145 // Mocked summary from chart

    return (
        <div className="p-6 md:p-8 space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financement Participatif</h1>
                    <p className="text-muted-foreground mt-1">
                        Gérez vos investissements en Crowdlending et Immobilier fractionné.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2 h-auto text-xs uppercase font-medium">
                        <Landmark className="h-3 w-3" />
                        5 Plateformes Connectées
                    </Badge>
                    <Badge className="px-3 py-1 flex items-center gap-2 h-auto text-xs uppercase font-medium bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none border-none">
                        <TrendingUp className="h-3 w-3" />
                        +€1,240 Intérêts cumulés
                    </Badge>
                </div>
            </div>

            {/* Summary Stats */}
            <SummaryCards
                totalInvested={totalInvested}
                averageYield={averageYield}
                nextPayout={nextPayout}
            />

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content: Chart & List */}
                <div className="lg:col-span-2 space-y-8">
                    <RepaymentChart data={repaymentData} />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Projets en cours</h2>
                            <div className="text-xs text-muted-foreground">
                                {projects.filter(p => p.status === 'ACTIVE').length} projets actifs
                            </div>
                        </div>
                        <ProjectList projects={projects} />
                    </div>
                </div>

                {/* Sidebar: Insights & Platform breakdown (Placeholder for now) */}
                <div className="space-y-8">
                    <div className="rounded-xl border border-sidebar-border bg-card/40 p-6 backdrop-blur-sm">
                        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Insights de pilotage</h3>
                        <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-sm font-medium text-emerald-500">Optimisation du Cash-flow</p>
                                <p className="text-xs text-muted-foreground mt-1 line-height-relaxed">
                                    Vos remboursements mensuels augmentent de 15% au prochain trimestre grâce aux nouveaux projets sur Bienprêter.
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                <p className="text-sm font-medium text-amber-500">Alerte Diversification</p>
                                <p className="text-xs text-muted-foreground mt-1 line-height-relaxed">
                                    45% de vos investissements sont sur Bienprêter. Pensez à diversifier sur October ou Enerfip pour réduire le risque plateforme.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border bg-card/40 p-6 backdrop-blur-sm">
                        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Répartition par Plateforme</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span>Bienprêter</span>
                                </div>
                                <span className="font-medium">45%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary/60" />
                                    <span>Enerfip</span>
                                </div>
                                <span className="font-medium">35%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary/30" />
                                    <span>October</span>
                                </div>
                                <span className="font-medium">20%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
