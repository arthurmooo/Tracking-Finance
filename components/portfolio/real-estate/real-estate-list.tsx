"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSortableTable, SortableHeader, sortData } from "@/hooks/use-sortable-table"

interface Property {
    id: string
    name: string
    location: string
    type: string
    purchasePrice: number
    currentValue: number
    purchaseDate: string
}

interface RealEstateListProps {
    properties: Property[]
}

type PropertySortColumn = 'name' | 'type' | 'location' | 'purchaseDate' | 'purchasePrice' | 'currentValue' | 'gain'

export function RealEstateList({ properties }: RealEstateListProps) {
    const { sortColumn, sortDirection, toggleSort } = useSortableTable<PropertySortColumn>({
        defaultColumn: 'currentValue',
        defaultDirection: 'desc'
    })

    const getPropertyValue = (property: Property, column: PropertySortColumn): string | number => {
        switch (column) {
            case 'name': return property.name
            case 'type': return property.type
            case 'location': return property.location
            case 'purchaseDate': return property.purchaseDate
            case 'purchasePrice': return property.purchasePrice
            case 'currentValue': return property.currentValue
            case 'gain': return property.currentValue - property.purchasePrice
            default: return 0
        }
    }

    const sortedProperties = sortData(properties, sortColumn, sortDirection, getPropertyValue)

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Properties</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <SortableHeader column="name" currentColumn={sortColumn} direction={sortDirection} onSort={toggleSort}>
                                    Property
                                </SortableHeader>
                            </TableHead>
                            <TableHead>
                                <SortableHeader column="type" currentColumn={sortColumn} direction={sortDirection} onSort={toggleSort}>
                                    Type
                                </SortableHeader>
                            </TableHead>
                            <TableHead>
                                <SortableHeader column="location" currentColumn={sortColumn} direction={sortDirection} onSort={toggleSort}>
                                    Location
                                </SortableHeader>
                            </TableHead>
                            <TableHead>
                                <SortableHeader column="purchaseDate" currentColumn={sortColumn} direction={sortDirection} onSort={toggleSort}>
                                    Purchase Date
                                </SortableHeader>
                            </TableHead>
                            <TableHead className="text-right">
                                <div className="flex justify-end">
                                    <SortableHeader column="purchasePrice" currentColumn={sortColumn} direction={sortDirection} onSort={toggleSort}>
                                        Purchase Price
                                    </SortableHeader>
                                </div>
                            </TableHead>
                            <TableHead className="text-right">
                                <div className="flex justify-end">
                                    <SortableHeader column="currentValue" currentColumn={sortColumn} direction={sortDirection} onSort={toggleSort}>
                                        Current Value
                                    </SortableHeader>
                                </div>
                            </TableHead>
                            <TableHead className="text-right">
                                <div className="flex justify-end">
                                    <SortableHeader column="gain" currentColumn={sortColumn} direction={sortDirection} onSort={toggleSort}>
                                        Gain/Loss
                                    </SortableHeader>
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedProperties.map((property) => {
                            const gain = property.currentValue - property.purchasePrice
                            const gainPercent = (gain / property.purchasePrice) * 100
                            const isPositive = gain >= 0

                            return (
                                <TableRow key={property.id}>
                                    <TableCell className="font-medium">{property.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{property.type}</Badge>
                                    </TableCell>
                                    <TableCell>{property.location}</TableCell>
                                    <TableCell>{property.purchaseDate}</TableCell>
                                    <TableCell className="text-right">
                                        €{property.purchasePrice.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        €{property.currentValue.toLocaleString()}
                                    </TableCell>
                                    <TableCell className={`text-right ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                        <div className="font-medium">
                                            {isPositive ? '+' : ''}€{gain.toLocaleString()}
                                        </div>
                                        <div className="text-xs">
                                            {isPositive ? '+' : ''}{gainPercent.toFixed(2)}%
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
