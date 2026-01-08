import { ScannerCard } from "@/components/insights/scanner-card"
import { PassiveIncomeCard } from "@/components/insights/passive-income-card"
import { SimulationTool } from "@/components/insights/simulation-tool"
import { getInsightsData } from "@/actions/dashboard"
import { Activity, Globe, PieChart, Wallet } from "lucide-react"

export default async function InsightsPage() {
    const insights = await getInsightsData()

    // No longer need feeGenericChartData

    const sectorChartData = insights.sectorBreakdown.slice(0, 5).map(s => ({ value: s.percent }))
    const geoChartData = insights.geographicBreakdown.slice(0, 5).map(g => ({ value: g.percent }))

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ScannerCard
                    title="Fee Scanner"
                    // If great, show savings, otherwise show fee % or score
                    score={`${insights.feePercent.toFixed(2)}%`}
                    metric={`€${insights.potentialSavings.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} savings`}
                    status={insights.feeStatus}
                    color={insights.feeStatus === 'Great' || insights.feeStatus === 'Good' ? "#22c55e" :
                        insights.feeStatus === 'Average' ? "#f59e0b" : "#ef4444"}
                    type="area" // using 'area' type to trigger legacy/default layout, but internal component is updated
                    icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
                />

                <PassiveIncomeCard
                    yieldPercent={insights.avgPassiveYield}
                    projectedAmount={insights.totalPassiveIncome}
                />

                <ScannerCard
                    title="Sector Diversification"
                    score={`${insights.sectorScore}/10`}
                    status={insights.sectorStatus}
                    color="#3b82f6"
                    data={sectorChartData.length > 0 ? sectorChartData : [{ value: 30 }, { value: 50 }, { value: 40 }, { value: 70 }, { value: 50 }]}
                    type="donut"
                    icon={<PieChart className="h-4 w-4 text-muted-foreground" />}
                />

                <ScannerCard
                    title="Geographic Diversification"
                    score={`${insights.geoScore}/10`}
                    status={insights.geoStatus}
                    color="#3b82f6"
                    data={geoChartData.length > 0 ? geoChartData : [{ value: 80 }, { value: 20 }, { value: 10 }, { value: 5 }, { value: 5 }]}
                    type="donut"
                    icon={<Globe className="h-4 w-4 text-muted-foreground" />}
                />
            </div>

            {/* Simulation Tool */}
            <div className="grid grid-cols-1">
                <SimulationTool />
            </div>
        </div>
    )
}
