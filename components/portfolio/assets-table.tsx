"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ChevronRight, ChevronDown, Check, AlertCircle } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock Data Types
interface Asset {
    id: string
    name: string
    ticker?: string
    isin?: string
    quantity: number
    price: number
    value: number
    pnl: number
    pnlPercent: number
    currency: string
    type: "stock" | "fund" | "etf"
}

interface Account {
    id: string
    name: string
    type: string
    icon: string
    totalValue: number
    totalPnl: number
    totalPnlPercent: number
    error?: string
    assets: Asset[]
}

// Mock Transaction Data
interface Transaction {
    id: string
    date: string
    account: string
    type: "buy" | "sell" | "dividend" | "deposit"
    asset: string
    amount: number
    value: number
}

const transactionsData: Transaction[] = [
    { id: "t1", date: "2026-01-05", account: "PEA MO", type: "buy", asset: "Amundi Global Ecology", amount: 0.1, value: 50 },
    { id: "t2", date: "2026-01-03", account: "PEA MO", type: "dividend", asset: "MSCI World ETF", amount: 0, value: 12.50 },
    { id: "t3", date: "2025-12-20", account: "Contrat N° 52126995", type: "buy", asset: "Parvest Equity World", amount: 0.2, value: 26 },
    { id: "t4", date: "2025-12-15", account: "Arthur Mo", type: "deposit", asset: "-", amount: 0, value: 100 },
]

// Mock Data
const accountsData: Account[] = [
    {
        id: "1",
        name: "PEA MO",
        type: "PEA",
        icon: "🔵", // Placeholder for actual icon
        totalValue: 11625,
        totalPnl: 184,
        totalPnlPercent: 1.61,
        assets: [
            // Can add assets here if needed for expansion logic
            {
                id: "a1", name: "Amundi Global Ecology ESG A EUR (C)", isin: "LU1883318740",
                quantity: 0.2, price: 502.94, value: 103, pnl: 0.64, pnlPercent: 0.62, currency: "EUR", type: "fund"
            }
        ]
    },
    {
        id: "2",
        name: "Arthur Mo",
        type: "Bank",
        icon: "🔴",
        totalValue: 473,
        totalPnl: 52,
        totalPnlPercent: 12.31,
        error: "PROVIDER ERROR",
        assets: []
    },
    {
        id: "3",
        name: "Contrat N° 52126995",
        type: "Life Insurance",
        icon: "🔵",
        totalValue: 307,
        totalPnl: 3,
        totalPnlPercent: 0.99,
        assets: [
            {
                id: "a1", name: "Amundi Global Ecology ESG A EUR (C)", isin: "LU1883318740",
                quantity: 0.2, price: 502.94, value: 103, pnl: 0.64, pnlPercent: 0.62, currency: "EUR", type: "fund"
            },
            {
                id: "a2", name: "Parvest Equity World Emerging Classic", isin: "LU0823413074",
                quantity: 0.38, price: 130.89, value: 54.15, pnl: 0.69, pnlPercent: 1.30, currency: "EUR", type: "fund"
            },
            {
                id: "a3", name: "Edmond de Rothschild China Class A-EUR", isin: "LU1160365091",
                quantity: 0.15, price: 338.98, value: 52.06, pnl: 2.00, pnlPercent: 3.93, currency: "EUR", type: "fund"
            },
            {
                id: "a4", name: "Morgan Stanley US Growth AH", isin: "LU0266117414",
                quantity: 0.35, price: 140.41, value: 49.77, pnl: -0.31, pnlPercent: -0.61, currency: "EUR", type: "fund"
            },
            {
                id: "a5", name: "Morgan Stanley US Advantage Fund A", isin: "LU0225737302",
                quantity: 0.34, price: 148.69, value: 47.52, pnl: -0.01, pnlPercent: 0, currency: "EUR", type: "fund"
            },
        ]
    }

]

type ViewTab = 'accounts' | 'transactions'
type TimeRange = 'YTD' | '1M' | '3M' | '6M' | '1Y' | 'ALL'

const timeRangeOptions: { id: TimeRange; label: string }[] = [
    { id: 'YTD', label: 'Year to date' },
    { id: '1M', label: 'Last month' },
    { id: '3M', label: 'Last 3 months' },
    { id: '6M', label: 'Last 6 months' },
    { id: '1Y', label: 'Last year' },
    { id: 'ALL', label: 'All time' },
]

