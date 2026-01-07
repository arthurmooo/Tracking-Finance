import { getDashboardData } from "@/actions/dashboard"
import { AssetsTable, Account, Asset } from "@/components/portfolio/assets-table"
import { InsightsSection } from "@/components/portfolio/insights-section"
import { StocksFundsView } from "@/components/portfolio/stocks-funds-view"

export default async function StocksFundsPage() {
    const data = await getDashboardData()

    // Filter for Stocks & Funds (PEA, CTO, PEE, etc - basically everything except Crypto, Real Estate, Cash)
    // Adjust logic based on your type definitions in DB vs UI
    const stockPortfolioTypes = ['PEA', 'CTO', 'PEE', 'STOCK', 'FUND', 'ETF']

    // Process assets into Accounts (Portfolios)
    const accounts: Account[] = data.portfolios
        .filter((p: any) => stockPortfolioTypes.includes(p.type) || ['PEA', 'CTO', 'PEE'].includes(p.type))
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
                    const price = parseFloat(a.currentPrice || a.price || 0)
                    const buyPrice = parseFloat(a.averageBuyPrice || price)
                    const value = quantity * price
                    const pnl = value - (quantity * buyPrice)

                    return {
                        id: a.id,
                        name: a.name,
                        ticker: a.symbol,
                        quantity,
                        price,
                        value,
                        pnl,
                        pnlPercent: (pnl / (quantity * buyPrice)) * 100,
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

    const historyData = data.snapshots.map((s: any) => ({
        date: s.date,
        value: parseFloat(s.totalNetWorth)
    }))

    return (
        <div className="p-6 md:p-8 space-y-8 pb-20">
            <StocksFundsView
                totalValue={totalValue}
                changeValue={changeValue}
                changePercentage={changePercentage}
                historyData={historyData}
            />
            <InsightsSection />
            <AssetsTable accounts={accounts} />
        </div>
    )
}

