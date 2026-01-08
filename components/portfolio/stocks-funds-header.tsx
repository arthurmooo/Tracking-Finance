"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { TimeRange, ViewMode } from "./stocks-funds-view"
import { updateAllPrices } from "@/actions/price-actions"
import { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

interface StocksFundsHeaderProps {
    currentValue: number
    changeValue: number
    changePercentage: number
    selectedRange: TimeRange
    onRangeChange: (range: TimeRange) => void
    viewMode: ViewMode
    onViewModeChange: (mode: ViewMode) => void
    benchmark: string
    onBenchmarkChange: (benchmark: string) => void
    chartType: "area" | "candlestick"
    onChartTypeChange: (type: "area" | "candlestick") => void
}

const timeRanges: TimeRange[] = ["1D", "7D", "1M", "YTD", "1Y", "ALL"]

export function StocksFundsHeader({
    currentValue,
    changeValue,
    changePercentage,
    selectedRange,
    onRangeChange,
    viewMode,
    onViewModeChange,
    benchmark,
    onBenchmarkChange,
    chartType,
    onChartTypeChange,
}: StocksFundsHeaderProps) {

    // Format currency
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-IE", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
        }).format(value)

    // Format date: Jan 07, 2026
    const today = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    })

    return (
        <div className="flex flex-col gap-6">
            {/* Breadcrumb / Title Area */}
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Link href="/portfolio" className="hover:text-foreground transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-xl font-medium text-foreground">Stocks & Funds</h1>
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Left Side: Value & Toggle */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{today}</p>
                        <h2 className="text-4xl font-semibold tracking-tight">
                            {formatCurrency(currentValue)}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onViewModeChange("portfolio")}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                                viewMode === "portfolio"
                                    ? "bg-secondary text-secondary-foreground border-transparent"
                                    : "bg-transparent text-muted-foreground border-transparent hover:bg-secondary/50"
                            )}
                        >
                            <div className="w-2 h-2 rounded-full bg-orange-300" />
                            Your portfolio
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">vs</span>
                            <Select value={benchmark} onValueChange={(value) => {
                                onBenchmarkChange(value)
                                // Auto-switch view mode based on benchmark selection
                                if (value !== "none") {
                                    onViewModeChange("compare")
                                } else {
                                    onViewModeChange("portfolio")
                                }
                            }}>
                                <SelectTrigger className="h-8 rounded-full bg-transparent border-sidebar-border hover:bg-secondary/50 transition-colors text-xs font-medium w-[120px]">
                                    <SelectValue placeholder="Compare" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="sp500">S&P 500</SelectItem>
                                    <SelectItem value="livreta">Livret A</SelectItem>
                                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Right Side: Chart Controls */}
                <div className="flex items-center gap-2 self-end md:self-start">
                    <RefreshButton />

                    <Select value={chartType} onValueChange={(v) => onChartTypeChange(v as any)}>
                        <SelectTrigger className="w-[110px] h-8 rounded-full bg-transparent border-sidebar-border hover:bg-secondary/50 transition-colors text-xs font-medium">
                            <SelectValue placeholder="Chart Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="area">Standard</SelectItem>
                            <SelectItem value="candlestick">Candlestick</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center bg-transparent rounded-lg p-0.5">
                        {timeRanges.map((range) => (
                            <button
                                key={range}
                                onClick={() => onRangeChange(range)}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                                    selectedRange === range
                                        ? "bg-secondary text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function RefreshButton() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRefresh = async () => {
        if (isLoading) return; // Prevent double-clicks

        setIsLoading(true);
        try {
            const result = await updateAllPrices();
            if (result.success) {
                console.log(`Updated ${result.updated} assets, failed ${result.failed}`);
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error('Error updating prices:', error);
        } finally {
            setIsLoading(false);
            // Force client-side refresh to reload server components with new data
            router.refresh();
        }
    };

    // Auto-update on mount
    useEffect(() => {
        handleRefresh();
    }, []);

    return (
        <button
            disabled={isLoading}
            onClick={handleRefresh}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 h-8 px-2"
        >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            <span className="hidden md:inline">{isLoading ? "Updating..." : "Refresh Prices"}</span>
        </button>
    )
}
