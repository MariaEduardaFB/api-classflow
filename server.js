import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { sequelize } from './src/config/database.js';
import { router } from './src/routes/index.js';
import { alunosDisciplinas } from './src/models/alunoDisciplinas.js';

// Carregar variáveis de ambiente
dotenv.config();
alunosDisciplinas();

export const app = express();
app.use(cors());
app.use(express.json());
app.use(router);

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

(async () => {
  try {
    await sequelize.sync({ alter: true }); // 'alter' atualiza o banco sem apagar dados
    console.log('🎲 ✅ Banco de dados sincronizado!');
  } catch (error) {
    console.error('🎲 ❌ Erro ao sincronizar o banco de dados:', error);
  }
})();
