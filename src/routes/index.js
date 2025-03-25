import express from 'express';
import { alunoRoutes } from './aluno.js';
import { avaliacaoRoutes } from './avaliacao.js';
import { disciplinaRoutes } from './disciplina.js';
import { projetoRoutes } from './projeto.js';
import { horarioRoutes } from './horario.js';
import { documentoRoutes } from './documentos.js';

export const router = express.Router();

alunoRoutes(router);
avaliacaoRoutes(router);
disciplinaRoutes(router);
projetoRoutes(router);
horarioRoutes(router);
documentoRoutes(router);
