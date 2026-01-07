import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <Card className="min-h-[400px] flex items-center justify-center border-dashed border-2 shadow-none bg-sidebar/50">
                <CardHeader>
                    <CardTitle className="text-muted-foreground text-center">
                        {title} Module
                        <br />
                        <span className="text-sm font-normal">Coming soon in MVP v1.1</span>
                    </CardTitle>
                </CardHeader>
            </Card>
        </div>
    )
}
