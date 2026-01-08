import { db } from "@/db"
import { dailySnapshots, intradaySnapshots, assets, portfolios, transactions } from "@/db/schema"
import { asc, desc, eq, sql, gte } from "drizzle-orm"
import {
    calculateGeographicDiversification,
    calculateSectorDiversification,
    calculateDiversificationScore,
    getProductFee,
    PLATFORM_FEES
} from "@/lib/asset-mappings"

export async function getDashboardData() {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const results = await Promise.all([
            // Daily history for long term
            db.query.dailySnapshots.findMany({
                orderBy: [asc(dailySnapshots.date)],
                limit: 365
            }),
            // Intraday history for short term (1D, 7D)
            db.query.intradaySnapshots.findMany({
                where: gte(intradaySnapshots.timestamp, sevenDaysAgo),
                orderBy: [asc(intradaySnapshots.timestamp)]
            }),
            db.query.assets.findMany(),
            db.query.portfolios.findMany()
        ]);

        return {
            snapshots: results[0] || [],
            intradaySnapshots: results[1] || [],
            assets: results[2] || [],
            portfolios: results[3] || []
        }

    } catch (error) {
        console.warn("⚠️ Database Error:", error);
        return {
            snapshots: [],
            intradaySnapshots: [],
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
        // 1. Transaction Fees (Historical) - kept for reference but usually one-off
        const feeTransactions = transactionsData.filter(t => t.type === 'FEE')
        // const totalHistoricalFees = feeTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0) // Unused for annual metric

        // 2. Annual Running Costs (TER + Platform Fees)
        let annualRunningCosts = 0

        // Product Fees (TER)
        for (const asset of assetsWithValue) {
            const ter = getProductFee(asset.symbol)
            if (ter > 0) {
                annualRunningCosts += asset.value * (ter / 100)
            }
        }

        // Platform Fees (e.g. AV / PER management fees)
        for (const portfolio of portfoliosData) {
            if (!stockPortfolioIds.includes(portfolio.id)) continue;

            const portfolioAssets = stockAssets.filter(a => a.portfolioId === portfolio.id)
            const portfolioValue = portfolioAssets.reduce((sum, a) => sum + (parseFloat(a.quantity) * parseFloat(a.currentPrice || '0')), 0)

            // Heuristic mapping of portfolio type to fee
            let platformFeeRate = 0
            const pType = portfolio.type.toUpperCase()
            if (pType.includes('AV') || pType.includes('ASSURANCE')) platformFeeRate = PLATFORM_FEES['AV']
            else if (pType.includes('PER')) platformFeeRate = PLATFORM_FEES['PER']
            else if (pType.includes('PEA')) platformFeeRate = PLATFORM_FEES['PEA']
            else if (pType.includes('CTO')) platformFeeRate = PLATFORM_FEES['CTO']

            if (platformFeeRate > 0) {
                annualRunningCosts += portfolioValue * (platformFeeRate / 100)
            }
        }

        const totalFees = annualRunningCosts // Display annual running costs as the main metric
        const feePercent = totalStocksValue > 0 ? (totalFees / totalStocksValue) * 100 : 0

        // Potential savings: Compare to average low-cost broker (0.2% per year typical for clean ETF portfolio)
        const idealFeeRate = 0.002 // 0.2%
        const idealFees = totalStocksValue * idealFeeRate
        const potentialSavings = Math.max(0, totalFees - idealFees)

        // Fee status rating
        let feeStatus: 'Great' | 'Good' | 'Average' | 'Insufficient' = 'Great'
        if (feePercent > 1) feeStatus = 'Insufficient'
        else if (feePercent > 0.5) feeStatus = 'Average'
        else if (feePercent > 0.2) feeStatus = 'Good'

        // ===== DIVIDEND CALCULATIONS =====
        const dividendTransactions = transactionsData.filter(t => t.type === 'DIVIDEND')
        const totalDividends = dividendTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)

        // Calculate projected annual dividends based on real-time yield from assets
        let projected12mDividends = 0
        for (const asset of assetsWithValue) {
            const yieldPercent = parseFloat(stockAssets.find(a => a.symbol === asset.symbol)?.dividendYield || '0')
            if (yieldPercent > 0) {
                projected12mDividends += asset.value * yieldPercent
            }
        }

        // Current Yield based on projection (more accurate than historical)
        const dividendYield = totalStocksValue > 0 ? (projected12mDividends / totalStocksValue) * 100 : 0

        // Only fallback to historical if projection is 0 but we have history (unlikely with this new logic)
        if (projected12mDividends === 0 && totalDividends > 0) {
            projected12mDividends = totalDividends
        }

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

        // ===== PASSIVE INCOME DETAILS (Granular) =====

        // Fetch crowdlending projects for repayment projections
        const crowdlendingProjectsData = await db.query.crowdlendingProjects.findMany()

        // Helper: Calculate monthly interest payment for a project
        function getMonthlyPayment(project: typeof crowdlendingProjectsData[0], targetMonth: Date): number {
            const startDate = new Date(project.startDate)
            const endDate = new Date(startDate)
            endDate.setMonth(endDate.getMonth() + project.durationMonths)

            // Check if targetMonth is within project's active period
            const targetStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1)
            const targetEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0)

            if (targetStart < startDate || targetEnd > endDate) return 0
            if (project.status !== 'ACTIVE' && project.status !== 'active') return 0

            const invested = parseFloat(project.investedAmount)
            const rate = parseFloat(project.interestRate) / 100

            if (project.repaymentType === 'BULLET') {
                // Interest paid monthly, principal at end
                return (invested * rate) / 12
            } else {
                // MONTHLY: Amortizing loan - simplified monthly interest
                return (invested * rate) / 12
            }
        }

        // 1. Monthly Breakdown (Last 12 Months + projections)
        const monthlyPassiveIncome = Array.from({ length: 12 }, (_, i) => {
            const d = new Date()
            d.setMonth(d.getMonth() + (i - 11)) // Start 11 months ago
            d.setDate(1) // Avoid month rollover issues (e.g. Feb 30)
            const monthKey = d.toLocaleString('fr-FR', { month: 'short' }).toUpperCase() + '.'
            const fullDate = d.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
            // Capitalize first letter of fullDate
            const formattedFullDate = fullDate.charAt(0).toUpperCase() + fullDate.slice(1)

            // Historical dividend/interest transactions for this month
            const monthTransactions = transactionsData.filter(t => {
                if (t.type !== 'DIVIDEND' && t.type !== 'INTEREST') return false
                const tDate = new Date(t.date)
                return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear()
            })

            const dividendValue = monthTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)

            // Crowdlending repayments for this month
            const crowdlendingValue = crowdlendingProjectsData.reduce((sum, project) => {
                return sum + getMonthlyPayment(project, d)
            }, 0)

            const value = dividendValue + crowdlendingValue

            return {
                month: monthKey,
                value: Math.round(value * 100) / 100,
                fullDate: formattedFullDate,
            }
        })

        // 2. Historical Transactions List (Perçus)
        const historicalTransactions = transactionsData
            .filter(t => t.type === 'DIVIDEND' || t.type === 'INTEREST')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 20)
            .map(t => {
                const asset = assetsData.find(a => a.id === t.assetId)
                return {
                    id: t.id,
                    name: asset ? asset.name : 'Unknown Asset',
                    ticker: asset ? asset.symbol : '',
                    status: 'Confirmé',
                    date: new Date(t.date).toLocaleDateString('fr-FR'),
                    amount: parseFloat(t.amount || '0'),
                    logo: asset?.symbol && !asset.symbol.startsWith('{')
                        ? `https://logo.clearbit.com/${asset.name.split(' ')[0].toLowerCase()}.com`
                        : null,
                    isProjected: false
                }
            })

        // 3. Upcoming Projected Payments (À venir)
        const now = new Date()
        const upcomingTransactions: typeof historicalTransactions = []

        // Add crowdlending projected payments for the next 6 months
        for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
            const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 15)

            for (const project of crowdlendingProjectsData) {
                const payment = getMonthlyPayment(project, targetMonth)
                if (payment > 0) {
                    upcomingTransactions.push({
                        id: `proj-${project.id}-${monthOffset}`,
                        name: project.name,
                        ticker: project.platform,
                        status: 'Projeté',
                        date: targetMonth.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
                        amount: Math.round(payment * 100) / 100,
                        logo: project.platform.toLowerCase().includes('bienpreter')
                            ? 'https://logo.clearbit.com/bienpreter.com'
                            : null,
                        isProjected: true
                    })
                }
            }
        }

        // Combined list for backward compatibility
        const passiveIncomeTransactions = [...historicalTransactions]

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
            monthlyPassiveIncome,
            passiveIncomeTransactions,
            upcomingTransactions,

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
            monthlyPassiveIncome: [],
            passiveIncomeTransactions: [],
            upcomingTransactions: [],
            totalStocksValue: 0,
            totalCrowdfundingValue: 0
        }
    }
}

