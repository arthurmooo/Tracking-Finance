import { ScannerCard } from "@/components/insights/scanner-card"
import { PassiveIncomeCard } from "@/components/insights/passive-income-card"
import { SimulationTool } from "@/components/insights/simulation-tool"
import { getInsightsData } from "@/actions/dashboard"

export default async function InsightsPage() {
    const insights = await getInsightsData()

    // Generate mini chart data for scanners based on actual values
    const feeChartData = [
        { value: 10 }, { value: 15 }, { value: 35 },
        { value: insights.feePercent > 0 ? 60 : 20 },
        { value: insights.feePercent > 0 ? 80 : 40 }
    ]

    const passiveIncomeChartData = Array.from({ length: 12 }, (_, i) => ({
        value: insights.totalPassiveIncome > 0
            ? 40 + Math.sin(i * 0.5) * 40
            : 20 + Math.random() * 30
    }))

    const sectorChartData = insights.sectorBreakdown.slice(0, 5).map(s => ({ value: s.percent }))
    const geoChartData = insights.geographicBreakdown.slice(0, 5).map(g => ({ value: g.percent }))

    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            {/* Grid of Scanners */}
            <div className="grid gap-4 md:grid-cols-2">
                <ScannerCard
                    title="Fee Scanner"
                    score={`${insights.feePercent.toFixed(2)}%`}
                    scoreLabel=""
                    metric={`€${insights.potentialSavings.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}`}
                    metricLabel="Potential savings"
                    status={insights.feeStatus}
                    color={insights.feeStatus === 'Great' || insights.feeStatus === 'Good' ? "#22c55e" :
                        insights.feeStatus === 'Average' ? "#f59e0b" : "#ef4444"}
                    data={feeChartData}
                />

                <PassiveIncomeCard
                    yieldVal={`${insights.avgPassiveYield.toFixed(2)}%`}
                    projectedAmount={insights.totalPassiveIncome}
                    data={passiveIncomeChartData}
                />

                <ScannerCard
                    title="Sector diversification scanner"
                    score={`${insights.sectorScore}/10`}
                    scoreLabel=""
                    metric={insights.sectorStatus}
                    metricLabel=""
                    status={insights.sectorStatus}
                    color={insights.sectorStatus === 'Advanced' || insights.sectorStatus === 'Great' ? "#3b82f6" :
                        insights.sectorStatus === 'Good' ? "#22c55e" :
                            insights.sectorStatus === 'Average' ? "#f59e0b" : "#ef4444"}
                    data={sectorChartData.length > 0 ? sectorChartData : [{ value: 30 }, { value: 50 }, { value: 40 }, { value: 70 }, { value: 50 }]}
                />

                <ScannerCard
                    title="Geographical diversification scanner"
                    score={`${insights.geoScore}/10`}
                    scoreLabel=""
                    metric={insights.geoStatus}
                    metricLabel=""
                    status={insights.geoStatus}
                    color={insights.geoStatus === 'Advanced' || insights.geoStatus === 'Great' ? "#3b82f6" :
                        insights.geoStatus === 'Good' ? "#22c55e" :
                            insights.geoStatus === 'Average' ? "#f59e0b" : "#ef4444"}
                    data={geoChartData.length > 0 ? geoChartData : [{ value: 80 }, { value: 20 }, { value: 10 }, { value: 5 }, { value: 5 }]}
                />
            </div>

            {/* Simulation Tool */}
            <div className="grid grid-cols-1">
                <SimulationTool />
            </div>
        </div>
    )
}
