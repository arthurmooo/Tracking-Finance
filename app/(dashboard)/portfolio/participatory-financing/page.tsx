import { getDashboardData } from "@/actions/dashboard"
import { SummaryCards } from "@/components/portfolio/crowdlending/summary-cards"
import { ProjectList } from "@/components/portfolio/crowdlending/project-list"
import { RepaymentChart } from "@/components/portfolio/crowdlending/repayment-chart"
import { Badge } from "@/components/ui/badge"
import { Landmark, TrendingUp, AlertCircle } from "lucide-react"

export default async function ParticipatoryFinancingPage() {
    const data = await getDashboardData()

    // Filter for Crowdfunding portfolios
    const crowdfundingPortfolios = data.portfolios.filter(
        (p: any) => p.type === 'CROWDFUNDING' || p.type === 'PARTICIPATORY'
    )

    // Get all assets from crowdfunding portfolios
    const crowdfundingAssets = data.assets.filter((a: any) =>
        crowdfundingPortfolios.some((p: any) => p.id === a.portfolioId)
    )

    // Transform assets into project format for the UI
    const projects = crowdfundingAssets.map((asset: any) => {
        // Try to parse metadata from symbol field (stored as JSON by BienPreter parser)
        let rate = 10.0; // Default
        let duration = 12; // Default
        let company = '';
        let status = 'ACTIVE';
        let mensualite = 0; // Monthly payment
        let startDate: Date | null = null;
        let currentMonth = 1;

        try {
            if (asset.symbol && asset.symbol.startsWith('{')) {
                const metadata = JSON.parse(asset.symbol);
                rate = metadata.rate || rate;
                duration = metadata.duration || duration;
                company = metadata.company || '';
                status = metadata.status === 'Prêt en cours' ? 'ACTIVE' :
                    metadata.status === 'Terminé' ? 'COMPLETED' : 'ACTIVE';
                mensualite = metadata.mensualite || 0;
                const startDateStr = metadata.startDate || '';

                // Calculate elapsed months from start date
                if (startDateStr) {
                    // Parse French date format (DD/MM/YYYY)
                    const [day, month, year] = startDateStr.split('/').map(Number);
                    startDate = new Date(year, month - 1, day);
                    const now = new Date();
                    const monthsElapsed = Math.floor(
                        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
                    );
                    currentMonth = Math.max(1, Math.min(duration, monthsElapsed + 1));
                }
            }
        } catch (e) {
            // If parsing fails, keep defaults
        }

        return {
            id: asset.id,
            name: asset.name,
            platform: company || "BienPreter",
            investedAmount: parseFloat(asset.quantity) * parseFloat(asset.currentPrice || '0'),
            interestRate: rate,
            mensualite: mensualite, // Monthly payment (capital + interest)
            startDate: startDate ? startDate.toISOString() : (asset.createdAt || new Date().toISOString()),
            durationMonths: duration,
            currentMonth: currentMonth,
            status: status as 'ACTIVE' | 'COMPLETED' | 'LATE'
        };
    })

    const totalInvested = projects.reduce((sum: number, p: any) => sum + p.investedAmount, 0)
    const averageYield = projects.length > 0
        ? projects.reduce((sum: number, p: any) => sum + p.interestRate, 0) / projects.length
        : 0

    // Calculate next payout as sum of monthly payments for active projects
    const nextPayout = projects.reduce((sum: number, p: any) => {
        if (p.status === 'ACTIVE') {
            // Use mensualite if available (Gross -> Net * 0.7), otherwise estimate from rate
            const grossMonthly = p.mensualite > 0 ? p.mensualite : (p.investedAmount * (p.interestRate / 100) / 12);
            return sum + (grossMonthly * 0.7);
        }
        return sum;
    }, 0);

    const platformCount = [...new Set(projects.map((p: any) => p.platform))].length

    return (
        <div className="p-6 md:p-8 space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financement Participatif</h1>
                    <p className="text-muted-foreground mt-1">
                        Gérez vos investissements en Crowdlending et Immobilier fractionné.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2 h-auto text-xs uppercase font-medium">
                        <Landmark className="h-3 w-3" />
                        {platformCount} Plateforme{platformCount !== 1 ? 's' : ''} Connectée{platformCount !== 1 ? 's' : ''}
                    </Badge>
                    {projects.length > 0 && (
                        <Badge className="px-3 py-1 flex items-center gap-2 h-auto text-xs uppercase font-medium bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none border-none">
                            <TrendingUp className="h-3 w-3" />
                            {projects.length} Projet{projects.length !== 1 ? 's' : ''} actif{projects.length !== 1 ? 's' : ''}
                        </Badge>
                    )}
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">Aucun projet de crowdfunding</h2>
                    <p className="text-muted-foreground max-w-md">
                        Importez vos données BienPreter ou autre plateforme via la page Import Data pour voir vos investissements ici.
                    </p>
                </div>
            ) : (
                <>
                    {/* Summary Stats */}
                    <SummaryCards
                        totalInvested={totalInvested}
                        averageYield={averageYield}
                        nextPayout={nextPayout}
                    />

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content: Chart & List */}
                        <div className="lg:col-span-2 space-y-8">
                            <RepaymentChart projects={projects} />
                        </div>

                        {/* Sidebar: Platform breakdown */}
                        <div className="space-y-8">
                            <div className="rounded-xl border border-sidebar-border bg-card/40 p-6 backdrop-blur-sm">
                                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Résumé</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Capital investi</span>
                                        <span className="font-medium">€{totalInvested.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Rendement moyen</span>
                                        <span className="font-medium text-emerald-500">{averageYield.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Nombre de projets</span>
                                        <span className="font-medium">{projects.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Projets en cours</h2>
                            <div className="text-xs text-muted-foreground">
                                {projects.filter((p: any) => p.status === 'ACTIVE').length} projets actifs
                            </div>
                        </div>
                        <ProjectList projects={projects} />
                    </div>
                </>
            )}
        </div>
    )
}
