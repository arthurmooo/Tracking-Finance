"use client"

import { useState } from "react"
import { StocksFundsHeader } from "./stocks-funds-header"
import { PerformanceChart } from "./performance-chart"

export type TimeRange = "1D" | "7D" | "1M" | "YTD" | "1Y" | "ALL"
export type ViewMode = "portfolio" | "compare"

interface StocksFundsViewProps {
    totalValue: number
    changeValue: number
    changePercentage: number
    historyData?: { date: string; value: number }[]
}

export function StocksFundsView({ totalValue, changeValue, changePercentage, historyData }: StocksFundsViewProps) {
    const [selectedRange, setSelectedRange] = useState<TimeRange>("YTD")
    const [viewMode, setViewMode] = useState<ViewMode>("portfolio")
    const [benchmark, setBenchmark] = useState<string>("none")
    const [chartType, setChartType] = useState<"area" | "candlestick">("area")

    return (
        <>
            <StocksFundsHeader
                currentValue={totalValue}
                changeValue={changeValue}
                changePercentage={changePercentage}
                selectedRange={selectedRange}
                onRangeChange={setSelectedRange}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                benchmark={benchmark}
                onBenchmarkChange={setBenchmark}
                chartType={chartType}
                onChartTypeChange={setChartType}
            />
            <PerformanceChart
                data={historyData}
                range={selectedRange}
                viewMode={viewMode}
                benchmark={benchmark}
                chartType={chartType}
            />
        </>
    )
}
