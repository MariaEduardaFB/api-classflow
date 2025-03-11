// @ts-nocheck
import jwt from 'jsonwebtoken';
import Documentos from '../models/documentos.js'; // Importação corrigida
import { Aluno } from '../models/aluno.js';
import { router } from './index.js';
import multer from 'multer';
import path from "path";
import { uploadFileMiddleware } from '../middlewares/fileUpload.js';
import { error } from 'console';

const SECRET_KEY = process.env.JWT_SECRET;

export function documentoRoutes(router) {
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

  router.post('/documentos', autenticar, uploadFileMiddleware, async (req, res) => {
    const { nome } = req.body;
    const { alunoId, file } = req;

    if (!nome) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'O arquivo do documento é obrigatório!' });
    }

    try {
      const novoDocumento = await Documentos.create({
        nome,
        alunoId,
        src: file.filename, // Salvando o caminho do arquivo no campo 'src'
      });

      res.status(201).json(novoDocumento);
    } catch (error) {
      res.status(500).json({
        error: 'Erro ao cadastrar documento',
        detalhes: error.message,
      });
    }
  });

  router.get('/documentos', autenticar, async (req, res) => {
    try {
      const documentos = await Documentos.findAll({
        where: { alunoId: req.alunoId },
      });
      if (documentos.length === 0) {
        return res.status(404).json({ message: 'Nenhum documento encontrado.' });
      }

      const documentosComUrl = documentos.map(doc => ({
        ...doc.toJSON(),
        url: `${req.protocol}://${req.get('host')}/uploads/${doc.src}`
      }));

      res.json(documentosComUrl);
      // res.json(documentos);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      res.status(500).json({ error: 'Erro ao buscar documentos', detalhes: error.message });
    }
  });

  // Editar documento
  router.put('/documentos/:id', autenticar, uploadFileMiddleware, async (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;

    try {
      const documentoAntigo = await Documentos.findOne({
        where: { id, alunoId: req.alunoId },
      });

      if (!documentoAntigo) {
        return res.status(404).json({ error: 'Documento não encontrado!' });
      }

      const updatedData = {
        nome: nome || documentoAntigo.nome,
        src: req.file ? req.file.filename : documentoAntigo.src,
      };

      await Documentos.update(updatedData, {
        where: { id, alunoId: req.alunoId },
      });

      const documentoAtualizado = await Documentos.findOne({
        where: { id, alunoId: req.alunoId },
      });

      res.json({ message: 'Documento atualizado com sucesso!', documentoAtualizado });
    } catch (error) {
      res.status(400).json({ error: 'Erro ao atualizar documento', detalhes: error.message });
    }
  });

  // Excluir documento
  router.delete('/documentos/:id', autenticar, async (req, res) => {
    const { id } = req.params;
    try {
      const documento = await Documentos.findOne({
        where: { id, alunoId: req.alunoId },
      });
      if (!documento) {
        return res.status(404).json({ error: 'Documento não encontrado!' });
      }

      await documento.destroy();
      res.json({ message: 'Documento excluído com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir documento', detalhes: error.message });
    }
  });
}