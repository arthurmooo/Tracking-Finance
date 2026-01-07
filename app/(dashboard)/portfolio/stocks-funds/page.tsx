import { AssetsTable } from "@/components/portfolio/assets-table"
import { InsightsSection } from "@/components/portfolio/insights-section"
import { StocksFundsView } from "@/components/portfolio/stocks-funds-view"

export default function StocksFundsPage() {
    // Mock aggregated data for the top level header
    const totalValue = 12405
    const changeValue = 239
    const changePercentage = 1.96

    return (
        <div className="p-6 md:p-8 space-y-8 pb-20">
            <StocksFundsView
                totalValue={totalValue}
                changeValue={changeValue}
                changePercentage={changePercentage}
            />
            <InsightsSection />
            <AssetsTable />
        </div>
    )
}

