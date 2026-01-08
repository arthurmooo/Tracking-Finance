"use client"

import { useState, useMemo, useCallback } from "react"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type SortDirection = 'asc' | 'desc' | null

export interface SortConfig<T extends string> {
    column: T | null
    direction: SortDirection
}

export interface UseSortableTableOptions<T extends string> {
    defaultColumn?: T | null
    defaultDirection?: SortDirection
}

export function useSortableTable<T extends string>(
    options: UseSortableTableOptions<T> = {}
) {
    const { defaultColumn = null, defaultDirection = 'desc' } = options

    const [sortColumn, setSortColumn] = useState<T | null>(defaultColumn)
    const [sortDirection, setSortDirection] = useState<SortDirection>(defaultDirection)

    const toggleSort = useCallback((column: T) => {
        if (sortColumn === column) {
            // Cycle through: asc -> desc -> null
            if (sortDirection === 'asc') {
                setSortDirection('desc')
            } else if (sortDirection === 'desc') {
                setSortColumn(null)
                setSortDirection(null)
            } else {
                setSortDirection('asc')
            }
        } else {
            setSortColumn(column)
            setSortDirection('asc')
        }
    }, [sortColumn, sortDirection])

    const sortConfig: SortConfig<T> = useMemo(() => ({
        column: sortColumn,
        direction: sortDirection
    }), [sortColumn, sortDirection])

    return {
        sortColumn,
        sortDirection,
        toggleSort,
        sortConfig
    }
}

// Reusable SortableHeader component
interface SortableHeaderProps<T extends string> {
    column: T
    currentColumn: T | null
    direction: SortDirection
    onSort: (column: T) => void
    children: React.ReactNode
    className?: string
}

export function SortableHeader<T extends string>({
    column,
    currentColumn,
    direction,
    onSort,
    children,
    className
}: SortableHeaderProps<T>) {
    const isActive = currentColumn === column

    return (
        <button
            onClick={() => onSort(column)}
            className={cn(
                "flex items-center gap-1 hover:text-foreground transition-colors group cursor-pointer select-none",
                isActive && "text-foreground",
                className
            )}
        >
            {children}
            {isActive && direction ? (
                direction === 'asc' ? (
                    <ArrowUp className="h-3 w-3" />
                ) : (
                    <ArrowDown className="h-3 w-3" />
                )
            ) : (
                <ArrowUpDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
        </button>
    )
}

// Generic sort function
export function sortData<T, K extends string>(
    data: T[],
    sortColumn: K | null,
    sortDirection: SortDirection,
    getValueFn: (item: T, column: K) => string | number | Date
): T[] {
    if (!sortColumn || !sortDirection) return data

    return [...data].sort((a, b) => {
        const aVal = getValueFn(a, sortColumn)
        const bVal = getValueFn(b, sortColumn)

        let comparison = 0

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            comparison = aVal.localeCompare(bVal)
        } else if (aVal instanceof Date && bVal instanceof Date) {
            comparison = aVal.getTime() - bVal.getTime()
        } else {
            comparison = Number(aVal) - Number(bVal)
        }

        return sortDirection === 'asc' ? comparison : -comparison
    })
}
