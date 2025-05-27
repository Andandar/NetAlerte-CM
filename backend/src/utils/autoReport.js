const knex = require('../../knexfile');
const { sendMail } = require('./mailer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

async function generateWeeklyReport() {
  // Début de la semaine (lundi)
  const start = new Date();
  start.setDate(start.getDate() - start.getDay() + 1);
  start.setHours(0, 0, 0, 0);
  // Fin de la semaine (dimanche)
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  // Récupérer les signalements de la semaine
  const reports = await knex('reports')
    .whereBetween('created_at', [start, end])
    .select('id', 'created_at', 'operator', 'problem_type', 'region', 'status', 'signal_strength', 'network_type', 'description', 'latitude', 'longitude');

  // Statistiques globales
  const total = reports.length;
  const byOperator = {};
  reports.forEach(r => {
    byOperator[r.operator] = (byOperator[r.operator] || 0) + 1;
  });

  // Générer le fichier Excel
  const ws = XLSX.utils.json_to_sheet(reports.map(r => ({
    Date: r.created_at ? new Date(r.created_at).toLocaleString('fr-FR') : '',
    Opérateur: r.operator,
    Problème: r.problem_type,
    Région: r.region,
    Statut: r.status,
    'Force du signal': r.signal_strength,
    Technologie: r.network_type,
    Description: r.description,
    Latitude: r.latitude,
    Longitude: r.longitude
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Signalements');
  const filePath = path.join(__dirname, '../../rapport-semaine.xlsx');
  XLSX.writeFile(wb, filePath);

  // Corps de l'email
  let text = `Rapport hebdomadaire NetAlerte CM\n\nTotal signalements : ${total}\n\nSignalements par opérateur :\n`;
  Object.entries(byOperator).forEach(([op, count]) => {
    text += `- ${op} : ${count}\n`;
  });
  text += '\nVoir le fichier Excel en pièce jointe pour le détail.';

  // Envoi de l'email
  await sendMail({
    to: process.env.ADMIN_EMAIL,
    subject: 'Rapport hebdomadaire NetAlerte CM',
    text,
    attachments: [
      {
        filename: 'rapport-semaine.xlsx',
        path: filePath
      }
    ]
  });

  // Suppression du fichier temporaire
  fs.unlinkSync(filePath);
}

module.exports = { generateWeeklyReport }; 