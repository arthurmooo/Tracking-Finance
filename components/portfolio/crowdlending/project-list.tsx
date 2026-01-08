"use client"

import React from "react"

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
import { useState, useMemo } from "react"
import { ChevronDown, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { useSortableTable, SortableHeader, sortData } from "@/hooks/use-sortable-table"

interface Project {
    id: string
    name: string
    platform: string // This is the "Marque" (company/borrower)
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

interface CompanyGroup {
    name: string
    projects: Project[]
    totalInvested: number
    weightedRate: number
    activeCount: number
    completedCount: number
    lateCount: number
}

interface PlatformGroup {
    name: string
    companies: CompanyGroup[]
    totalInvested: number
    weightedRate: number
    activeCount: number
    completedCount: number
    lateCount: number
    projectCount: number
}

type ProjectSortColumn = 'name' | 'investedAmount' | 'interestRate' | 'progress' | 'status'

export function ProjectList({ projects }: ProjectListProps) {
    const [expandedPlatform, setExpandedPlatform] = useState<boolean>(true) // BienPrêter expanded by default
    const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({})

    const { sortColumn, sortDirection, toggleSort } = useSortableTable<ProjectSortColumn>({
        defaultColumn: 'investedAmount',
        defaultDirection: 'desc'
    })

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)

    const togglePlatform = () => {
        setExpandedPlatform(prev => !prev)
    }

    const toggleCompany = (companyName: string) => {
        setExpandedCompanies(prev => ({ ...prev, [companyName]: !prev[companyName] }))
    }

    const getProjectValue = (project: Project, column: ProjectSortColumn): string | number => {
        switch (column) {
            case 'name': return project.name
            case 'investedAmount': return project.investedAmount
            case 'interestRate': return project.interestRate
            case 'progress': return project.currentMonth / project.durationMonths
            case 'status': return project.status
            default: return 0
        }
    }

    const sortProjects = (projectList: Project[]): Project[] => {
        return sortData(projectList, sortColumn, sortDirection, getProjectValue)
    }

    const platformGroup = useMemo(() => {
        // Group projects by company (platform field = borrower/company)
        const companiesMap: Record<string, CompanyGroup> = {}

        projects.forEach(project => {
            const companyName = project.platform || "Autre"

            if (!companiesMap[companyName]) {
                companiesMap[companyName] = {
                    name: companyName,
                    projects: [],
                    totalInvested: 0,
                    weightedRate: 0,
                    activeCount: 0,
                    completedCount: 0,
                    lateCount: 0
                }
            }

            const company = companiesMap[companyName]
            company.projects.push(project)
            company.totalInvested += project.investedAmount

            if (project.status === 'ACTIVE') company.activeCount++
            if (project.status === 'COMPLETED') company.completedCount++
            if (project.status === 'LATE') company.lateCount++
        })

        // Calculate weighted rate for each company
        Object.values(companiesMap).forEach(company => {
            let weightedSum = 0
            let totalWeight = 0
            company.projects.forEach(p => {
                weightedSum += p.interestRate * p.investedAmount
                totalWeight += p.investedAmount
            })
            company.weightedRate = totalWeight > 0 ? weightedSum / totalWeight : 0
        })

        // Sort companies by total invested (descending)
        const companies = Object.values(companiesMap).sort((a, b) => b.totalInvested - a.totalInvested)

        // Calculate platform totals
        const mainGroup: PlatformGroup = {
            name: "BienPrêter",
            companies,
            totalInvested: companies.reduce((sum, c) => sum + c.totalInvested, 0),
            weightedRate: 0,
            activeCount: companies.reduce((sum, c) => sum + c.activeCount, 0),
            completedCount: companies.reduce((sum, c) => sum + c.completedCount, 0),
            lateCount: companies.reduce((sum, c) => sum + c.lateCount, 0),
            projectCount: projects.length
        }

        // Weighted rate for platform
        let weightedSum = 0
        let totalWeight = 0
        projects.forEach(p => {
            weightedSum += p.interestRate * p.investedAmount
            totalWeight += p.investedAmount
        })
        mainGroup.weightedRate = totalWeight > 0 ? weightedSum / totalWeight : 0

        return mainGroup
    }, [projects])

    return (
        <div className="rounded-lg border border-sidebar-border bg-card/50 overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead>
                            <SortableHeader column="name" currentColumn={sortColumn} direction={sortDirection} onSort={toggleSort}>
                                Marque / Projet
                            </SortableHeader>
                        </TableHead>
                        <TableHead className="text-right">
                            <div className="flex justify-end">
                                <SortableHeader column="investedAmount" currentColumn={sortColumn} direction={sortDirection} onSort={toggleSort}>
                                    Investi
                                </SortableHeader>
                            </div>
                        </TableHead>
                        <TableHead className="text-right">
                            <div className="flex justify-end">
                                <SortableHeader column="interestRate" currentColumn={sortColumn} direction={sortDirection} onSort={toggleSort}>
                                    Taux
                                </SortableHeader>
                            </div>
                        </TableHead>
                        <TableHead className="w-[140px]">
                            <SortableHeader column="progress" currentColumn={sortColumn} direction={sortDirection} onSort={toggleSort}>
                                Progression
                            </SortableHeader>
                        </TableHead>
                        <TableHead className="text-right w-[100px]">
                            <div className="flex justify-end">
                                <SortableHeader column="status" currentColumn={sortColumn} direction={sortDirection} onSort={toggleSort}>
                                    Statut
                                </SortableHeader>
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* Platform Row (BienPrêter) */}
                    <TableRow
                        className="hover:bg-muted/30 transition-colors cursor-pointer font-medium bg-muted/20"
                        onClick={togglePlatform}
                    >
                        <TableCell>
                            {expandedPlatform ?
                                <ChevronDown className="h-4 w-4 text-muted-foreground" /> :
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            }
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{platformGroup.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    ({platformGroup.projectCount} projets)
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                            {formatCurrency(platformGroup.totalInvested)}
                        </TableCell>
                        <TableCell className="text-right text-emerald-500 font-semibold">
                            {platformGroup.weightedRate.toFixed(2)}%
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                                {platformGroup.activeCount > 0 && (
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] h-5 px-1.5">
                                        {platformGroup.activeCount}
                                    </Badge>
                                )}
                                {platformGroup.lateCount > 0 && (
                                    <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[10px] h-5 px-1.5">
                                        {platformGroup.lateCount}
                                    </Badge>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>

                    {/* Company Rows (when platform expanded) */}
                    {expandedPlatform && platformGroup.companies.map(company => (
                        <React.Fragment key={company.name}>
                            {/* Company Header Row */}
                            <TableRow
                                className="hover:bg-muted/20 transition-colors cursor-pointer bg-muted/5"
                                onClick={() => toggleCompany(company.name)}
                            >
                                <TableCell className="pl-8">
                                    {expandedCompanies[company.name] ?
                                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> :
                                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                    }
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{company.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            ({company.projects.length} projet{company.projects.length > 1 ? 's' : ''})
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-sm font-medium">
                                    {formatCurrency(company.totalInvested)}
                                </TableCell>
                                <TableCell className="text-right text-sm text-emerald-500 font-medium">
                                    {company.weightedRate.toFixed(2)}%
                                </TableCell>
                                <TableCell></TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        {company.activeCount > 0 && (
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] h-4 px-1">
                                                {company.activeCount}
                                            </Badge>
                                        )}
                                        {company.lateCount > 0 && (
                                            <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[9px] h-4 px-1">
                                                {company.lateCount}
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>

                            {/* Project Rows (when company expanded) */}
                            {expandedCompanies[company.name] && sortProjects(company.projects).map(project => (
                                <TableRow key={project.id} className="hover:bg-muted/10 border-0">
                                    <TableCell></TableCell>
                                    <TableCell className="pl-12 text-sm text-muted-foreground">
                                        {project.name}
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-muted-foreground">
                                        {formatCurrency(project.investedAmount)}
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-emerald-500/80">
                                        {project.interestRate}%
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground w-10 text-right shrink-0">
                                                {project.currentMonth}/{project.durationMonths}
                                            </span>
                                            <div className="flex-1 max-w-[80px]">
                                                <Progress
                                                    value={(project.currentMonth / project.durationMonths) * 100}
                                                    className="h-1.5"
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-[10px] h-5",
                                                project.status === 'ACTIVE' && "bg-emerald-500/10 text-emerald-500",
                                                project.status === 'COMPLETED' && "bg-blue-500/10 text-blue-500",
                                                project.status === 'LATE' && "bg-rose-500/10 text-rose-500"
                                            )}
                                        >
                                            {project.status === 'ACTIVE' ? 'En cours' : project.status === 'COMPLETED' ? 'Terminé' : 'Retard'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
