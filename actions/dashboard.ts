import { db } from "@/db"
import { dailySnapshots, assets, portfolios, transactions } from "@/db/schema"
import { asc, eq, sql } from "drizzle-orm"
import {
    calculateGeographicDiversification,
    calculateSectorDiversification,
    calculateDiversificationScore
} from "@/lib/asset-mappings"

export async function getDashboardData() {
    try {
        const results = await Promise.all([
            db.query.dailySnapshots.findMany({
                orderBy: [asc(dailySnapshots.date)],
                limit: 365
            }),
            db.query.assets.findMany(),
            db.query.portfolios.findMany()
        ]);

        return {
            snapshots: results[0] || [],
            assets: results[1] || [],
            portfolios: results[2] || []
        }

    } catch (error) {
        console.warn("⚠️ Database Error:", error);
        return {
            snapshots: [],
            assets: [],
            portfolios: []
        };
    }
}

/**
 * Get insights data for analytics cards
 * Calculates fees, dividends, and diversification metrics
 */
export async function getInsightsData() {
    try {
        // Get all needed data in parallel
        const [assetsData, transactionsData, portfoliosData] = await Promise.all([
            db.query.assets.findMany(),
            db.query.transactions.findMany(),
            db.query.portfolios.findMany()
        ])

        // Filter for stocks/funds portfolios only (exclude crowdfunding, real estate, crypto for some metrics)
        const stockPortfolioTypes = ['PEA', 'CTO', 'PEE', 'AV', 'STOCK', 'FUND', 'ETF']
        const stockPortfolioIds = portfoliosData
            .filter(p => stockPortfolioTypes.includes(p.type))
            .map(p => p.id)

        const stockAssets = assetsData.filter(a => stockPortfolioIds.includes(a.portfolioId))

        // Calculate asset values for diversification
        const assetsWithValue = stockAssets.map(a => ({
            symbol: a.symbol,
            value: parseFloat(a.quantity) * parseFloat(a.currentPrice || '0')
        }))

        const totalStocksValue = assetsWithValue.reduce((sum, a) => sum + a.value, 0)

        // ===== FEE CALCULATIONS =====
        const feeTransactions = transactionsData.filter(t => t.type === 'FEE')
        const totalFees = feeTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)
        const feePercent = totalStocksValue > 0 ? (Math.abs(totalFees) / totalStocksValue) * 100 : 0

        // Potential savings: Compare to average low-cost broker (0.1% per year typical)
        const idealFeeRate = 0.001 // 0.1%
        const idealFees = totalStocksValue * idealFeeRate
        const potentialSavings = Math.max(0, Math.abs(totalFees) - idealFees)

        // Fee status rating
        let feeStatus: 'Great' | 'Good' | 'Average' | 'Insufficient' = 'Great'
        if (feePercent > 1) feeStatus = 'Insufficient'
        else if (feePercent > 0.5) feeStatus = 'Average'
        else if (feePercent > 0.2) feeStatus = 'Good'

        // ===== DIVIDEND CALCULATIONS =====
        const dividendTransactions = transactionsData.filter(t => t.type === 'DIVIDEND')
        const totalDividends = dividendTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)

        // Calculate dividend yield based on current holdings
        const dividendYield = totalStocksValue > 0 ? (totalDividends / totalStocksValue) * 100 : 0

        // Project 12 months dividends (simple projection based on last 12 months)
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        const recentDividends = dividendTransactions.filter(t => new Date(t.date) >= oneYearAgo)
        const recentDividendsTotal = recentDividends.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)
        const projected12mDividends = recentDividendsTotal || (totalStocksValue * (dividendYield / 100))

        // ===== DIVERSIFICATION CALCULATIONS =====
        const geographicBreakdown = calculateGeographicDiversification(assetsWithValue)
        const sectorBreakdown = calculateSectorDiversification(assetsWithValue)

        const geoScore = calculateDiversificationScore(geographicBreakdown)
        const sectorScore = calculateDiversificationScore(sectorBreakdown)

        // Geographic status
        let geoStatus: 'Great' | 'Good' | 'Average' | 'Insufficient' | 'Advanced' = 'Great'
        if (geoScore <= 2) geoStatus = 'Insufficient'
        else if (geoScore <= 4) geoStatus = 'Average'
        else if (geoScore <= 6) geoStatus = 'Good'
        else if (geoScore >= 8) geoStatus = 'Advanced'

        // Sector status
        let sectorStatus: 'Great' | 'Good' | 'Average' | 'Insufficient' | 'Advanced' = 'Great'
        if (sectorScore <= 2) sectorStatus = 'Insufficient'
        else if (sectorScore <= 4) sectorStatus = 'Average'
        else if (sectorScore <= 6) sectorStatus = 'Good'
        else if (sectorScore >= 8) sectorStatus = 'Advanced'

        // ===== PASSIVE INCOME (All sources) =====
        // Include dividends + crowdfunding interest
        const crowdfundingPortfolioIds = portfoliosData
            .filter(p => p.type === 'CROWDFUNDING' || p.type === 'PARTICIPATORY')
            .map(p => p.id)

        const crowdfundingAssets = assetsData.filter(a => crowdfundingPortfolioIds.includes(a.portfolioId))
        const crowdfundingValue = crowdfundingAssets.reduce((sum, a) =>
            sum + (parseFloat(a.quantity) * parseFloat(a.currentPrice || '0')), 0
        )

        // Estimate crowdfunding income (average ~8% yield)
        let crowdfundingIncome = 0
        for (const asset of crowdfundingAssets) {
            try {
                if (asset.symbol?.startsWith('{')) {
                    const metadata = JSON.parse(asset.symbol)
                    const invested = parseFloat(asset.quantity) * parseFloat(asset.currentPrice || '0')
                    const rate = (metadata.rate || 8) / 100
                    crowdfundingIncome += invested * rate * 0.7 // Net after taxes
                }
            } catch {
                // Default 8% if no metadata
                const invested = parseFloat(asset.quantity) * parseFloat(asset.currentPrice || '0')
                crowdfundingIncome += invested * 0.08 * 0.7
            }
        }

        const totalPassiveIncome = totalDividends + crowdfundingIncome
        const totalInvestableAssets = totalStocksValue + crowdfundingValue
        const avgPassiveYield = totalInvestableAssets > 0
            ? (totalPassiveIncome / totalInvestableAssets) * 100
            : 0

        return {
            // Fees
            feePercent: Math.round(feePercent * 100) / 100,
            totalFees: Math.abs(totalFees),
            potentialSavings: Math.round(potentialSavings),
            feeStatus,

            // Dividends
            dividendYield: Math.round(dividendYield * 100) / 100,
            totalDividends,
            projected12mDividends: Math.round(projected12mDividends),

            // Geographic Diversification
            geographicBreakdown,
            geoScore,
            geoStatus,

            // Sector Diversification
            sectorBreakdown,
            sectorScore,
            sectorStatus,

            // Passive Income
            totalPassiveIncome: Math.round(totalPassiveIncome),
            avgPassiveYield: Math.round(avgPassiveYield * 100) / 100,

            // Totals for reference
            totalStocksValue,
            totalCrowdfundingValue: crowdfundingValue
        }

    } catch (error) {
        console.warn("⚠️ Insights Data Error:", error)
        return {
            feePercent: 0,
            totalFees: 0,
            potentialSavings: 0,
            feeStatus: 'Great' as const,
            dividendYield: 0,
            totalDividends: 0,
            projected12mDividends: 0,
            geographicBreakdown: [],
            geoScore: 0,
            geoStatus: 'Insufficient' as const,
            sectorBreakdown: [],
            sectorScore: 0,
            sectorStatus: 'Insufficient' as const,
            totalPassiveIncome: 0,
            avgPassiveYield: 0,
            totalStocksValue: 0,
            totalCrowdfundingValue: 0
        }
    }
}

