import { getDashboardData } from "@/actions/dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardCharts } from "@/components/dashboard-charts"

export default async function DashboardPage() {
    const data = await getDashboardData()

    // Calculate LIVE Net Worth from assets (not from possibly empty snapshots)
    const currentNetWorth = data.assets.reduce((sum: number, asset: any) => {
        const qty = parseFloat(asset.quantity || '0')
        const price = parseFloat(asset.currentPrice || '0')
        return sum + (qty * price)
    }, 0)

    // Calculate previous net worth from snapshots if available, otherwise use 0
    const previousNetWorth = data.snapshots.length > 0
        ? parseFloat(data.snapshots[data.snapshots.length - 1].totalNetWorth)
        : 0

    const trend = previousNetWorth !== 0
        ? ((currentNetWorth - previousNetWorth) / previousNetWorth) * 100
        : 0

    // Find top performer from assets (by P&L %)
    let topPerformer = { name: 'N/A', change: 0 }
    if (data.assets.length > 0) {
        const withPnl = data.assets
            .filter((a: any) => a.type !== 'CROWDFUNDING') // Exclude crowdfunding
            .map((a: any) => {
                const qty = parseFloat(a.quantity || '0')
                const currentPrice = parseFloat(a.currentPrice || '0')
                const buyPrice = parseFloat(a.averageBuyPrice || currentPrice)
                const pnlPercent = buyPrice > 0 ? ((currentPrice - buyPrice) / buyPrice) * 100 : 0
                return { name: a.name, pnlPercent }
            })

        if (withPnl.length > 0) {
            const best = withPnl.reduce((max: any, a: any) => a.pnlPercent > max.pnlPercent ? a : max, withPnl[0])
            topPerformer = { name: best.name, change: best.pnlPercent }
        }
    }

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
                        <div className="text-2xl font-bold">€{currentNetWorth.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</div>
                        <p className={`text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% from last snapshot
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
                            Across {data.portfolios.length} portfolio{data.portfolios.length !== 1 ? 's' : ''}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-sidebar-border shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">{topPerformer.name.split(' ').slice(0, 2).join(' ')}</div>
                        <p className={`text-xs ${topPerformer.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {topPerformer.change >= 0 ? '+' : ''}{topPerformer.change.toFixed(1)}% P&L
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-sidebar-border shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Portfolios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.portfolios.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Active accounts
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
