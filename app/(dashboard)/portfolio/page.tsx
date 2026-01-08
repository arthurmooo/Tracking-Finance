import { getDashboardData } from "@/actions/dashboard"
import { PortfolioSummary } from "@/components/portfolio/portfolio-summary"
import { AssetsBreakdown, AssetCategory, PortfolioGroup, Asset } from "@/components/portfolio/assets-breakdown"

export default async function PortfolioPage() {
    const data = await getDashboardData()

    // --- Data Processing for Portfolio Summary ---
    // Calculate REAL-TIME Net Worth from latest assets, not just snapshots history
    const realTimeNetWorth = data.assets.reduce((sum: number, asset: any) => {
        const qty = parseFloat(asset.quantity || '0')
        const price = parseFloat(asset.currentPrice || asset.price || '0')
        return sum + (qty * price)
    }, 0)

    const snapshots = data.snapshots.map(s => ({
        date: s.date,
        value: parseFloat(s.totalNetWorth)
    }))

    // Use real-time value for the display, fallback to snapshot if empty (which shouldn't happen with real data)
    const currentNetWorth = realTimeNetWorth || (snapshots.length > 0 ? snapshots[snapshots.length - 1].value : 0)

    // Calculate YTD P&L based on actual data
    const currentYear = new Date().getFullYear().toString()
    const startOfYearSnapshot = snapshots.find(s => s.date.startsWith(currentYear)) || snapshots[0]
    const startOfYearValue = startOfYearSnapshot ? startOfYearSnapshot.value : currentNetWorth * 0.98
    const ytdPnl = currentNetWorth - startOfYearValue
    const ytdPnlPercent = startOfYearValue !== 0 ? (ytdPnl / startOfYearValue) * 100 : 0


    // --- Data Processing for Assets Breakdown ---

    // 1. Group Assets by Portfolio
    const assetsByPortfolio: Record<string, Asset[]> = {}

    data.assets.forEach((rawAsset: any) => {
        const portfolioId = rawAsset.portfolioId || 'unknown'
        if (!assetsByPortfolio[portfolioId]) {
            assetsByPortfolio[portfolioId] = []
        }

        const quantity = parseFloat(rawAsset.quantity)
        const price = parseFloat(rawAsset.currentPrice || rawAsset.price || '0')
        const value = quantity * price

        const buyPrice = rawAsset.averageBuyPrice ? parseFloat(rawAsset.averageBuyPrice) : price
        const pnl = value - (quantity * buyPrice)

        assetsByPortfolio[portfolioId].push({
            id: rawAsset.id || rawAsset.name,
            name: rawAsset.name,
            symbol: rawAsset.symbol,
            quantity,
            price,
            value,
            portfolioId,
            type: rawAsset.type,
            // @ts-ignore - Adding pnl to asset for aggregation, though not in interface explicitly yet
            pnl,
            pnlPercent: (pnl / (quantity * buyPrice)) * 100
        })
    })

    // 2. Build Portfolio Groups
    const portfolios = data.portfolios.map((p: any) => {
        const pAssets = assetsByPortfolio[p.id] || []
        const totalValue = pAssets.reduce((sum, a) => sum + a.value, 0)
        // @ts-ignore
        const totalPnl = pAssets.reduce((sum, a) => sum + a.pnl, 0)
        const totalCost = totalValue - totalPnl
        const pnlPercent = totalCost !== 0 ? (totalPnl / totalCost) * 100 : 0

        return {
            id: p.id,
            name: p.name,
            type: p.type, // PEA, CTO, CRYPTO, etc.
            totalValue,
            pnl: totalPnl,
            pnlPercent,
            assets: pAssets
        } as PortfolioGroup & { type: string }
    })

    // 3. Group Portfolios into Categories
    // Categories are defined here - these map portfolio.type to display categories
    const categoryMap: Record<string, AssetCategory> = {
        'stocks': { id: 'stocks', name: 'Stocks & Funds', totalValue: 0, percentage: 0, pnl: 0, pnlPercent: 0, portfolios: [] },
        'crypto': { id: 'crypto', name: 'Cryptos', totalValue: 0, percentage: 0, pnl: 0, pnlPercent: 0, portfolios: [] },
        'cash': { id: 'cash', name: 'Checking accounts', totalValue: 0, percentage: 0, pnl: 0, pnlPercent: 0, portfolios: [] },
        'real_estate': { id: 'real_estate', name: 'Real Estate', totalValue: 0, percentage: 0, pnl: 0, pnlPercent: 0, portfolios: [] },
        'crowdfunding': { id: 'crowdfunding', name: 'Participatory Financing', totalValue: 0, percentage: 0, pnl: 0, pnlPercent: 0, portfolios: [] },
    }

    // Map portfolio types to category keys
    const typeToCategory: Record<string, string> = {
        'PEA': 'stocks',
        'CTO': 'stocks',
        'PEE': 'stocks',
        'AV': 'stocks',       // Assurance Vie goes to stocks & funds
        'STOCK': 'stocks',
        'ETF': 'stocks',
        'FUND': 'stocks',
        'CRYPTO': 'crypto',
        'CASH': 'cash',
        'BANK': 'cash',
        'LIQUIDITY': 'cash',
        'REAL_ESTATE': 'real_estate',
        'SCPI': 'real_estate',
        'CROWDFUNDING': 'crowdfunding',
        'PARTICIPATORY': 'crowdfunding',
    }

    portfolios.forEach(p => {
        const type = p.type?.toUpperCase() || 'STOCKS'
        const catKey = typeToCategory[type] || 'stocks' // Default to stocks if unknown

        categoryMap[catKey].portfolios.push(p)
        categoryMap[catKey].totalValue += p.totalValue
        categoryMap[catKey].pnl += p.pnl
    })

    // 4. Finalize Categories
    const totalAssetsValue = Object.values(categoryMap).reduce((sum, c) => sum + c.totalValue, 0)

    const categories = Object.values(categoryMap)
        .filter(c => c.totalValue > 0 || c.portfolios.length > 0)
        .map(c => {
            const cost = c.totalValue - c.pnl
            return {
                ...c,
                percentage: totalAssetsValue > 0 ? Math.round((c.totalValue / totalAssetsValue) * 100) : 0,
                pnlPercent: cost > 0 ? (c.pnl / cost) * 100 : 0
            }
        })
        .sort((a, b) => b.totalValue - a.totalValue)


    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <PortfolioSummary
                totalWorth={currentNetWorth}
                snapshots={snapshots}
                ytdPnl={ytdPnl}
                ytdPnlPercent={ytdPnlPercent}
            />

            <AssetsBreakdown
                categories={categories}
            />
        </div>
    )
}
