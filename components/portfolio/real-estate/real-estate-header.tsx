import { ArrowUpRight, ArrowDownRight, Building, Home, Euro } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RealEstateHeaderProps {
    propertyCount: number
    totalCurrentValue: number
    totalPurchaseValue: number
}

export function RealEstateHeader({
    propertyCount,
    totalCurrentValue,
    totalPurchaseValue,
}: RealEstateHeaderProps) {
    const totalGain = totalCurrentValue - totalPurchaseValue
    const gainPercentage = totalPurchaseValue > 0 ? (totalGain / totalPurchaseValue) * 100 : 0
    const isPositive = totalGain >= 0

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{propertyCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Active real estate assets
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                    <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">€{totalCurrentValue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Estimated market value
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Purchase Value</CardTitle>
                    <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">€{totalPurchaseValue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Initial investment cost
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
                    {isPositive ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}€{totalGain.toLocaleString()}
                    </div>
                    <p className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{gainPercentage.toFixed(2)}% all time
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
