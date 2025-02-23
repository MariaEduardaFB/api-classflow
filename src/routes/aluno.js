// @ts-nocheck
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Aluno } from '../models/aluno.js';

const SECRET_KEY = process.env.JWT_SECRET;

export function alunoRoutes(router) {
  // Registro de alunos
  router.post('/alunos/register', async (req, res) => {
    const { nome, matricula, email, senha, curso } = req.body;

    // Validações manuais
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
    if (!matricula)
      return res.status(400).json({ error: 'Matrícula é obrigatória' });
    if (!email) return res.status(400).json({ error: 'Email é obrigatório' });
    if (!senha) return res.status(400).json({ error: 'Senha é obrigatória' });
    if (senha.length < 6)
      return res
        .status(400)
        .json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    if (!curso) return res.status(400).json({ error: 'Curso é obrigatório' });

    try {
      const hashedPassword = await bcrypt.hash(senha, 10);
      const novoAluno = await Aluno.create({
        nome,
        matricula,
        email,
        senha: hashedPassword,
        curso,
      });
      res
        .status(201)
        .json({ message: 'Aluno registrado com sucesso!', data: novoAluno });
    } catch (error) {
      res
        .status(400)
        .json({ error: 'Erro ao registrar aluno', detalhes: error.message });
    }
  });

  // Login de alunos
  router.post('/alunos/login', async (req, res) => {
    const { email, senha } = req.body;

    // Validações manuais
    if (!email) return res.status(400).json({ error: 'Email é obrigatório' });
    if (!senha) return res.status(400).json({ error: 'Senha é obrigatória' });

    try {
      const aluno = await Aluno.findOne({ where: { email } });
      if (!aluno) return res.status(404).json({ error: 'Login inválido!' });

      const senhaValida = await bcrypt.compare(senha, aluno.senha);
      if (!senhaValida)
        return res.status(401).json({ error: 'Credenciais inválidas!' });

      const token = jwt.sign({ id: aluno.id }, SECRET_KEY, {
        expiresIn: '24h',
      }); // Expiração ajustada para 24 horas

      res.json({ token, message: 'Login bem-sucedido!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro no login', detalhes: error.message });
    }
  });

  // Perfil do aluno autenticado
  router.get('/alunos/perfil', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
      return res.status(401).json({ error: 'Token não fornecido!' });

    const token = authHeader.split(' ')[1]; // Remove o prefixo 'Bearer'
    if (!token)
      return res.status(401).json({ error: 'Token inválido ou ausente!' });

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const aluno = await Aluno.findByPk(decoded.id, {
        attributes: { exclude: ['senha'] },
      });
      if (!aluno)
        return res.status(404).json({ error: 'Aluno não encontrado!' });

      res.json(aluno);
    } catch (error) {
      res.status(401).json({ error: 'Token inválido ou expirado!' });
    }
  });

  // Editar informações do aluno
  router.put('/alunos/editar', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
      return res.status(401).json({ error: 'Token não fornecido!' });

    const token = authHeader.split(' ')[1]; // Remove o prefixo 'Bearer'
    if (!token)
      return res.status(401).json({ error: 'Token inválido ou ausente!' });

    const { nome, matricula, email, senha, curso } = req.body;

    try {
      // Verificar o token e pegar o ID do aluno
      const decoded = jwt.verify(token, SECRET_KEY);
      const aluno = await Aluno.findByPk(decoded.id);

      if (!aluno)
        return res.status(404).json({ error: 'Aluno não encontrado!' });

      // Atualizar as informações
      const updateData = {};

      if (nome) updateData.nome = nome;
      if (matricula) updateData.matricula = matricula;
      if (email) updateData.email = email;
      if (curso) updateData.curso = curso;

      // Verificar se a senha foi fornecida e atualizar se necessário
      if (senha) {
        if (senha.length < 6)
          return res
            .status(400)
            .json({ error: 'Senha deve ter no mínimo 6 caracteres' });
        const hashedPassword = await bcrypt.hash(senha, 10);
        updateData.senha = hashedPassword;
      }

      await aluno.update(updateData);

      res.json({ message: 'Informações do aluno atualizadas com sucesso!' });
    } catch (error) {
      res.status(401).json({
        error: 'Token inválido ou expirado!',
        detalhes: error.message,
      });
    }
  });
}
