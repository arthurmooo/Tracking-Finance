import { getDashboardData } from "@/actions/dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardCharts } from "@/components/dashboard-charts"

export default async function DashboardPage() {
    const data = await getDashboardData()

    const currentNetWorth = data.snapshots.length > 0
        ? parseFloat(data.snapshots[data.snapshots.length - 1].totalNetWorth)
        : 0

    const previousNetWorth = data.snapshots.length > 1
        ? parseFloat(data.snapshots[data.snapshots.length - 2].totalNetWorth)
        : currentNetWorth

    const trend = previousNetWorth !== 0
        ? ((currentNetWorth - previousNetWorth) / previousNetWorth) * 100
        : 0

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/50 backdrop-blur-sm border-sidebar-border shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
                        <span className="text-muted-foreground">€</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€{currentNetWorth.toLocaleString()}</div>
                        <p className={`text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-sidebar-border shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.assets.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {data.portfolios.length} portfolios
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-sidebar-border shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Bitcoin</div>
                        <p className="text-xs text-green-500">
                            +12.4% today
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-sidebar-border shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Projected Dividends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€342.00</div>
                        <p className="text-xs text-muted-foreground">
                            Next month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <DashboardCharts
                snapshots={data.snapshots.map(s => ({
                    date: s.date,
                    netWorth: parseFloat(s.totalNetWorth)
                }))}
                assets={data.assets.map(a => ({
                    name: a.name,
                    type: a.type,
                    value: parseFloat(a.quantity) * (parseFloat(a.currentPrice || '0'))
                }))}
            />
        </div>
    )
}
