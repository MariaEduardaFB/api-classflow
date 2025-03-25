// @ts-nocheck
import { Avaliacao } from '../models/avaliacao.js';
import { Aluno } from '../models/aluno.js';
import { Disciplina } from '../models/disciplina.js';
import autenticar from '../middlewares/autenticar.js';

export function avaliacaoRoutes(router) {

  router.post('/avaliacoes', autenticar, async (req, res) => {
    const { nome, professor, data, nota, disciplinaId } = req.body;

    if (!nome || !professor || !data || nota === undefined || !disciplinaId) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
    }

    try {
      const novaAvaliacao = await Avaliacao.create({
        nome,
        professor,
        data,
        nota,
        alunoId: req.alunoId,
        disciplinaId,
      });

      res.status(201).json(novaAvaliacao);
    } catch (error) {
      console.error('Erro ao cadastrar avaliação:', error);
      res.status(500).json({ error: 'Erro ao cadastrar avaliação', detalhes: error.message });
    }
  });

  router.get('/avaliacoes', autenticar, async (req, res) => {
    try {
      const avaliacao = await Avaliacao.findAll({
        where: { alunoId: req.alunoId },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [
          { model: Disciplina, attributes: ['id', 'nome'] },
          { model: Aluno, attributes: ['id', 'nome'] }
        ],
      });

      if (avaliacao.length === 0) {
        return res.status(404).json({ message: 'Nenhuma avaliação encontrada.' });
      }

      res.json(avaliacao);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      res.status(500).json({ error: 'Erro ao buscar avaliações', detalhes: error.message });
    }
  });

  router.put('/avaliacoes/:id', autenticar, async (req, res) => {
    const { id } = req.params;
    const { nome, professor, data, nota, disciplinaId } = req.body;

    try {
      const avaliacao = await Avaliacao.findOne({
        where: { id, alunoId: req.alunoId },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });

      if (!avaliacao) {
        return res.status(404).json({ error: 'Avaliação não encontrada!' });
      }

      avaliacao.nome = nome;
      avaliacao.professor = professor;
      avaliacao.data = data;
      avaliacao.nota = nota;
      avaliacao.disciplinaId = disciplinaId;

      await avaliacao.save();

      res.json({ message: 'Avaliação atualizada com sucesso!', avaliacao });
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      res.status(400).json({ error: 'Erro ao atualizar avaliação', detalhes: error.message });
    }
  });

  router.delete('/avaliacoes/:id', autenticar, async (req, res) => {
    const { id } = req.params;

    try {
      const avaliacao = await Avaliacao.findOne({
        where: { id, alunoId: req.alunoId },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });

      if (!avaliacao) {
        return res.status(404).json({ error: 'Avaliação não encontrada!' });
      }

      await avaliacao.destroy();
      res.json({ message: 'Avaliação excluída com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      res.status(500).json({ error: 'Erro ao excluir avaliação', detalhes: error.message });
    }
  });
}