export function AssetsTable() {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({ "3": true });
    const [activeTab, setActiveTab] = useState<ViewTab>('accounts')
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('YTD')

    const toggleRow = (id: string) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    }

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
    const formatCurrencyPrecise = (val: number) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(val);

    const selectedTimeRangeLabel = timeRangeOptions.find(t => t.id === selectedTimeRange)?.label || 'Year to date'

    return (
        <div className="space-y-4 pt-8 pb-12">
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-border pb-0 mb-6">
                <button
                    onClick={() => setActiveTab('accounts')}
                    className={cn(
                        "pb-3 font-medium text-sm transition-colors",
                        activeTab === 'accounts'
                            ? "text-foreground border-b-2 border-primary"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Accounts
                </button>
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={cn(
                        "pb-3 font-medium text-sm transition-colors",
                        activeTab === 'transactions'
                            ? "text-foreground border-b-2 border-primary"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Transactions
                </button>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">{activeTab === 'accounts' ? 'Assets' : 'Transaction History'}</h3>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-sidebar-border text-xs font-medium hover:bg-secondary/50 transition-colors">
                            {selectedTimeRangeLabel} <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {timeRangeOptions.map((range) => (
                            <DropdownMenuItem
                                key={range.id}
                                onClick={() => setSelectedTimeRange(range.id)}
                                className="flex items-center justify-between"
                            >
                                {range.label}
                                {selectedTimeRange === range.id && <Check className="h-4 w-4 text-primary" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {activeTab === 'accounts' ? (
                <div className="rounded-lg border border-border overflow-hidden bg-card/50">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-muted-foreground border-b border-border bg-card">
                        <div className="col-span-5">Name</div>
                        <div className="col-span-1 text-right">Amount</div>
                        <div className="col-span-2 text-right">Average Cost</div>
                        <div className="col-span-2 text-right">Market price</div>
                        <div className="col-span-1 text-right">Value <span className="text-[10px]">▼</span></div>
                        <div className="col-span-1 text-right">{selectedTimeRange} P&L</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-border">
                        {accountsData.map((account) => (
                            <div key={account.id} className="group">
                                {/* Account Row */}
                                <div
                                    className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-secondary/30 transition-colors items-center cursor-pointer select-none"
                                    onClick={() => toggleRow(account.id)}
                                >
                                    <div className="col-span-5 flex items-center gap-3">
                                        <button className="text-muted-foreground hover:text-foreground">
                                            {expandedRows[account.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </button>
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-lg">
                                            {/* Placeholder Icon Logic */}
                                            {account.id === "2" ? "🔴" : "🔷"}
                                        </div>
                                        <span className="font-medium">{account.name}</span>
                                        {account.error && (
                                            <Badge variant="destructive" className="ml-2 h-5 px-2 text-[10px] bg-amber-900/30 text-amber-500 border border-amber-900/50 hover:bg-amber-900/40 font-normal flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {account.error}
                                            </Badge>
                                        )}
                                    </div>
                                    {/* Empty columns for aggregate row to match design spacing */}
                                    <div className="col-span-1" />
                                    <div className="col-span-2" />
                                    <div className="col-span-2" />

                                    <div className="col-span-1 text-right font-medium">
                                        {formatCurrency(account.totalValue)}
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <div className={cn("text-xs font-medium", account.totalPnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                            {account.totalPnl >= 0 ? "+" : ""}{formatCurrency(account.totalPnl)}
                                        </div>
                                        <div className={cn("text-[10px] font-medium inline-block px-1 rounded-sm mt-0.5", account.totalPnl >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
                                            {account.totalPnl >= 0 ? "+" : ""}{account.totalPnlPercent}%
                                        </div>
                                    </div>
                                </div>

                                {/* Assets Expansion */}
                                {expandedRows[account.id] && account.assets.length > 0 && (
                                    <div className="bg-background/50 divide-y divide-border/50 border-t border-border/50">
                                        {account.assets.map(asset => (
                                            <div key={asset.id} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-secondary/20 transition-colors items-center text-sm">
                                                <div className="col-span-5 pl-11 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-border p-1 shrink-0">
                                                        {/* Placeholder for asset logo */}
                                                        <div className="w-full h-full bg-gray-100 rounded-full" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <div className="font-medium truncate text-foreground">{asset.name}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                            {asset.isin} <span className="text-[10px] border border-border px-0.5 rounded">📄</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-span-1 text-right text-muted-foreground">{asset.quantity}</div>
                                                <div className="col-span-2 text-right text-muted-foreground">{formatCurrencyPrecise(asset.price)}</div>
                                                <div className="col-span-2 text-right text-muted-foreground">€{asset.price + 12}</div> {/* Mock Market Price */}

                                                <div className="col-span-1 text-right font-medium">
                                                    €{Math.round(asset.value)}
                                                </div>
                                                <div className="col-span-1 text-right">
                                                    <div className={cn("text-xs", asset.pnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                                        {asset.pnl >= 0 ? "+" : ""}{asset.pnl}
                                                    </div>
                                                    <div className={cn("text-[10px]", asset.pnlPercent >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                                        {asset.pnlPercent >= 0 ? "+" : ""}{asset.pnlPercent}%
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // Transactions View
                <div className="rounded-lg border border-border overflow-hidden bg-card/50">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-muted-foreground border-b border-border bg-card">
                        <div className="col-span-2">Date</div>
                        <div className="col-span-3">Account</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-3">Asset</div>
                        <div className="col-span-2 text-right">Value</div>
                    </div>

                    {/* Transaction Rows */}
                    <div className="divide-y divide-border">
                        {transactionsData.map((tx) => (
                            <div key={tx.id} className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-secondary/30 transition-colors items-center">
                                <div className="col-span-2 text-sm text-muted-foreground">{tx.date}</div>
                                <div className="col-span-3 text-sm font-medium">{tx.account}</div>
                                <div className="col-span-2">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[10px] capitalize",
                                            tx.type === 'buy' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                                            tx.type === 'sell' && "bg-rose-500/10 text-rose-500 border-rose-500/20",
                                            tx.type === 'dividend' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                                            tx.type === 'deposit' && "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                        )}
                                    >
                                        {tx.type}
                                    </Badge>
                                </div>
                                <div className="col-span-3 text-sm truncate">{tx.asset}</div>
                                <div className="col-span-2 text-right text-sm font-medium">
                                    {formatCurrencyPrecise(tx.value)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
