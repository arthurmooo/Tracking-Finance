
// Generate 2 years of daily snapshots
const generateSnapshots = () => {
    const snapshots = []
    const today = new Date()
    let currentValue = 110000

    for (let i = 730; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)

        // Random walk with drift
        const change = (Math.random() - 0.45) * 500 // Slight upward drift
        currentValue += change

        snapshots.push({
            date: date.toISOString().split('T')[0],
            netWorth: Math.round(currentValue),
            totalNetWorth: Math.round(currentValue).toString()
        })
    }
    return snapshots
}

export const demoData = {
    user: {
        email: "arthur@wealth.com",
        currency: "EUR",
    },
    institutions: [
        { name: "Boursorama Banque" },
        { name: "Trade Republic" },
        { name: "Binance" },
        { name: "Amundi" },
    ],
    portfolios: [
        { id: "p1", name: "PEA Boursorama", type: "PEA", institutionIndex: 0 },
        { id: "p2", name: "Compte Titres TR", type: "CTO", institutionIndex: 1 },
        { id: "p3", name: "Crypto Wallet", type: "CRYPTO", institutionIndex: 2 },
        { id: "p4", name: "Épargne Salariale", type: "PEE", institutionIndex: 3 },
    ],
    assets: [
        { name: "Amundi MSCI World", symbol: "CW8.PA", quantity: 154, price: 498.20, type: "ETF", portfolioIndex: 0 },
        { name: "LVMH", symbol: "MC.PA", quantity: 12, price: 780.50, type: "STOCK", portfolioIndex: 0 },
        { name: "Air Liquide", symbol: "AI.PA", quantity: 45, price: 168.40, type: "STOCK", portfolioIndex: 0 },
        { name: "NVIDIA", symbol: "NVDA", quantity: 20, price: 920.00, type: "STOCK", portfolioIndex: 1 },
        { name: "Bitcoin", symbol: "BTC", quantity: 0.45, price: 62000.00, type: "CRYPTO", portfolioIndex: 2 },
        { name: "Ethereum", symbol: "ETH", quantity: 4.2, price: 3400.00, type: "CRYPTO", portfolioIndex: 2 },
        { name: "Amundi Cash", symbol: "CASH", quantity: 12000, price: 1.00, type: "CASH", portfolioIndex: 3 },
    ],
    snapshots: generateSnapshots()
};
