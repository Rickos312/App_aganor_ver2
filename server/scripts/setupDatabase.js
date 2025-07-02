import { initDatabase } from '../database/init.js';
import seedDatabase from './seedDatabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    console.log('🚀 Configuration de la base de données AGANOR...');
    
    // Supprimer la base de données existante pour éviter les conflits
    const dbPath = path.join(__dirname, '../../database.sqlite');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('🗑️  Base de données existante supprimée');
    }
    
    // Initialiser la structure de la base de données
    await initDatabase();
    console.log('✅ Structure de la base de données créée');
    
    // Peupler avec des données de test
    await seedDatabase();
    console.log('✅ Données de test ajoutées');
    
    console.log('🎉 Base de données configurée avec succès !');
    console.log('');
    console.log('📋 Informations de connexion :');
    console.log('   Email: jc.mbadinga@aganor.ga');
    console.log('   Mot de passe: aganor2025');
    console.log('');
    console.log('🔧 Pour démarrer le serveur :');
    console.log('   npm run dev');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    process.exit(1);
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export default setupDatabase;