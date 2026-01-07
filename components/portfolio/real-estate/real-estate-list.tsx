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

export function RealEstateList({ properties }: RealEstateListProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Properties</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Property</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Purchase Date</TableHead>
                            <TableHead className="text-right">Purchase Price</TableHead>
                            <TableHead className="text-right">Current Value</TableHead>
                            <TableHead className="text-right">Gain/Loss</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {properties.map((property) => {
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
