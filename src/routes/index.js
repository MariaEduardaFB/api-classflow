import express from 'express';
import { alunoRoutes } from './aluno.js';
import { disciplinaRoutes } from './disciplina.js';
import { projetoRoutes } from './projeto.js';

export const router = express.Router();


alunoRoutes(router);
disciplinaRoutes(router);
projetoRoutes(router);
