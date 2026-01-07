import { ScannerCard } from "@/components/insights/scanner-card"
import { PassiveIncomeCard } from "@/components/insights/passive-income-card"
import { SimulationTool } from "@/components/insights/simulation-tool"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

export default function InsightsPage() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">


            {/* Grid of Scanners */}
            <div className="grid gap-4 md:grid-cols-2">
                <ScannerCard
                    title="Fee Scanner"
                    score="0.41%"
                    scoreLabel=""
                    metric="€4,412"
                    metricLabel="Potential savings"
                    status="Great"
                    color="#22c55e"
                    data={[{ value: 10 }, { value: 15 }, { value: 35 }, { value: 60 }, { value: 80 }]}
                />

                <PassiveIncomeCard
                    yieldVal="2.65%"
                    projectedAmount="Projected (12 months)"
                    data={[{ value: 40 }, { value: 20 }, { value: 60 }, { value: 80 }, { value: 50 }, { value: 90 }, { value: 30 }, { value: 70 }, { value: 45 }, { value: 80 }, { value: 55 }, { value: 60 }]}
                />

                <ScannerCard
                    title="Sector diversification scanner"
                    score="8/10"
                    scoreLabel=""
                    metric="Advanced"
                    metricLabel=""
                    status="Advanced"
                    color="#3b82f6"
                    data={[{ value: 30 }, { value: 50 }, { value: 40 }, { value: 70 }, { value: 50 }]}
                />

                <ScannerCard
                    title="Geographical diversification scanner"
                    score="2/10"
                    scoreLabel=""
                    metric="Insufficient"
                    metricLabel=""
                    status="Insufficient"
                    color="#ef4444"
                    data={[{ value: 80 }, { value: 20 }, { value: 10 }, { value: 5 }, { value: 5 }]}
                />
            </div>

            {/* Simulation Tool */}
            <div className="grid grid-cols-1">
                <SimulationTool />
            </div>
        </div>
    )
}
