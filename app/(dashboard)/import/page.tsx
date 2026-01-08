"use client"

import { useState } from "react"
import { FileUploadZone } from "@/components/import/file-upload-zone"
import { ManualAssetForm } from "@/components/import/manual-asset-form"
import { CsvPreviewTable } from "@/components/import/csv-preview-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronLeft, Loader2, AlertCircle, Plus } from "lucide-react"
import { parseIbkrCsv, parseBienPreterCsv, parseGenericCsv, ParsedAsset, CsvParserResult } from "@/lib/csv-parsers"
import { processImport, getPortfoliosList } from "@/actions/import-actions"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect } from "react"

import { CreatePortfolioDialog } from "@/components/portfolio/create-portfolio-dialog"
import { DeletePortfolioButton } from "@/components/portfolio/delete-portfolio-button"

export default function ImportPage() {
    const router = useRouter()
    const [step, setStep] = useState(1);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [portfolios, setPortfolios] = useState<{ id: string, name: string }[]>([]);
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");
    const [parsedData, setParsedData] = useState<ParsedAsset[]>([]);
    const [importing, setImporting] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        const loadPortfolios = async () => {
            const res = await getPortfoliosList();
            if (res.success) {
                setPortfolios(res.data);
            }
        };
        loadPortfolios();
    }, []);

    const handleFileSelect = async (file: File) => {
        const text = await file.text();
        let result: CsvParserResult = { assets: [], errors: [] };

        // Detection logic
        if (text.includes("Positions ouvertes") && text.includes("Header")) {
            result = parseIbkrCsv(text);
        } else if (text.includes("Projet") && text.includes("Montant") && text.includes("N°Contrat")) {
            result = parseBienPreterCsv(text);
        } else {
            result = parseGenericCsv(text);
        }

        if (result.assets.length > 0) {
            setParsedData(result.assets);
            setErrors(result.errors.map(e => `Row ${e.row}: ${e.message}`));
            setStep(2);
        } else {
            setErrors(["No recognizable valid assets found. " + (result.errors[0]?.message || "")]);
        }
    }

    const handleConfirm = async () => {
        if (!selectedPortfolioId) return;
        setImporting(true);
        const res = await processImport(selectedPortfolioId, parsedData);
        setImporting(false);
        if (res.success) {
            setStep(3);
        } else {
            setErrors([res.error || "Unknown error"]);
        }
    }

    const [importMode, setImportMode] = useState<'upload' | 'manual'>('upload');

    const handleManualAdd = (asset: ParsedAsset) => {
        setParsedData(prev => [...prev, asset]);
        setStep(2);
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                {step > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => setStep(step - 1)}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                )}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Import Data</h1>
                    <p className="text-muted-foreground">Import your assets manually or from CSV files</p>
                </div>
            </div>

            {/* Step 1: Selection & Upload */}
            {step === 1 && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Select Portfolio</CardTitle>
                            <CardDescription>Where should these assets go?</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Select value={selectedPortfolioId} onValueChange={setSelectedPortfolioId}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select a portfolio..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {portfolios.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <CreatePortfolioDialog
                                    onCreated={(newId) => {
                                        getPortfoliosList().then(res => {
                                            if (res && res.success) setPortfolios(res.data);
                                        });
                                        if (newId) setSelectedPortfolioId(newId);
                                    }}
                                    trigger={
                                        <Button variant="outline" size="icon" title="Create new portfolio">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    }
                                />

                                {selectedPortfolioId && (
                                    <DeletePortfolioButton
                                        portfolioId={selectedPortfolioId}
                                        portfolioName={portfolios.find(p => p.id === selectedPortfolioId)?.name || ''}
                                        onDeleted={() => {
                                            setSelectedPortfolioId('');
                                            getPortfoliosList().then(res => {
                                                if (res && res.success) setPortfolios(res.data);
                                            });
                                        }}
                                    />
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground mt-4">
                                Tip: Select a portfolio, then use the trash icon to delete it and all its assets.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className={selectedPortfolioId ? "" : "opacity-50 pointer-events-none"}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>2. Add Assets</CardTitle>
                                <div className="flex bg-muted rounded-lg p-1">
                                    <button
                                        onClick={() => setImportMode('upload')}
                                        className={`px-3 py-1 text-sm rounded-md transition-all ${importMode === 'upload' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        CSV File
                                    </button>
                                    <button
                                        onClick={() => setImportMode('manual')}
                                        className={`px-3 py-1 text-sm rounded-md transition-all ${importMode === 'manual' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Manual
                                    </button>
                                </div>
                            </div>
                            <CardDescription>
                                {importMode === 'upload' ? 'Drag and drop your file' : 'Enter asset details manually'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {importMode === 'upload' ? (
                                <>
                                    <FileUploadZone onFileSelect={handleFileSelect} />
                                    {errors.length > 0 && (
                                        <Alert variant="destructive" className="mt-4">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Error parsing file</AlertTitle>
                                            <AlertDescription>
                                                {errors.slice(0, 3).map((e, i) => <div key={i}>{e}</div>)}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </>
                            ) : (
                                <ManualAssetForm onAdd={handleManualAdd} />
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Step 2: Preview */}
            {step === 2 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Preview Import</CardTitle>
                            <CardDescription>Found {parsedData.length} assets. Please review before importing.</CardDescription>
                        </div>
                        <Button onClick={handleConfirm} disabled={importing}>
                            {importing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                            Confirm Import to {portfolios.find(p => p.id === selectedPortfolioId)?.name}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <CsvPreviewTable assets={parsedData} />
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
                <Card className="bg-emerald-500/10 border-emerald-500/50">
                    <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">Import Successful!</h2>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => { setStep(1); setParsedData([]); }}>Import Another</Button>
                            <Button onClick={() => router.push('/portfolio')}>View Portfolio</Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
