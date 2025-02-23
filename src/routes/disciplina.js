// @ts-nocheck
import { Aluno } from '../models/aluno.js';
import { Disciplina } from '../models/disciplina.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

export function disciplinaRoutes(router) {
  // Cadastrar disciplina
  router.post('/disciplinas/cadastrar', async (req, res) => {
    try {
      const { nome, codigo, cargaHoraria, descricao, status, alunoId } =
        req.body;
      console.log(req.body);
      console.log('Status recebido no backend:', status);

      // Verificação dos campos obrigatórios
      if (!nome || !codigo || !cargaHoraria || !descricao || !alunoId) {
        return res
          .status(400)
          .json({ error: 'Todos os campos são obrigatórios.' });
      }

      // Verifica se o aluno existe
      const alunoExiste = await Aluno.findByPk(alunoId);
      if (!alunoExiste) {
        return res.status(400).json({ error: 'Aluno não encontrado.' });
      }

      // Criação da disciplina
      const novaDisciplina = await Disciplina.create({
        nome,
        codigo,
        cargaHoraria,
        descricao,
        status: status, // Se status não for enviado, usa o padrão
        alunoId,
      });

      res.status(201).json(novaDisciplina);
    } catch (error) {
      console.error('Erro ao cadastrar disciplina:', error);
      res
        .status(500)
        .json({ error: 'Erro interno do servidor', detalhes: error.message });
    }
  });

  // Listar disciplinas do aluno logado
  router.get('/disciplinas/disciplinas', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
      return res.status(401).json({ error: 'Token não fornecido!' });

    const token = authHeader.split(' ')[1]; // Remove o prefixo 'Bearer'
    if (!token)
      return res.status(401).json({ error: 'Token inválido ou ausente!' });

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const aluno = await Aluno.findByPk(decoded.id, {
        include: {
          association: 'disciplinas', // Certifique-se de configurar a associação 'disciplinas' no modelo Aluno
          attributes: { exclude: ['alunoId'] },
        },
      });

      if (!aluno)
        return res.status(404).json({ error: 'Aluno não encontrado!' });

      if (!aluno.disciplinas || aluno.disciplinas.length === 0) {
        return res
          .status(404)
          .json({ error: 'Nenhuma disciplina encontrada para este aluno!' });
      }

      res.json(aluno.disciplinas);
    } catch (error) {
      console.error('Erro ao verificar o token:', error);
      res.status(401).json({ error: 'Token inválido ou expirado!' });
    }
  });

  // Editar disciplina
  router.put('/disciplinas/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, codigo, cargaHoraria, descricao, status } = req.body;

    // Verifica se o token foi fornecido
    const authHeader = req.headers['authorization'];
    if (!authHeader)
      return res.status(401).json({ error: 'Token não fornecido!' });

    const token = authHeader.split(' ')[1]; // Remove o prefixo 'Bearer'
    if (!token)
      return res.status(401).json({ error: 'Token inválido ou ausente!' });

    try {
      // Verifica e decodifica o token
      const decoded = jwt.verify(token, SECRET_KEY);
      const alunoId = decoded.id;

      // Busca a disciplina pelo ID e pelo alunoId
      const disciplina = await Disciplina.findOne({
        where: {
          id,
          alunoId, // Garante que a disciplina pertence ao aluno logado
        },
      });

      if (!disciplina) {
        return res.status(404).json({
          error: 'Disciplina não encontrada ou não pertence ao aluno!',
        });
      }

      // Atualiza os campos da disciplina
      disciplina.nome = nome || disciplina.nome;
      disciplina.codigo = codigo || disciplina.codigo;
      disciplina.cargaHoraria = cargaHoraria || disciplina.cargaHoraria;
      disciplina.descricao = descricao || disciplina.descricao;
      disciplina.status = status || disciplina.status;

      // Salva as alterações no banco de dados
      await disciplina.save();

      res.json({ message: 'Disciplina atualizada com sucesso!', disciplina });
    } catch (error) {
      console.error('Erro ao atualizar disciplina:', error);
      res.status(500).json({
        error: 'Erro ao atualizar disciplina',
        detalhes: error.message,
      });
    }
  });

  // Excluir disciplina
  router.delete('/disciplinas/:id', async (req, res) => {
    const { id } = req.params;

    // Extrair o token do cabeçalho da requisição
    const authHeader = req.headers['authorization'];
    if (!authHeader)
      return res.status(401).json({ error: 'Token não fornecido!' });

    const token = authHeader.split(' ')[1]; // Remove o prefixo 'Bearer'
    if (!token)
      return res.status(401).json({ error: 'Token inválido ou ausente!' });

    try {
      // Verificar e decodificar o token
      const decoded = jwt.verify(token, SECRET_KEY);

      // Agora que temos o alunoId, podemos usá-lo para buscar a disciplina do aluno
      const alunoId = decoded.id;

      // Buscar a disciplina pelo id e alunoId
      const disciplina = await Disciplina.findOne({
        where: {
          id,
          alunoId, // Usando o alunoId decodificado do token
        },
      });

      if (!disciplina)
        return res.status(404).json({
          error: 'Disciplina não encontrada ou não pertence ao aluno!',
        });

      // Excluir a disciplina
      await disciplina.destroy();
      res.json({ message: 'Disciplina excluída com sucesso!' });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: 'Erro ao excluir disciplina', detalhes: error.message });
    }
  });
}
