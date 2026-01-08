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

// ISIN to Region mappings (specific override for known ISINs)
export const ISIN_TO_REGION: Record<string, string> = {
    // Amundi PEA ETFs
    'FR0013412269': 'United States', // US TECH
    'FR0013412020': 'United States', // MSCI USA
    'FR0010755611': 'United States', // USA LEVERAGED
    'FR0011869320': 'Emerging Markets', // INDIA
    'FR0013412012': 'Emerging Markets', // EMERGING ASIA
    'FR0013411998': 'Europe', // EURO STOXX
    'FR0007052782': 'Europe', // CAC 40
    'FR0000120271': 'Europe', // TOTALENERGIES
    'FR0000121972': 'Europe', // SCHNEIDER
    'FR0000120578': 'Healthcare', // SANOFI (mapped in sector, region is Europe)
    'FR0000121014': 'Europe', // LVMH
    'FR0000120073': 'Europe', // AIR LIQUIDE
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
    'FR0013412269': 'Technology', // US TECH ETF

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
    'FR0000121014': 'Consumer Discretionary', // LVMH ISIN

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
    'FR0000120578': 'Healthcare', // SANOFI ISIN

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
    'FR0000120271': 'Energy', // TOTALENERGIES ISIN

    // Industrials
    'AIR.PA': 'Industrials',
    'BA': 'Industrials',
    'CAT': 'Industrials',
    'HON': 'Industrials',
    'UPS': 'Industrials',
    'SIE.DE': 'Industrials',
    'FR0000121972': 'Industrials', // SCHNEIDER ISIN
    'FR0000120073': 'Materials', // AIR LIQUIDE ISIN (often classified as Materials/Chemicals)

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

// Product Fees (TER) Mapping (Annual %)
export const TICKER_TO_FEES: Record<string, number> = {
    // ETFs
    'CW8': 0.38, 'CW8.PA': 0.38,
    'MWRD': 0.38, 'MWRD.PA': 0.38,
    'EWZ': 0.59,
    'FR0013412269': 0.30, // Amundi US Tech
    'FR0013412012': 0.20, // Amundi Emerging Asia
    'FR0011869320': 0.85, // Amundi India
    'FR0010755611': 0.35, // Amundi USA Leveraged
    // Default for stocks is 0 (direct holding costs handled by platform fees)
}

// Platform Fees (Annual %) - Estimated defaults
export const PLATFORM_FEES: Record<string, number> = {
    'PEA': 0.0, // Usually 0 custody fees
    'CTO': 0.0, // Usually 0 custody fees for neo-brokers
    'AV': 0.60, // Assurance Vie typical management fee
    'PER': 0.60, // PER typical management fee
}

/**
 * Get product fee (TER) for a ticker
 */
export function getProductFee(symbol: string | null | undefined): number {
    if (!symbol) return 0
    const upper = symbol.toUpperCase()
    if (TICKER_TO_FEES[upper] !== undefined) return TICKER_TO_FEES[upper]
    // Check if it's an ETF (heuristic)
    if (upper.includes('ETF') || upper.startsWith('FR')) return 0.20 // Default ETF assumption
    return 0 // Stocks default to 0
}

/**
 * Get region for a ticker/ISIN/Name, with intelligent fallback
 */
export function getRegion(symbol: string | null | undefined, name: string | null | undefined = null): string {
    // 1. Name-based match (Priority if symbol is missing or generic)
    if (name) {
        const upName = name.toUpperCase()
        if (upName.includes('USA') || upName.includes('AMERIQUE') || upName.includes('S&P 500') || upName.includes('NASDAQ')) return 'United States'
        if (upName.includes('INDIA') || upName.includes('INDE')) return 'Emerging Markets'
        if (upName.includes('EMERGING') || upName.includes('EMERGENTE')) return 'Emerging Markets'
        if (upName.includes('CHINA') || upName.includes('CHINE')) return 'Asia'
        if (upName.includes('ASIA') || upName.includes('ASIE')) return 'Asia'
        if (upName.includes('JAPAN') || upName.includes('JAPON')) return 'Asia'
        if (upName.includes('EUROPE') || upName.includes('EURO') || upName.includes('STOXX')) return 'Europe'
        if (upName.includes('WORLD') || upName.includes('MONDE') || upName.includes('GLOBAL')) return 'World'
    }

    if (!symbol) return 'Other'

    const upper = symbol.toUpperCase()

    // 2. ISIN match
    if (ISIN_TO_REGION[upper]) return ISIN_TO_REGION[upper]

    // 3. Ticker exact match
    if (TICKER_TO_REGION[upper]) return TICKER_TO_REGION[upper]

    // 4. Base ticker (without suffix)
    const baseTicker = upper.split('.')[0]
    if (TICKER_TO_REGION[baseTicker]) return TICKER_TO_REGION[baseTicker]

    // 5. Exchange suffix inference
    if (symbol.includes('.PA') || symbol.includes('.AS') || symbol.includes('.DE') ||
        symbol.includes('.SW') || symbol.includes('.L')) {
        return 'Europe'
    }
    if (symbol.includes('.T') || symbol.includes('.KS') || symbol.includes('.HK')) {
        return 'Asia'
    }

    // 6. ISIN Country Code Inference (if 12 chars length)
    if (upper.length === 12) {
        if (upper.startsWith('US')) return 'United States'
        if (upper.startsWith('FR') || upper.startsWith('DE') || upper.startsWith('IE') || upper.startsWith('LU')) return 'Europe'
        if (upper.startsWith('JP') || upper.startsWith('CN')) return 'Asia'
    }

    // 7. Standard US Ticker format
    if (/^[A-Z]{1,5}$/.test(upper)) {
        return 'United States'
    }

    return 'Other'
}

/**
 * Get sector for a ticker/ISIN/Name, with intelligent fallback
 */
export function getSector(symbol: string | null | undefined, name: string | null | undefined = null): string {
    // 1. Name-based match
    if (name) {
        const upName = name.toUpperCase()
        if (upName.includes('TECH')) return 'Technology'
        if (upName.includes('HEALTH') || upName.includes('SANTE') || upName.includes('ROBOT')) return 'Healthcare'
        if (upName.includes('ENERGY') || upName.includes('ENERGIE') || upName.includes('OIL')) return 'Energy'
        if (upName.includes('BANK') || upName.includes('BANQUE') || upName.includes('FINANCE')) return 'Financials'
        if (upName.includes('ESTATE') || upName.includes('IMMOBILIER')) return 'Real Estate'
        if (upName.includes('CONSUMER') || upName.includes('CONSOMMATION')) return 'Consumer Discretionary'
    }

    if (!symbol) return 'Other'

    const upper = symbol.toUpperCase()

    // 2. Exact match (Ticker or ISIN)
    if (TICKER_TO_SECTOR[upper]) return TICKER_TO_SECTOR[upper]

    // 3. Base ticker
    const baseTicker = upper.split('.')[0]
    if (TICKER_TO_SECTOR[baseTicker]) return TICKER_TO_SECTOR[baseTicker]

    // 4. ETF Logic (if diversified country/region ETF)
    if (upper.startsWith('FR') || upper.includes('ETF')) {
        return 'Diversified'
    }

    return 'Other'
}

/**
 * Calculate geographic diversification from assets
 */
export function calculateGeographicDiversification(
    assets: { symbol: string | null; name?: string; value: number }[]
): { region: string; percent: number; value: number }[] {
    const totalValue = assets.reduce((sum, a) => sum + a.value, 0)
    if (totalValue === 0) return []

    const byRegion: Record<string, number> = {}

    for (const asset of assets) {
        const region = getRegion(asset.symbol, asset.name)
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
    assets: { symbol: string | null; name?: string; value: number }[]
): { sector: string; percent: number; value: number }[] {
    const totalValue = assets.reduce((sum, a) => sum + a.value, 0)
    if (totalValue === 0) return []

    const bySector: Record<string, number> = {}

    for (const asset of assets) {
        const sector = getSector(asset.symbol, asset.name)
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
