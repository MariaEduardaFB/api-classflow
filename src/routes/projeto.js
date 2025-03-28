// @ts-nocheck
import jwt from 'jsonwebtoken';
import { Projeto } from '../models/projeto.js';
import { Aluno } from '../models/aluno.js';
import { router } from './index.js';
import multer from 'multer';
import path from "path";
import { uploadFileMiddleware } from '../middlewares/fileUpload.js';
import { error } from 'console';

const SECRET_KEY = process.env.JWT_SECRET;

export function projetoRoutes(router) {
  // Middleware para autenticação
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

  router.post('/projeto', autenticar,
    uploadFileMiddleware,
    async (req, res) => {
      const { titulo, descricao, status, notas } = req.body;
      const { alunoId, file } = req;

      console.log(status, '88888888888')

      if (!titulo || !descricao || !status)
        return res
          .status(400)
          .json({ error: 'Todos os campos são obrigatórios!' });

      if (!req.file)
        return res
          .status(400)
          .json({ error: 'O arquivo do projeto é obrigatório!' });


      if (status !== 'Em Andamento' && status !== 'Concluído' && status !== 'Pendente')
        return res
          .status(400)
          .json({ error: 'O status do projeto é inválido!' });


      try {
        
        const novoProjeto = await Projeto.create({
          titulo,
          descricao,
          status,
          notas,
          alunoId,
          caminhoDoArquivo: file.filename,
        });


        res.status(201).json(novoProjeto);
      } catch (error) {

        res.status(500).json({
          error: 'Erro ao cadastrar projeto',
          detalhes: error.message,
        });
      }
    }
  );


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
  router.put('/projetos/:id', autenticar, uploadFileMiddleware, async (req, res) => {

    const { id } = req.params;
    const { titulo, descricao, status, notas } = req.body;


    if (status && (status !== 'Em andamento' && status !== 'Concluído' && status !== 'Pendente'))
      return res
        .status(400)
        .json({ error: 'O status do projeto é inválido!' });


    try {

      const projetoAntigo = await Projeto.findOne({
        where: { id, alunoId: req.alunoId },
      });

      if (!projetoAntigo)
        return res.status(404).json({ error: 'Projeto não encontrado!' });

      await Projeto.update(
        { titulo, descricao, status, notas },
        { where: { id, alunoId: req.alunoId } }
      );

      const projetoAtualizado = await Projeto.findOne({
        where: { id, alunoId: req.alunoId },
      });



      res.json({ message: 'Projeto atualizado com sucesso!', projetoAtualizado });
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