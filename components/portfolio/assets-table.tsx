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
import { AssetLogo } from "./asset-logo"

export interface Asset {
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
    type: "stock" | "fund" | "etf" | "crypto" | "cash"
}

export interface Account {
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

export interface Transaction {
    id: string
    date: string
    account: string
    type: "buy" | "sell" | "dividend" | "deposit"
    asset: string
    amount: number
    value: number
}

interface AssetsTableProps {
    accounts?: Account[]
    transactions?: Transaction[]
}

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

export function AssetsTable({ accounts = [], transactions = [] }: AssetsTableProps) {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
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
                        {accounts.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                No accounts found.
                            </div>
                        ) : (
                            accounts.map((account) => (
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
                                                {account.type === "PEA" ? "🔵" : account.type === "CRYPTO" ? "🪙" : "💼"}
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
                                                {account.totalPnl >= 0 ? "+" : ""}{account.totalPnlPercent.toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assets Expansion */}
                                    {expandedRows[account.id] && account.assets.length > 0 && (
                                        <div className="bg-background/50 divide-y divide-border/50 border-t border-border/50">
                                            {account.assets.map(asset => (
                                                <div key={asset.id} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-secondary/20 transition-colors items-center text-sm">
                                                    <div className="col-span-5 pl-11 flex items-center gap-3">
                                                        <div className="w-8 h-8 shrink-0">
                                                            <AssetLogo
                                                                name={asset.name}
                                                                ticker={asset.ticker}
                                                                isin={asset.isin}
                                                                className="w-full h-full"
                                                            />
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
                                                    <div className="col-span-2 text-right text-muted-foreground">€{formatCurrencyPrecise(asset.price)}</div> {/* Using current price as market price for now */}

                                                    <div className="col-span-1 text-right font-medium">
                                                        €{Math.round(asset.value)}
                                                    </div>
                                                    <div className="col-span-1 text-right">
                                                        <div className={cn("text-xs", asset.pnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                                            {asset.pnl >= 0 ? "+" : ""}{asset.pnl.toFixed(2)}
                                                        </div>
                                                        <div className={cn("text-[10px]", asset.pnlPercent >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                                            {asset.pnlPercent >= 0 ? "+" : ""}{asset.pnlPercent.toFixed(2)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
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
                        {transactions.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                No transactions found.
                            </div>
                        ) : (
                            transactions.map((tx) => (
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
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
