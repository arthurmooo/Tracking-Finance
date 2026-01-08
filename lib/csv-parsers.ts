import Papa from 'papaparse';

export interface ParsedAsset {
    symbol?: string;
    isin?: string;
    name: string;
    quantity: number;
    price?: number;      // Current/last price
    buyPrice?: number;   // Purchase/cost price for P&L
    currency: string;
    type: 'STOCK' | 'ETF' | 'CRYPTO' | 'REAL_ESTATE' | 'CROWDFUNDING' | 'CASH' | 'PRIVATE_EQUITY' | 'STARTUP';
}

export type CsvParserError = {
    row: number;
    message: string;
};

export type CsvParserResult = {
    assets: ParsedAsset[];
    errors: CsvParserError[];
};

// Helper: Clean number strings (e.g. "1 250,50" -> 1250.50)
const parseFrenchNumber = (str: string | undefined): number => {
    if (!str) return 0;
    // Remove spaces and replace comma with dot
    const clean = str.replace(/\s/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
};

// Helper: Clean English number strings (e.g. "1,250.50" -> 1250.50)
const parseEnglishNumber = (str: string | undefined): number => {
    if (!str) return 0;
    // Remove commas
    const clean = str.replace(/,/g, '');
    return parseFloat(clean) || 0;
};

/**
 * IBKR Parser
 * Target section: "Positions ouvertes" (Open Positions)
 */
export const parseIbkrCsv = (csvText: string): CsvParserResult => {
    const assets: ParsedAsset[] = [];
    const errors: CsvParserError[] = [];

    // Parse the full CSV without headers first to navigate the structure
    const parsed = Papa.parse<string[]>(csvText, {
        header: false,
        skipEmptyLines: true,
    });

    const rows = parsed.data;

    // 1. Find the header line for "Positions ouvertes"
    // It usually looks like: "Positions ouvertes,Header,DataDiscriminator,..."
    // In the provided example: line 37 "Positions ouvertes,Header,DataDiscriminator,..."
    let headerRowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
        if (rows[i][0] === 'Positions ouvertes' && rows[i][1] === 'Header') {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1) {
        return { assets, errors: [{ row: 0, message: "Could not find 'Positions ouvertes' section in IBKR CSV." }] };
    }

    const headers = rows[headerRowIndex];
    // Map column names to indices
    const colMap: Record<string, number> = {};
    headers.forEach((h, idx) => {
        colMap[h] = idx;
    });

    // Verify required columns exist
    // Example headers: "Symbole", "Quantité", "Cours de clôture" (or "Close Price"), "Devise" (Currency)
    if (colMap['Symbole'] === undefined || colMap['Quantité'] === undefined) {
        return { assets, errors: [{ row: headerRowIndex, message: "Missing required columns (Symbole, Quantité) in IBKR CSV." }] };
    }

    // 2. Iterate data rows immediately following headers
    // Data rows start with "Positions ouvertes,Data,Summary,..."
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];

        // Stop if we leave the "Positions ouvertes" section (or hit Total)
        if (row[0] !== 'Positions ouvertes') continue; // Should be impossible if contiguous, but safe
        if (row[1] !== 'Data') continue; // Skip headers or weird lines
        if (row[2] !== 'Summary') continue; // We only want individual asset lines, usually marked "Summary"

        // Extract Data
        const symbol = row[colMap['Symbole']];
        const quantityStr = row[colMap['Quantité']];
        const priceStr = row[colMap['Cours de clôture']];
        const valueStr = row[colMap['Valeur']]; // Market value in asset currency
        const costStr = row[colMap["Coût d'acquisition"]]; // Cost basis for P&L
        const currency = row[colMap['Devise']] || 'USD';
        const assetCategory = row[colMap["Catégorie d'actifs"]] || 'STOCK';

        // Type mapping
        let type: ParsedAsset['type'] = 'STOCK';
        if (assetCategory === 'Actions') type = 'STOCK';

        const quantity = parseEnglishNumber(quantityStr);
        const price = parseEnglishNumber(priceStr);
        const value = parseEnglishNumber(valueStr);
        const cost = parseEnglishNumber(costStr);

        // Use value/quantity as effective price if we have value
        const effectivePrice = quantity > 0 && value > 0 ? value / quantity : price;
        // Calculate buy price from cost basis
        const buyPriceCalc = quantity > 0 && cost > 0 ? cost / quantity : undefined;

        assets.push({
            symbol: symbol,
            name: symbol,
            quantity: quantity,
            price: effectivePrice,
            buyPrice: buyPriceCalc, // For P&L calculation
            currency: currency,
            type: type
        });
    }

    return { assets, errors };
};

/**
 * BienPreter Parser
 * Simple columnar CSV
 */
