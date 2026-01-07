import { RealEstateHeader } from "@/components/portfolio/real-estate/real-estate-header"
import { RealEstateList } from "@/components/portfolio/real-estate/real-estate-list"

export default function RealEstatePage() {
    // Mock data for the Real Estate page
    const properties = [
        {
            id: "1",
            name: "Appartement Lyon 6",
            location: "Lyon, France",
            type: "Apartment",
            purchasePrice: 250000,
            currentValue: 285000,
            purchaseDate: "2021-06-15",
        },
        {
            id: "2",
            name: "Studio Paris 11",
            location: "Paris, France",
            type: "Apartment",
            purchasePrice: 180000,
            currentValue: 195000,
            purchaseDate: "2022-03-10",
        },
        {
            id: "3",
            name: "Maison de campagne",
            location: "Normandie, France",
            type: "House",
            purchasePrice: 320000,
            currentValue: 310000,
            purchaseDate: "2023-01-20",
        },
        {
            id: "4",
            name: "Garage Centre-ville",
            location: "Lyon, France",
            type: "Parking",
            purchasePrice: 25000,
            currentValue: 28000,
            purchaseDate: "2020-11-05",
        },
    ]

    const propertyCount = properties.length
    const totalCurrentValue = properties.reduce((acc, property) => acc + property.currentValue, 0)
    const totalPurchaseValue = properties.reduce((acc, property) => acc + property.purchasePrice, 0)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Real Estate</h2>
            </div>
            <RealEstateHeader
                propertyCount={propertyCount}
                totalCurrentValue={totalCurrentValue}
                totalPurchaseValue={totalPurchaseValue}
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <RealEstateList properties={properties} />
            </div>
        </div>
    )
}
