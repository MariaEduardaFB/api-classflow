import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { sequelize } from './src/config/database.js';
import { router } from './src/routes/index.js';
import { alunosDisciplinas } from './src/models/alunoDisciplinas.js';

dotenv.config();
alunosDisciplinas();



export const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(express.json());
app.use('/api', router);
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// (async () => {
//   try {
//     await sequelize.sync({ alter: true });
//     console.log('🎲 ✅ Banco de dados sincronizado!');
//   } catch (error) {
//     console.error('🎲 ❌ Erro ao sincronizar o banco de dados:', error);
//   }
// })();
