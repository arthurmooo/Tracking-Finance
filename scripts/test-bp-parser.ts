
import Papa from 'papaparse';
import fs from 'fs';

const csvContent = `N°Contrat;Projet;Entreprise;Montant;Taux;"Durée de remboursements (mois)";"Date de financement";"Date de clôture";Mensualité;Prochaine;Statut;"Intérêts nets perçus"
C42932693BF5A602078;"Vente Villa EZE";JMCECE;60;15;4;17/12/2025;06/04/2026;0,75;06/02/2026;"Prêt en cours";0,25`;

const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    delimiter: ';',
});

console.log('Parsed Keys:', Object.keys(parsed.data[0] as Record<string, unknown>));
console.log('First Row:', parsed.data[0]);

const row = parsed.data[0] as any;
console.log('Date de financement (direct access):', row['Date de financement']);
console.log('Date de financement (quoted access):', row['"Date de financement"']);
