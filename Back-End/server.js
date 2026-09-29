import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import env from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import alertRoutes from './routes/alertRoutes.js';

// Setup Env
env.config();

// Obter __dirname em módulos ES (import)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Variables
const PORT = process.env.PORT || 3000;

// Setup Express
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Servir os arquivos estáticos da pasta de build do React
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/auth', authRoutes);
app.use('/reports', reportRoutes);
app.use('/alerts', alertRoutes);

// Qualquer outra rota que não seja da API carrega a página do React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});