/**
 * Static mapping for ticker symbols to geographic regions and sectors
 * Used for diversification analysis when database doesn't have this metadata
 */

// Geographic region mappings
export const TICKER_TO_REGION: Record<string, string> = {
    // US Stocks
    'AAPL': 'United States',
    'MSFT': 'United States',
    'GOOGL': 'United States',
    'GOOG': 'United States',
    'AMZN': 'United States',
    'META': 'United States',
    'NVDA': 'United States',
    'TSLA': 'United States',
    'JPM': 'United States',
    'V': 'United States',
    'MA': 'United States',
    'UNH': 'United States',
    'JNJ': 'United States',
    'PG': 'United States',
    'HD': 'United States',
    'DIS': 'United States',
    'NFLX': 'United States',
    'ADBE': 'United States',
    'CRM': 'United States',
    'PYPL': 'United States',
    'INTC': 'United States',
    'AMD': 'United States',
    'COST': 'United States',
    'PEP': 'United States',
    'KO': 'United States',
    'MCD': 'United States',
    'NKE': 'United States',
    'WMT': 'United States',

    // European Stocks
    'MC.PA': 'Europe',
    'LVMH': 'Europe',
    'OR.PA': 'Europe',
    'ASML': 'Europe',
    'ASML.AS': 'Europe',
    'SAP': 'Europe',
    'TTE': 'Europe',
    'TTE.PA': 'Europe',
    'SAN.PA': 'Europe',
    'AIR.PA': 'Europe',
    'BNP.PA': 'Europe',
    'SU.PA': 'Europe',
    'AI.PA': 'Europe',
    'RMS.PA': 'Europe',
    'KER.PA': 'Europe',
    'DG.PA': 'Europe',
    'RI.PA': 'Europe',
    'NESN.SW': 'Europe',
    'ROG.SW': 'Europe',
    'NOVN.SW': 'Europe',
    'SHEL': 'Europe',
    'AZN': 'Europe',
    'HSBA': 'Europe',
    'BP': 'Europe',
    'GSK': 'Europe',
    'ULVR': 'Europe',
    'BAYN.DE': 'Europe',
    'SIE.DE': 'Europe',
    'ALV.DE': 'Europe',
    'DTE.DE': 'Europe',
    'BAS.DE': 'Europe',

    // Asian Stocks
    'TSM': 'Asia',
    '9984.T': 'Asia',
    '7203.T': 'Asia',
    '9432.T': 'Asia',
    '6758.T': 'Asia',
    '6861.T': 'Asia',
    'BABA': 'Asia',
    'TCEHY': 'Asia',
    'JD': 'Asia',
    'PDD': 'Asia',
    'BIDU': 'Asia',
    '005930.KS': 'Asia',

    // World ETFs (diversified)
    'CW8': 'World',
    'CW8.PA': 'World',
    'MWRD': 'World',
    'MWRD.PA': 'World',
    'IWDA': 'World',
    'IWDA.AS': 'World',
    'VWCE': 'World',
    'VWCE.DE': 'World',
    'VT': 'World',
    'VTI': 'United States',
    'VOO': 'United States',
    'SPY': 'United States',
    'QQQ': 'United States',
    'IVV': 'United States',
    'VEA': 'Europe',
    'VWO': 'Emerging Markets',
    'EEM': 'Emerging Markets',
    'VGK': 'Europe',
    'EWJ': 'Asia',

    // Emerging Markets
    'EWZ': 'Emerging Markets',
    'EWT': 'Emerging Markets',
    'EWY': 'Emerging Markets',
}

