"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ParsedAsset } from "@/lib/csv-parsers"
import { PlusCircle } from "lucide-react"

interface ManualAssetFormProps {
    onAdd: (asset: ParsedAsset) => void
}

export function ManualAssetForm({ onAdd }: ManualAssetFormProps) {
    const [name, setName] = useState("")
    const [symbol, setSymbol] = useState("")
    const [quantity, setQuantity] = useState("1")
    const [price, setPrice] = useState("")
    const [buyPrice, setBuyPrice] = useState("")
    const [type, setType] = useState<ParsedAsset['type']>("PRIVATE_EQUITY")
    const [currency, setCurrency] = useState("EUR")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !quantity || !price) return

        const asset: ParsedAsset = {
            name,
            symbol: symbol || undefined,
            quantity: parseFloat(quantity),
            price: parseFloat(price),
            buyPrice: buyPrice ? parseFloat(buyPrice) : undefined,
            currency,
            type
        }

        onAdd(asset)

        // Reset semi-intelligently (keep currency/type potentially?)
        setName("")
        setSymbol("")
        setQuantity("1")
        setPrice("")
        setBuyPrice("")
    }

    return (
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 border rounded-lg p-4 bg-card/50">
            <div className="space-y-2">
                <Label>Asset Name *</Label>
                <Input placeholder="e.g. My Private Investment" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label>Symbol / Ticker (Optional)</Label>
                <Input placeholder="e.g. TICKER" value={symbol} onChange={e => setSymbol(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input type="number" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label>Unit Price *</Label>
                    <Input type="number" step="any" value={price} onChange={e => setPrice(e.target.value)} required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Avg Buy Price (Optional)</Label>
                    <Input type="number" step="any" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as any)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="STOCK">Stock</SelectItem>
                        <SelectItem value="ETF">ETF</SelectItem>
                        <SelectItem value="CRYPTO">Crypto</SelectItem>
                        <SelectItem value="PRIVATE_EQUITY">Private Equity</SelectItem>
                        <SelectItem value="STARTUP">Startup</SelectItem>
                        <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                        <SelectItem value="CROWDFUNDING">Crowdfunding</SelectItem>
                        <SelectItem value="CASH">Cash</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="md:col-span-2 flex justify-end">
                <Button type="submit" variant="secondary">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add to List
                </Button>
            </div>
        </form>
    )
}
