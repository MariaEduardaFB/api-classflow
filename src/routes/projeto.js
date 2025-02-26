// @ts-nocheck
import jwt from 'jsonwebtoken';
import { Projeto } from '../models/projeto.js';
import { Aluno } from '../models/aluno.js';
import { router } from './index.js';
import autenticar from '../middlewares/autenticar.js';
import upload from '../middlewares/upload.js';
import fs from 'fs';

const SECRET_KEY = process.env.JWT_SECRET;

export function projetoRoutes(router) {
  router.post('/projetos', autenticar, upload.single('file'), async (req, res) => {
    const { titulo, descricao, status, notas } = req.body;
    const { file } = req;

    console.log('Dados recebidos no servidor:', {
      titulo,
      descricao,
      status,
      notas,
      src: file ? file.path : null,
    });

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
        src: file ? file.path : null,
        alunoId: req.alunoId,
      });
      res.status(201).json(novoProjeto);
    } catch (error) {
      console.error('Erro ao cadastrar projeto:', error);
      res
        .status(500)
        .json({ error: 'Erro ao cadastrar projeto', detalhes: error.message });
    }
  });

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
  router.put('/projetos/:id', autenticar, upload.single('file'), async (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, status, notas } = req.body;
    const { file } = req;

    try {
      const projeto = await Projeto.findOne({
        where: { id, alunoId: req.alunoId },
      });
      if (!projeto) {
        return res.status(404).json({ error: 'Projeto não encontrado!' });
      }

      // Atualiza os campos do projeto
      projeto.titulo = titulo;
      projeto.descricao = descricao;
      projeto.status = status;
      projeto.notas = notas;

      if (file) {
        // Remove o arquivo antigo, se existir
        if (projeto.src) {
          try {
            fs.unlinkSync(projeto.src);
          } catch (error) {
            console.error('Erro ao deletar arquivo antigo:', error);
          }
        }

        // Atualiza o caminho do novo arquivo
        projeto.src = file.path;
      }

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
      if (!projeto) {
        return res.status(404).json({ error: 'Projeto não encontrado!' });
      }

      // Remove o arquivo associado ao projeto, se existir
      if (projeto.src) {
        try {
          fs.unlinkSync(projeto.src);
        } catch (error) {
          console.error('Erro ao deletar arquivo:', error);
        }
      }

      await projeto.destroy();
      res.json({ message: 'Projeto excluído com sucesso!' });
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Erro ao excluir projeto', detalhes: error.message });
    }
  });
}