// Sector mappings
export const TICKER_TO_SECTOR: Record<string, string> = {
    // Technology
    'AAPL': 'Technology',
    'MSFT': 'Technology',
    'GOOGL': 'Technology',
    'GOOG': 'Technology',
    'META': 'Technology',
    'NVDA': 'Technology',
    'ADBE': 'Technology',
    'CRM': 'Technology',
    'INTC': 'Technology',
    'AMD': 'Technology',
    'TSM': 'Technology',
    'ASML': 'Technology',
    'ASML.AS': 'Technology',
    'SAP': 'Technology',
    'ORCL': 'Technology',

    // Consumer Discretionary
    'AMZN': 'Consumer Discretionary',
    'TSLA': 'Consumer Discretionary',
    'HD': 'Consumer Discretionary',
    'MCD': 'Consumer Discretionary',
    'NKE': 'Consumer Discretionary',
    'SBUX': 'Consumer Discretionary',
    'MC.PA': 'Consumer Discretionary',
    'LVMH': 'Consumer Discretionary',
    'RMS.PA': 'Consumer Discretionary',
    'KER.PA': 'Consumer Discretionary',
    'DIS': 'Consumer Discretionary',
    'NFLX': 'Consumer Discretionary',
    'BKNG': 'Consumer Discretionary',

    // Consumer Staples
    'PG': 'Consumer Staples',
    'PEP': 'Consumer Staples',
    'KO': 'Consumer Staples',
    'WMT': 'Consumer Staples',
    'COST': 'Consumer Staples',
    'NESN.SW': 'Consumer Staples',
    'ULVR': 'Consumer Staples',
    'OR.PA': 'Consumer Staples',

    // Healthcare
    'JNJ': 'Healthcare',
    'UNH': 'Healthcare',
    'PFE': 'Healthcare',
    'ABBV': 'Healthcare',
    'MRK': 'Healthcare',
    'LLY': 'Healthcare',
    'SAN.PA': 'Healthcare',
    'ROG.SW': 'Healthcare',
    'NOVN.SW': 'Healthcare',
    'AZN': 'Healthcare',
    'GSK': 'Healthcare',
    'BAYN.DE': 'Healthcare',

    // Financials
    'JPM': 'Financials',
    'V': 'Financials',
    'MA': 'Financials',
    'BAC': 'Financials',
    'WFC': 'Financials',
    'GS': 'Financials',
    'BNP.PA': 'Financials',
    'HSBA': 'Financials',
    'ALV.DE': 'Financials',
    'PYPL': 'Financials',

    // Energy
    'XOM': 'Energy',
    'CVX': 'Energy',
    'TTE': 'Energy',
    'TTE.PA': 'Energy',
    'SHEL': 'Energy',
    'BP': 'Energy',

    // Industrials
    'AIR.PA': 'Industrials',
    'BA': 'Industrials',
    'CAT': 'Industrials',
    'HON': 'Industrials',
    'UPS': 'Industrials',
    'SIE.DE': 'Industrials',

    // Materials
    'LIN': 'Materials',
    'SHW': 'Materials',
    'BAS.DE': 'Materials',
    'AI.PA': 'Materials',

    // Communications
    'DTE.DE': 'Communications',
    'T': 'Communications',
    'VZ': 'Communications',
    'TMUS': 'Communications',

    // Utilities
    'NEE': 'Utilities',
    'DUK': 'Utilities',
    'SO': 'Utilities',

    // Real Estate
    'PLD': 'Real Estate',
    'AMT': 'Real Estate',
    'EQIX': 'Real Estate',

    // ETFs - categorized as Diversified
    'CW8': 'Diversified',
    'CW8.PA': 'Diversified',
    'MWRD': 'Diversified',
    'MWRD.PA': 'Diversified',
    'IWDA': 'Diversified',
    'IWDA.AS': 'Diversified',
    'VWCE': 'Diversified',
    'VWCE.DE': 'Diversified',
    'VT': 'Diversified',
    'VTI': 'Diversified',
    'VOO': 'Diversified',
    'SPY': 'Diversified',
    'QQQ': 'Technology',
    'IVV': 'Diversified',
}

/**
 * Get region for a ticker, with intelligent fallback
 */
