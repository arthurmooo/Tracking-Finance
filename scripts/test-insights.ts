
import { getInsightsData } from "@/actions/dashboard"

async function main() {
    console.log("Testing getInsightsData...")
    try {
        const data = await getInsightsData()
        console.log("Success!")
        console.log("Monthly Passive Income:", JSON.stringify(data.monthlyPassiveIncome, null, 2))
        console.log("Recent Transactions:", JSON.stringify(data.passiveIncomeTransactions?.slice(0, 2), null, 2))
    } catch (error) {
        console.error("Failed:", error)
    }
}

main()
