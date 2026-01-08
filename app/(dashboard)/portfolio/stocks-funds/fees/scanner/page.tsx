import { db } from "@/db"
import { FeesScannerView } from "@/components/portfolio/fees-scanner-view"
import { getProductFee, PLATFORM_FEES } from "@/lib/asset-mappings"

export default async function FeeScannerPage() {
    // Fetch Data
    const [assetsData, portfoliosData] = await Promise.all([
        db.query.assets.findMany(),
        db.query.portfolios.findMany()
    ])

    // Filter for Stocks & Funds Portfolios
    const stockPortfolioTypes = ['PEA', 'CTO', 'PEE', 'AV', 'STOCK', 'FUND', 'ETF']
    const stockPortfolios = portfoliosData.filter(p => stockPortfolioTypes.includes(p.type))
    const stockPortfolioIds = stockPortfolios.map(p => p.id)

    // Get Assets
    const stockAssets = assetsData.filter(a => stockPortfolioIds.includes(a.portfolioId))

    // Process Assets and Calculate Fees
    const detailedAssets = stockAssets.map(asset => {
        const quantity = parseFloat(asset.quantity)
        const price = parseFloat(asset.currentPrice || '0')
        const value = quantity * price

        // 1. Product Fee (TER)
        const productFeeRate = getProductFee(asset.symbol)

        // 2. Platform Fee (Management Fee)
        const portfolio = stockPortfolios.find(p => p.id === asset.portfolioId)
        let platformFeeRate = 0
        if (portfolio) {
            const pType = portfolio.type.toUpperCase()
            if (pType.includes('AV') || pType.includes('ASSURANCE')) platformFeeRate = PLATFORM_FEES['AV']
            else if (pType.includes('PER')) platformFeeRate = PLATFORM_FEES['PER']
            else if (pType.includes('PEA')) platformFeeRate = PLATFORM_FEES['PEA']
            else if (pType.includes('CTO')) platformFeeRate = PLATFORM_FEES['CTO']
        }

        const totalFeeRate = productFeeRate + platformFeeRate
        const feeAmount = value * (totalFeeRate / 100)

        // Determine Type for display
        let displayType = 'Action'
        const symbol = asset.symbol?.toUpperCase() || ''
        if (symbol.includes('ETF') || asset.name.includes('ETF')) displayType = 'ETF'
        else if (productFeeRate > 1 || asset.name.includes('Fonds') || asset.name.includes('SICAV')) displayType = 'Fonds'
        else if (symbol.includes('SCPI') || asset.name.includes('SCPI')) displayType = 'SCPI'

        return {
            id: asset.id,
            name: asset.name,
            type: displayType,
            value,
            feePercent: totalFeeRate,
            feeAmount,
            currency: 'EUR' // Default
        }
    }).filter(a => a.value > 10) // Filter out negligible assets
        .sort((a, b) => b.feePercent - a.feePercent) // Sort by highest fee % first

    // Aggregate Totals
    const totalValue = detailedAssets.reduce((sum, a) => sum + a.value, 0)
    const totalFees = detailedAssets.reduce((sum, a) => sum + a.feeAmount, 0)
    const feePercent = totalValue > 0 ? (totalFees / totalValue) * 100 : 0

    // Potential Savings (vs 0.2% benchmark)
    const idealFees = totalValue * 0.002
    const savingsPotential = Math.max(0, totalFees - idealFees)

    // Simulate 30 year Costs
    // This is valid: Cost = Value * (1 - (1-fee)^30) roughly if assuming flat growth?
    // Better: Value difference between (1+r)^30 and (1+r-fee)^30

    // Let's use a simpler heuristic for the "Cumulative Fees 30Y" card similar to the image
    // The image shows 35.60% cumulative fees.
    // Fee Drag over 30 years roughly: 1 - (1 - fee)^30
    // Example: 1.64% fee -> 1 - (1 - 0.0164)^30 = 1 - 0.60 = 0.40 (40%)

    const cumulativeFeesPercent30y = (1 - Math.pow(1 - (feePercent / 100), 30)) * 100

    // For the absolute amount, simply apply this percentage to current capital projected? 
    // Usually it means "Current Capital * % lost". 
    // Or it means "How much fees you will pay".
    // Let's assume it means "Money lost to fees" relative to current capital growing at e.g. 5%
    // Detailed calculation:
    // Future Value without fees: PV * (1.07)^30
    // Future Value with fees: PV * (1.07 - fee)^30
    // Difference is the cost.

    const r = 0.07
    const f = feePercent / 100
    const fvNoFee = totalValue * Math.pow(1 + r, 30)
    const fvWithFee = totalValue * Math.pow(1 + r - f, 30)
    const cumulativeFees30y = fvNoFee - fvWithFee

    return (
        <FeesScannerView
            totalFees={totalFees}
            feePercent={feePercent}
            cumulativeFees30y={cumulativeFees30y}
            cumulativeFeesPercent30y={cumulativeFeesPercent30y}
            assets={detailedAssets}
            savingsPotential={savingsPotential}
        />
    )
}
