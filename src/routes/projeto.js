// @ts-nocheck
import jwt from 'jsonwebtoken';
import { Projeto } from '../models/projeto.js';
import { Aluno } from '../models/aluno.js';
import { router } from './index.js';
import { uploadFileMiddleware } from '../middleware/uploadFile.js';
import multer from 'multer';
import path from "path";

const SECRET_KEY = process.env.JWT_SECRET;

export function projetoRoutes(router) {
  // Middleware para autenticação
  const autenticar = async (req, res, next) => {
    const token = req.headers['authorization'].split(' ')[1];
    if (!token)
      return res.status(401).json({ error: 'Token inválido ou ausente!' });

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.alunoId = decoded.id; // Certifique-se de que o ID do aluno está sendo definido
      next();
    } catch (error) {
      res.status(401).json({ error: 'Token inválido ou expirado!6' });
    }
  };

  // Cadastrar projeto com upload de arquivo
  router.post(
    '/projeto',
    autenticar,
    uploadFileMiddleware,
    async (req, res) => {
      const { titulo, descricao, status, notas } = req.body;

      if (!titulo || !descricao || !status) {
        return res
          .status(400)
          .json({ error: 'Todos os campos são obrigatórios!' });
      }

      try {
        const novoProjeto = await Projeto.create({
          titulo,
          descricao,
          status,
          notas,
          alunoId: req.alunoId,
          caminhoDoArquivo: req.file.path,
        });
        res.status(201).json(novoProjeto);
      } catch (error) {
        console.error('Erro ao cadastrar projeto:', error);
        res.status(500).json({
          error: 'Erro ao cadastrar projeto',
          detalhes: error.message,
        });
      }
    }
  );

  // Listar projetos
  router.get('/projetos', autenticar, async (req, res) => {
    try {
      const projetos = await Projeto.findAll({
        where: { alunoId: req.alunoId },
      });
      if (projetos.length === 0) {
        return res.status(404).json({ message: 'Nenhum projeto encontrado.' });
      }
      res.json(projetos);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      res
        .status(500)
        .json({ error: 'Erro ao buscar projetos', detalhes: error.message });
    }
  });

  // Editar projeto
  router.put('/projetos/:id', autenticar, async (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, status, notas } = req.body;
    try {
      const projeto = await Projeto.findOne({
        where: { id, alunoId: req.alunoId },
      });
      if (!projeto)
        return res.status(404).json({ error: 'Projeto não encontrado!' });

      projeto.titulo = titulo;
      projeto.descricao = descricao;
      projeto.status = status;
      projeto.notas = notas;
      await projeto.save();

      res.json({ message: 'Projeto atualizado com sucesso!', projeto });
    } catch (error) {
      res
        .status(400)
        .json({ error: 'Erro ao atualizar projeto', detalhes: error.message });
    }
  });

  // Excluir projeto
  router.delete('/projetos/:id', autenticar, async (req, res) => {
    const { id } = req.params;
    try {
      const projeto = await Projeto.findOne({
        where: { id, alunoId: req.alunoId },
      });
      if (!projeto)
        return res.status(404).json({ error: 'Projeto não encontrado!' });

      await projeto.destroy();
      res.json({ message: 'Projeto excluído com sucesso!' });
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Erro ao excluir projeto', detalhes: error.message });
    }
  });
}
