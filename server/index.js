import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Routes
import authRoutes from './routes/auth.js';
import entreprisesRoutes from './routes/entreprises.js';
import agentsRoutes from './routes/agents.js';
import controlesRoutes from './routes/controles.js';
import facturesRoutes from './routes/factures.js';
import dashboardRoutes from './routes/dashboard.js';

// Database
import { initDatabase } from './database/init.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/entreprises', entreprisesRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/controles', controlesRoutes);
app.use('/api/factures', facturesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AGANOR API Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.originalUrl} n'existe pas`
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    console.log('✅ Base de données initialisée');
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Serveur AGANOR démarré sur le port ${PORT}`);
      console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Le port ${PORT} est déjà utilisé. Essayez un autre port ou arrêtez le processus qui utilise ce port.`);
        console.error(`💡 Pour changer le port, modifiez la variable PORT dans votre fichier .env`);
        process.exit(1);
      } else {
        console.error('❌ Erreur du serveur:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();