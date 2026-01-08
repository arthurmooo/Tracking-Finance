"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPortfolio } from "@/actions/import-actions"
import { Loader2, Plus } from "lucide-react"

interface CreatePortfolioDialogProps {
    onCreated: (portfolioId: string) => void
    trigger?: React.ReactNode
}

export function CreatePortfolioDialog({ onCreated, trigger }: CreatePortfolioDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [type, setType] = useState("PEA")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreate = async () => {
        if (!name) {
            setError("Please enter a portfolio name");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const res = await createPortfolio(name, type);
            if (res.success && res.data) {
                onCreated(res.data.id);
                setOpen(false);
                setName("");
            } else {
                setError(res.error || "Failed to create portfolio");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <Plus className="mr-2 h-4 w-4" />
                        Create new portfolio
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Portfolio</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                            placeholder="e.g. My PEA"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PEA">PEA</SelectItem>
                                <SelectItem value="CTO">CTO (Securities)</SelectItem>
                                <SelectItem value="AV">Assurance Vie</SelectItem>
                                <SelectItem value="CRYPTO">Crypto</SelectItem>
                                <SelectItem value="REAL_ESTATE">Real Estate / SCPI</SelectItem>
                                <SelectItem value="CROWDFUNDING">Participatory Financing</SelectItem>
                                <SelectItem value="PEE">Employee Savings (PEE)</SelectItem>
                                <SelectItem value="LIQUIDITY">Cash / Bank</SelectItem>
                                <SelectItem value="PRIVATE_EQUITY">Private Equity</SelectItem>
                                <SelectItem value="STARTUP">Startup / Angel</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                        {error}
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
