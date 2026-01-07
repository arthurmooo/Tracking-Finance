"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface Project {
    id: string
    name: string
    platform: string
    investedAmount: number
    interestRate: number
    startDate: string
    durationMonths: number
    currentMonth: number
    status: 'ACTIVE' | 'COMPLETED' | 'LATE'
}

interface ProjectListProps {
    projects: Project[]
}

export function ProjectList({ projects }: ProjectListProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)

    return (
        <div className="rounded-lg border border-sidebar-border bg-card/50 overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead>Projet</TableHead>
                        <TableHead>Plateforme</TableHead>
                        <TableHead className="text-right">Investi</TableHead>
                        <TableHead className="text-right">Taux</TableHead>
                        <TableHead>Progression</TableHead>
                        <TableHead>Statut</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => (
                        <TableRow key={project.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">{project.name}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                    {project.platform}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(project.investedAmount)}</TableCell>
                            <TableCell className="text-right text-emerald-500 font-medium">
                                {project.interestRate}%
                            </TableCell>
                            <TableCell className="min-w-[150px]">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                        <span>Mois {project.currentMonth}/{project.durationMonths}</span>
                                        <span>{Math.round((project.currentMonth / project.durationMonths) * 100)}%</span>
                                    </div>
                                    <Progress
                                        value={(project.currentMonth / project.durationMonths) * 100}
                                        className="h-1.5"
                                    />
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        "text-[10px]",
                                        project.status === 'ACTIVE' && "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
                                        project.status === 'COMPLETED' && "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
                                        project.status === 'LATE' && "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                                    )}
                                >
                                    {project.status === 'ACTIVE' ? 'En cours' : project.status === 'COMPLETED' ? 'Terminé' : 'Retard'}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
