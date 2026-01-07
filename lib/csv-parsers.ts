import Papa from 'papaparse';

export interface ParsedAsset {
    symbol?: string;
    isin?: string;
    name: string;
    quantity: number;
    price?: number;
    currency: string;
    type: 'STOCK' | 'ETF' | 'CRYPTO' | 'REAL_ESTATE' | 'CROWDFUNDING' | 'CASH';
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
        const currency = row[colMap['Devise']] || 'EUR';
        const assetCategory = row[colMap["Catégorie d'actifs"]] || 'STOCK'; // "Actions"

        // Type mapping
        let type: ParsedAsset['type'] = 'STOCK';
        if (assetCategory === 'Actions') type = 'STOCK';
        // Add more mappings if needed

        assets.push({
            symbol: symbol,
            name: symbol, // IBKR doesn't always give full name in this view, Symbole is ticker
            quantity: parseEnglishNumber(quantityStr), // IBKR CSV usually uses dots for decimals in raw data, but let's be careful. The example shows "0.5855", so standard float.
            price: parseEnglishNumber(priceStr),
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
    });

    parsed.data.forEach((row, index) => {
        // Required: "Projet" and "Montant"
        if (!row['Projet'] || !row['Montant']) {
            // Only report error if row looks somewhat valid (not empty junk)
            if (Object.keys(row).length > 2) errors.push({ row: index, message: "Missing Projet or Montant" });
            return;
        }

        const status = row['Statut'];
        // Optional: Filter only active loans?
        // if (status !== 'Prêt en cours') return;

        assets.push({
            name: row['Projet'],
            quantity: 1, // Crowdfunding project = 1 unit
            price: parseFrenchNumber(row['Montant']), // Price = Invested Amount
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
    const priceCol = findCol(['price', 'prix', 'cours', 'valeur du jour', 'lastprice']);
    // AV Specific: sometimes "Montant" is the total value, and we don't have price/qty split clearly
    const valueCol = findCol(['montant', 'value', 'valorisation']);

    if (!nameCol) {
        return { assets, errors: [{ row: 0, message: "Could not detect a Name/Label column." }] };
    }

    parsed.data.forEach((row, index) => {
        const name = row[nameCol];
        if (!name) return;

        let quantity = 0;
        let price = 0;

        // Strategy 1: Has Quantity and Price
        if (qtyCol) {
            quantity = parseFrenchNumber(row[qtyCol]);
            if (priceCol) {
                price = parseFrenchNumber(row[priceCol]);
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
            currency: 'EUR',
            type: type
        });
    });

    return { assets, errors };
};
