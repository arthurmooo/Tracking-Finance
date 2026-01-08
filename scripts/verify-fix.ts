
import { parseBienPreterCsv } from '../lib/csv-parsers';

const csvContent = `N°Contrat;Projet;Entreprise;Montant;Taux;"Durée de remboursements (mois)";"Date de financement";"Date de clôture";Mensualité;Prochaine;Statut;"Intérêts nets perçus"
C42932693BF5A602078;"Vente Villa EZE";JMCECE;60;15;4;17/12/2025;06/04/2026;0,75;06/02/2026;"Prêt en cours";0,25`;

console.log('Testing parseBienPreterCsv with quoted headers...');
const result = parseBienPreterCsv(csvContent);

if (result.errors.length > 0) {
    console.error('Errors found:', result.errors);
}

const asset = result.assets[0];
console.log('Parsed Asset:', asset.name);
console.log('Symbol (Metadata):', asset.symbol);

if (asset.symbol) {
    const meta = JSON.parse(asset.symbol);
    console.log('StartDate found:', meta.startDate);

    if (meta.startDate === '17/12/2025') {
        console.log('✅ SUCCESS: Start date correctly parsed!');
    } else {
        console.error('❌ FAILURE: Start date mismatch or missing.');
    }
} else {
    console.error('❌ FAILURE: No metadata parsed.');
}
