// @ts-nocheck
import { Horario } from '../models/horario.js';
import { Aluno } from '../models/aluno.js';
import { Disciplina } from '../models/disciplina.js';
import { router } from './index.js';
import autenticar from '../middlewares/autenticar.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

export function horarioRoutes(router) {
  const autenticar = async (req, res, next) => {
      const authHeader = req.headers['authorization'];
  
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token inválido ou ausente!' });
      }
  
      const token = authHeader.split(' ')[1];
  
      try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.alunoId = decoded.id; // Certifique-se de que o ID do aluno está correto
        next();
      } catch (error) {
        console.error("Erro ao verificar token:", error.message);
        res.status(401).json({ error: 'Token inválido ou expirado!' });
      }
    };


  // Cadastrar horário
  router.post('/horarios', autenticar, async (req, res) => {
    const { cargaHoraria, diaSemana, hInicio, hFim, disciplinaId } = req.body;

    if (!cargaHoraria || !diaSemana || !hInicio || !hFim || !disciplinaId) {
      return res
        .status(400)
        .json({ error: 'Todos os campos são obrigatórios!' });
    }

    try {
      const novoHorario = await Horario.create({
        cargaHoraria,
        diaSemana,
        hInicio,
        hFim,
        alunoId: req.alunoId, // Pegando o aluno autenticado
        disciplinaId,
      });
      res.status(201).json(novoHorario);
    } catch (error) {
      console.error('Erro ao cadastrar horário:', error);
      res
        .status(500)
        .json({ error: 'Erro ao cadastrar horário', detalhes: error.message });
    }
  });

  // Listar horários de um aluno
  router.get('/horarios', autenticar, async (req, res) => {
    try {
      const horarios = await Horario.findAll({
        where: { alunoId: req.alunoId },
        include: [{ model: Disciplina, attributes: ['id', 'nome'] }],
      });

      if (horarios.length === 0) {
        return res.status(404).json({ message: 'Nenhum horário encontrado.' });
      }

      res.json(horarios);
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
      res
        .status(500)
        .json({ error: 'Erro ao buscar horários', detalhes: error.message });
    }
  });

  // Editar horário
  router.put('/horarios/:id', autenticar, async (req, res) => {
    const { id } = req.params;
    const { cargaHoraria, diaSemana, hInicio, hFim, disciplinaId } = req.body;

    try {
      const horario = await Horario.findOne({
        where: { id, alunoId: req.alunoId },
      });

      if (!horario)
        return res.status(404).json({ error: 'Horário não encontrado!' });

      horario.cargaHoraria = cargaHoraria;
      horario.diaSemana = diaSemana;
      horario.hInicio = hInicio;
      horario.hFim = hFim;
      horario.disciplinaId = disciplinaId;

      await horario.save();

      res.json({ message: 'Horário atualizado com sucesso!', horario });
    } catch (error) {
      res
        .status(400)
        .json({ error: 'Erro ao atualizar horário', detalhes: error.message });
    }
  });

  // Excluir horário
  router.delete('/horarios/:id', autenticar, async (req, res) => {
    const { id } = req.params;
    try {
      const horario = await Horario.findOne({
        where: { id, alunoId: req.alunoId },
      });

      if (!horario)
        return res.status(404).json({ error: 'Horário não encontrado!' });

      await horario.destroy();
      res.json({ message: 'Horário excluído com sucesso!' });
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Erro ao excluir horário', detalhes: error.message });
    }
  });
}