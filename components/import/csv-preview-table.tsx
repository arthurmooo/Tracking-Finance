"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ParsedAsset } from "@/lib/csv-parsers"
import { Badge } from "@/components/ui/badge"

interface CsvPreviewTableProps {
    assets: ParsedAsset[]
}

export function CsvPreviewTable({ assets }: CsvPreviewTableProps) {
    if (assets.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No valid assets found in this file.</div>
    }

    return (
        <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
                <TableHeader className="bg-secondary/20">
                    <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Name / Symbol</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assets.map((asset, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Badge variant="outline" className="text-[10px]">
                                    {asset.type}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium text-sm">{asset.name}</div>
                                {(asset.symbol || asset.isin) && (
                                    <div className="text-xs text-muted-foreground">
                                        {asset.symbol} {asset.isin && `• ${asset.isin}`}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                                {asset.quantity.toLocaleString('fr-FR', { maximumFractionDigits: 4 })}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                                {asset.price?.toLocaleString('fr-FR', { style: 'currency', currency: asset.currency })}
                            </TableCell>
                            <TableCell className="text-right font-medium text-sm">
                                {((asset.price || 0) * asset.quantity).toLocaleString('fr-FR', { style: 'currency', currency: asset.currency })}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="bg-secondary/10 px-4 py-2 border-t border-border/50 text-xs text-muted-foreground text-center">
                Review these {assets.length} items carefully before confirming import.
            </div>
        </div>
    )
}