export const parseBienPreterCsv = (csvText: string): CsvParserResult => {
    const assets: ParsedAsset[] = [];
    const errors: CsvParserError[] = [];

    const parsed = Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: true,
        delimiter: ';', // French CSVs often use semi-colon
        transformHeader: (h) => h.trim().replace(/^"|"$/g, '').trim() // Clean quotes and spaces from headers
    });

    // Helper to find column case-insensitive
    const findKey = (row: Record<string, string>, target: string) => {
        return Object.keys(row).find(k => k.toLowerCase().includes(target.toLowerCase()));
    }

    parsed.data.forEach((row, index) => {
        // Required: "Projet" and "Montant"
        // Use fuzzy matching for critical columns
        const projectKey = findKey(row, 'Projet');
        const amountKey = findKey(row, 'Montant');

        if (!projectKey || !amountKey || !row[projectKey] || !row[amountKey]) {
            // Only report error if row looks somewhat valid (not empty junk)
            if (Object.keys(row).length > 2) errors.push({ row: index, message: "Missing Projet or Montant" });
            return;
        }

        const project = row[projectKey];
        const amount = parseFrenchNumber(row[amountKey]);

        // Fuzzy match other columns
        const statusKey = findKey(row, 'Statut');
        const rateKey = findKey(row, 'Taux');
        const durationKey = findKey(row, 'Durée');
        const companyKey = findKey(row, 'Entreprise');
        const netInterestKey = findKey(row, 'Intérêts nets');
        const mensualiteKey = findKey(row, 'Mensualité');
        const startDateKey = findKey(row, 'Date de financement');
        const endDateKey = findKey(row, 'Date de clôture');

        const status = statusKey ? row[statusKey] : '';
        const rate = rateKey ? parseFrenchNumber(row[rateKey]) : 0;
        const duration = durationKey ? parseFrenchNumber(row[durationKey]) : 0;
        const company = companyKey ? row[companyKey] : '';
        const netInterestTotal = netInterestKey ? parseFrenchNumber(row[netInterestKey]) : 0;
        const mensualite = mensualiteKey ? parseFrenchNumber(row[mensualiteKey]) : 0;
        const startDateStr = startDateKey ? row[startDateKey] : '';
        const endDateStr = endDateKey ? row[endDateKey] : '';

        // Store all metadata as JSON in symbol field
        const metadata = JSON.stringify({
            rate,
            duration,
            company,
            status,
            netInterestTotal,
            mensualite,
            startDate: startDateStr,
            endDate: endDateStr
        });

        assets.push({
            name: project,
            symbol: metadata, // Store metadata as JSON in symbol field (temporary solution)
            quantity: 1,
            price: amount,
            currency: 'EUR',
            type: 'CROWDFUNDING'
        });
    });

    return { assets, errors };
};

/**
 * Generic Parser (PEA / AV)
 * Attempts to map columns intelligently
 */
export const parseGenericCsv = (csvText: string): CsvParserResult => {
    const assets: ParsedAsset[] = [];
    const errors: CsvParserError[] = [];

    // Detect delimiter
    const firstLine = csvText.split('\n')[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';

    const parsed = Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: true,
        delimiter: delimiter,
    });

    const headers = parsed.meta.fields || [];

    // Smart Column Mapping
    const findCol = (candidates: string[]) => headers.find(h => candidates.some(c => h.toLowerCase().includes(c)));

    const nameCol = findCol(['name', 'nom', 'libellé', 'valeur', 'titre']);
    const isinCol = findCol(['isin', 'code']);
    const symbolCol = findCol(['symbol', 'ticker']);
    const qtyCol = findCol(['quantity', 'quantité', 'qte', 'qté']);
    // IMPORTANT: Check for specific 'lastprice' FIRST before generic 'price' to avoid matching 'buyingPrice'
    const priceCol = findCol(['lastprice', 'cours']) || findCol(['price', 'prix', 'valeur du jour']);
    // buyingPrice for cost basis (if needed)
    const buyPriceCol = findCol(['buyingprice', 'prix revient', 'pru']);
    // AV Specific: sometimes "Montant" is the total value, and we don't have price/qty split clearly
    const valueCol = findCol(['montant', 'value', 'valorisation', 'amount']);

    if (!nameCol) {
        return { assets, errors: [{ row: 0, message: "Could not detect a Name/Label column." }] };
    }

    parsed.data.forEach((row, index) => {
        const name = row[nameCol];
        if (!name) return;

        let quantity = 0;
        let price = 0;
        let buyPrice = 0;

        // Strategy 1: Has Quantity and Price
        if (qtyCol) {
            quantity = parseFrenchNumber(row[qtyCol]);
            if (priceCol) {
                price = parseFrenchNumber(row[priceCol]);
            }
            if (buyPriceCol) {
                buyPrice = parseFrenchNumber(row[buyPriceCol]);
            }
        }
        // Strategy 2: Only has Value (no qty/price split) -> Qty=1, Price=Value
        else if (valueCol) {
            quantity = 1;
            price = parseFrenchNumber(row[valueCol]);
        }

        // Fallback for types
        let type: ParsedAsset['type'] = 'STOCK';
        if (name.toLowerCase().includes('etf') || name.toLowerCase().includes('amundi')) type = 'ETF';
        if (name.toLowerCase().includes('scpi') || name.toLowerCase().includes('reim')) type = 'REAL_ESTATE';

        assets.push({
            name: name,
            isin: isinCol ? row[isinCol] : undefined,
            symbol: symbolCol ? row[symbolCol] : undefined,
            quantity: quantity,
            price: price,
            buyPrice: buyPrice > 0 ? buyPrice : undefined, // Only include if we have it
            currency: 'EUR',
            type: type
        });
    });

    return { assets, errors };
};
