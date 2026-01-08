
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

async function test() {
    const symbols = ['MC.PA', 'FR0000121014', 'CW8.PA'];

    // suppress warnings
    const consoleWarn = console.warn;
    console.warn = () => { };

    for (const s of symbols) {
        try {
            let ticker = s;
            // ISIN logic
            if (/^[A-Z]{2}[A-Z0-9]{10}$/.test(s)) {
                const searchRes = await yahooFinance.search(s);
                if (searchRes.quotes && searchRes.quotes.length > 0) {
                    ticker = searchRes.quotes[0].symbol;
                    console.log(`Resolved ${s} -> ${ticker}`);
                } else {
                    console.log(`Could not resolve ISIN ${s}`);
                    continue;
                }
            }

            const res = await yahooFinance.quoteSummary(ticker, { modules: ['summaryDetail', 'price'] });
            console.log(`\n--- ${s} (Ticker: ${ticker}) ---`);
            // console.log(JSON.stringify(res.summaryDetail, null, 2));
            console.log('Yield:', res.summaryDetail?.dividendYield);
            console.log('Rate:', res.summaryDetail?.dividendRate);
            console.log('Trailing Annual Div Yield:', res.summaryDetail?.trailingAnnualDividendYield);
            console.log('Trailing Annual Div Rate:', res.summaryDetail?.trailingAnnualDividendRate);
        } catch (e: any) {
            console.log(`Error for ${s}:`, e.message);
        }
    }
}

test();
