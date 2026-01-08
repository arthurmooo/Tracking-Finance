import { parseBienPreterCsv, parseFrenchNumber } from "./csv-parsers";
import * as fs from "fs";

const csv = fs.readFileSync("./Exemples CSV/csv BienPreter.csv", "utf-8");
console.log("First 500 chars:", csv.substring(0, 500));

const result = parseBienPreterCsv(csv);
console.log("\n=== PARSED RESULTS ===");
console.log("Total assets:", result.assets.length);
console.log("Errors:", result.errors);

if (result.assets.length > 0) {
  console.log("\nFirst 3 assets:");
  result.assets.slice(0, 3).forEach(a => {
    console.log("- Name:", a.name);
    console.log("  Price:", a.price);
    console.log("  Symbol (metadata):", a.symbol);
    console.log("---");
  });
}

