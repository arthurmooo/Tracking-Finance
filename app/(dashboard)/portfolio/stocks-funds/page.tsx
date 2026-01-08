import { getDashboardData, getInsightsData } from "@/actions/dashboard"
import { AssetsTable, Account, Asset } from "@/components/portfolio/assets-table"
import { InsightsSection } from "@/components/portfolio/insights-section"
import { StocksFundsView } from "@/components/portfolio/stocks-funds-view"

export default async function StocksFundsPage() {
    const [data, insights] = await Promise.all([
        getDashboardData(),
        getInsightsData()
    ])

    // Filter for Stocks & Funds (PEA, CTO, PEE, AV - basically everything except Crypto, Real Estate, Cash, Crowdfunding)
    const stockPortfolioTypes = ['PEA', 'CTO', 'PEE', 'AV', 'STOCK', 'FUND', 'ETF']

    // Process assets into Accounts (Portfolios)
    const accounts: Account[] = data.portfolios
        .filter((p: any) => stockPortfolioTypes.includes(p.type))
        .map((p: any) => {
            const pAssets = data.assets.filter((a: any) => a.portfolioId === p.id)

            const totalValue = pAssets.reduce((sum: number, a: any) => sum + (parseFloat(a.quantity) * parseFloat(a.currentPrice || a.price || 0)), 0)
            const totalCost = pAssets.reduce((sum: number, a: any) => sum + (parseFloat(a.quantity) * parseFloat(a.averageBuyPrice || a.currentPrice || 0)), 0)
            const totalPnl = totalValue - totalCost
            const totalPnlPercent = totalCost !== 0 ? (totalPnl / totalCost) * 100 : 0

            return {
                id: p.id,
                name: p.name,
                type: p.type,
                icon: "💼", // Default icon
                totalValue,
                totalPnl,
                totalPnlPercent,
                assets: pAssets.map((a: any) => {
                    const quantity = parseFloat(a.quantity)
                    const marketPrice = parseFloat(a.currentPrice || a.price || 0)
                    const averageCost = parseFloat(a.averageBuyPrice || marketPrice)
                    const value = quantity * marketPrice
                    const pnl = value - (quantity * averageCost)

                    return {
                        id: a.id,
                        name: a.name,
                        ticker: a.symbol,
                        quantity,
                        averageCost,
                        marketPrice,
                        value,
                        pnl,
                        pnlPercent: (pnl / (quantity * averageCost)) * 100,
                        currency: "EUR",
                        type: a.type.toLowerCase()
                    } as Asset
                })
            } as Account
        })

    const totalValue = accounts.reduce((sum, a) => sum + a.totalValue, 0)
    const totalPnl = accounts.reduce((sum, a) => sum + a.totalPnl, 0)
    // Approximate daily change for now based on P&L (since we don't have daily snapshot diff specifically for this filtering yet easily)
    // Or just show 0 if no data
    const changeValue = 0
    const changePercentage = 0

    // Prepare history data - merge daily and intraday
    // We'll pass both to the view separately or merged, but for now let's create a specialized dataset
    // Actually, passing raw data is better so the component can choose based on range

    const dailyHistory = data.snapshots.map((s: any) => {
        let value = parseFloat(s.totalNetWorth)
        if (s.data && typeof s.data === 'object' && 'stocks' in s.data) {
            value = Number(s.data.stocks)
        }
        return { date: s.date, value }
    })

    const intradayHistory = (data.intradaySnapshots || []).map((s: any) => {
        let value = parseFloat(s.totalNetWorth)
        if (s.data && typeof s.data === 'object' && 'stocks' in s.data) {
            value = Number(s.data.stocks)
        }
        // Use timestamp field (not date) and convert to ISO string for chart
        const dateStr = s.timestamp ? new Date(s.timestamp).toISOString() : new Date().toISOString()
        return { date: dateStr, value }
    })

    return (
        <div className="p-6 md:p-8 space-y-8 pb-20">
            <StocksFundsView
                totalValue={totalValue}
                changeValue={changeValue}
                changePercentage={changePercentage}
                historyData={dailyHistory}
                intradayData={intradayHistory}
            />
            <InsightsSection
                feePercent={insights.feePercent}
                potentialSavings={insights.potentialSavings}
                feeStatus={insights.feeStatus}
                dividendYield={insights.dividendYield}
                projected12mDividends={insights.projected12mDividends}
                geographicBreakdown={insights.geographicBreakdown}
                sectorBreakdown={insights.sectorBreakdown}
                sectorScore={insights.sectorScore}
                sectorStatus={insights.sectorStatus}
                geoScore={insights.geoScore}
                geoStatus={insights.geoStatus}
            />
            <AssetsTable accounts={accounts} />
        </div>
    )
}