export function getRegion(symbol: string | null | undefined): string {
    if (!symbol) return 'Other'

    // Try exact match first
    const upper = symbol.toUpperCase()
    if (TICKER_TO_REGION[upper]) return TICKER_TO_REGION[upper]
    if (TICKER_TO_REGION[symbol]) return TICKER_TO_REGION[symbol]

    // Try without exchange suffix (e.g., "AAPL.PA" -> "AAPL")
    const baseTicker = upper.split('.')[0]
    if (TICKER_TO_REGION[baseTicker]) return TICKER_TO_REGION[baseTicker]

    // Infer from exchange suffix
    if (symbol.includes('.PA') || symbol.includes('.AS') || symbol.includes('.DE') ||
        symbol.includes('.SW') || symbol.includes('.L')) {
        return 'Europe'
    }
    if (symbol.includes('.T') || symbol.includes('.KS') || symbol.includes('.HK')) {
        return 'Asia'
    }

    // Default to US for plain tickers (most common case)
    if (/^[A-Z]{1,5}$/.test(upper)) {
        return 'United States'
    }

    return 'Other'
}

/**
 * Get sector for a ticker, with intelligent fallback
 */
export function getSector(symbol: string | null | undefined): string {
    if (!symbol) return 'Other'

    // Try exact match first
    const upper = symbol.toUpperCase()
    if (TICKER_TO_SECTOR[upper]) return TICKER_TO_SECTOR[upper]
    if (TICKER_TO_SECTOR[symbol]) return TICKER_TO_SECTOR[symbol]

    // Try without exchange suffix
    const baseTicker = upper.split('.')[0]
    if (TICKER_TO_SECTOR[baseTicker]) return TICKER_TO_SECTOR[baseTicker]

    return 'Other'
}

/**
 * Calculate geographic diversification from assets
 */
export function calculateGeographicDiversification(
    assets: { symbol: string | null; value: number }[]
): { region: string; percent: number; value: number }[] {
    const totalValue = assets.reduce((sum, a) => sum + a.value, 0)
    if (totalValue === 0) return []

    const byRegion: Record<string, number> = {}

    for (const asset of assets) {
        const region = getRegion(asset.symbol)
        byRegion[region] = (byRegion[region] || 0) + asset.value
    }

    return Object.entries(byRegion)
        .map(([region, value]) => ({
            region,
            value,
            percent: Math.round((value / totalValue) * 100)
        }))
        .sort((a, b) => b.value - a.value)
}

/**
 * Calculate sector diversification from assets
 */
export function calculateSectorDiversification(
    assets: { symbol: string | null; value: number }[]
): { sector: string; percent: number; value: number }[] {
    const totalValue = assets.reduce((sum, a) => sum + a.value, 0)
    if (totalValue === 0) return []

    const bySector: Record<string, number> = {}

    for (const asset of assets) {
        const sector = getSector(asset.symbol)
        bySector[sector] = (bySector[sector] || 0) + asset.value
    }

    return Object.entries(bySector)
        .map(([sector, value]) => ({
            sector,
            value,
            percent: Math.round((value / totalValue) * 100)
        }))
        .sort((a, b) => b.value - a.value)
}

/**
 * Calculate diversification score (0-10)
 * Higher score = better diversification
 */
export function calculateDiversificationScore(
    breakdown: { percent: number }[]
): number {
    if (breakdown.length === 0) return 0
    if (breakdown.length === 1) return 1

    // Use Herfindahl-Hirschman Index (HHI) approach
    // Lower concentration = higher score
    const hhi = breakdown.reduce((sum, item) => sum + Math.pow(item.percent / 100, 2), 0)

    // Convert HHI to 0-10 score (HHI of 1 = all in one = score 0, HHI of 0.1 = well diversified = score 10)
    const score = Math.round((1 - hhi) * 10)
    return Math.max(0, Math.min(10, score))
}
