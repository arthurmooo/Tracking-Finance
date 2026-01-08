"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface AssetLogoProps {
    name: string
    ticker?: string
    isin?: string
    className?: string
}

// Manual mapping for common tickers to domains
const TICKER_DOMAIN_MAP: Record<string, string> = {
    // US Tech
    "META": "meta.com",
    "AAPL": "apple.com",
    "MSFT": "microsoft.com",
    "AMZN": "amazon.com",
    "GOOG": "google.com",
    "GOOGL": "google.com",
    "TSLA": "tesla.com",
    "NVDA": "nvidia.com",
    "NFLX": "netflix.com",
    "AMD": "amd.com",
    "INTC": "intel.com",
    "PLTR": "palantir.com",
    "COIN": "coinbase.com",
    "U": "unity.com",
    "SNOW": "snowflake.com",
    "CRM": "salesforce.com",
    "ADBE": "adobe.com",
    "PYPL": "paypal.com",
    "SQ": "block.xyz",
    "SHOP": "shopify.com",
    "SPOT": "spotify.com",
    "ABNB": "airbnb.com",
    "UBER": "uber.com",
    "LYFT": "lyft.com",

    // CAC 40 / French
    "MC": "lvmh.com",
    "LVMH": "lvmh.com",
    "KER": "kering.com",
    "OR": "loreal.com",
    "RMS": "hermes.com",
    "TTE": "totalenergies.com",
    "SAN": "sanofi.com",
    "AIR": "airbus.com",
    "BNP": "mabanque.bnpparibas",
    "GLE": "societegenerale.com",
    "ACA": "credit-agricole.com",
    "CS": "axa.com",
    "ORA": "orange.com",
    "CAP": "capgemini.com",
    "DSY": "dassault-systemes.com",
    "RNO": "renault.fr",
    "STLA": "stellantis.com",
    "HO": "thalesgroup.com",
    "VIV": "vivendi.com",
    "EN": "bouygues.com",
    "DG": "vinci.com",
    "SU": "schneider-electric.com",
    "ALO": "alstom.com",

    // Others
    "IBKR": "interactivebrokers.com",
    "ASTS": "ast-science.com",
    "RDW": "redwirespace.com",
    "BKSY": "blacksky.com",
    "CCJ": "cameco.com",
    "ESLT": "elbitsystems.com",
    "QS": "quantumscape.com",
    "QCOM": "qualcomm.com",
}

// Name-based keyword mapping (more reliable than ticker matching for ETFs/funds)
// These are case-insensitive checks on asset NAME
const NAME_KEYWORD_MAP: Record<string, string> = {
    "amundi": "amundi.com",
    "air liquide": "airliquide.com",
    "totalenergies": "totalenergies.com",
    "total energies": "totalenergies.com",
    "schneider": "se.com",
    "sanofi": "sanofi.com",
    "lvmh": "lvmh.com",
    "apple": "apple.com",
    "microsoft": "microsoft.com",
    "amazon": "amazon.com",
    "google": "google.com",
    "alphabet": "google.com",
    "tesla": "tesla.com",
    "nvidia": "nvidia.com",
    "meta": "meta.com",
    "netflix": "netflix.com",
    "airbus": "airbus.com",
    "danone": "danone.com",
    "loreal": "loreal.com",
    "l'oreal": "loreal.com",
    "hermes": "hermes.com",
    "kering": "kering.com",
    "bnp": "bnpparibas.com",
    "societe generale": "societegenerale.com",
    "credit agricole": "credit-agricole.com",
    "orange": "orange.com",
    "capgemini": "capgemini.com",
    "vinci": "vinci.com",
    "thales": "thalesgroup.com",
    "renault": "renault.com",
    "stellantis": "stellantis.com",
    "palantir": "palantir.com",
    "coinbase": "coinbase.com",
    "salesforce": "salesforce.com",
    "adobe": "adobe.com",
    "paypal": "paypal.com",
    "spotify": "spotify.com",
    "airbnb": "airbnb.com",
    "uber": "uber.com",
    "shopify": "shopify.com",
}

export function AssetLogo({ name, ticker, isin, className }: AssetLogoProps) {
    const [domain, setDomain] = useState<string | null>(null)

    useEffect(() => {
        const findDomain = () => {
            // 1. Try exact ticker mapping (only for actual tickers, not single letters unless explicit)
            if (ticker && ticker.length >= 2) {
                const cleanTicker = ticker.split('.')[0].toUpperCase();
                if (TICKER_DOMAIN_MAP[cleanTicker]) {
                    return TICKER_DOMAIN_MAP[cleanTicker];
                }
            }

            // 2. Name keyword matching - search for keywords in the name
            if (name) {
                const lowerName = name.toLowerCase();
                for (const [keyword, domain] of Object.entries(NAME_KEYWORD_MAP)) {
                    if (lowerName.includes(keyword)) {
                        return domain;
                    }
                }
            }

            // 3. Fallback: use Ticker as domain
            if (ticker && ticker.length >= 2 && !ticker.includes(' ')) {
                return `${ticker.split('.')[0].toLowerCase()}.com`;
            }

            // 4. Last resort: generate domain from cleaned name
            if (name) {
                const cleanName = name
                    .toLowerCase()
                    .replace(/\b(inc|corp|ltd|sa|ag|plc|etf|ucits|acc|pea|msci)\b/g, '')
                    .replace(/[^a-z0-9]/g, '')
                    .trim();

                if (cleanName.length >= 3 && cleanName.length <= 30) {
                    return `${cleanName}.com`;
                }
            }

            return null;
        }

        const d = findDomain();
        setDomain(d);
    }, [name, ticker])

    // Multi-source strategy for Safari robustness
    // Safari might block Google, Clearbit might miss some. We try all.
    const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        if (!domain) {
            setCurrentSrc(undefined);
            return;
        }
        // Start with Clearbit (high quality), then Google, then DuckDuckGo
        setCurrentSrc(`https://logo.clearbit.com/${domain}`);
        setImgError(false);
    }, [domain]);

    const handleImgError = () => {
        if (!domain) return;

        if (currentSrc?.includes('clearbit.com')) {
            // Fallback 1: Google Favicons
            setCurrentSrc(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
        } else if (currentSrc?.includes('google.com')) {
            // Fallback 2: DuckDuckGo (privacy friendly, often works in Safari)
            setCurrentSrc(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
        } else {
            // All failed
            setImgError(true);
        }
    };

    const initials = name
        ? name.substring(0, 2).toUpperCase()
        : ticker
            ? ticker.substring(0, 2).toUpperCase()
            : "?";

    if (imgError || !currentSrc) {
        return (
            <div className={cn("h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium border border-border text-secondary-foreground", className)}>
                {initials}
            </div>
        )
    }

    return (
        <div className={cn("h-8 w-8 rounded-full bg-white border border-border overflow-hidden relative", className)}>
            <img
                src={currentSrc}
                alt={name}
                className="w-full h-full object-contain p-1"
                referrerPolicy="no-referrer"
                loading="eager"
                onError={handleImgError}
            />
            {/* Background Initials (visible while loading or if transparent) */}
            <div className="absolute inset-0 flex items-center justify-center -z-10 bg-secondary text-[10px] font-medium text-secondary-foreground">
                {initials}
            </div>
        </div>
    )
}
