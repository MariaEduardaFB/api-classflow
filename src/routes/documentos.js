import Documento from '../models/documentos.js';
import autenticar from '../middlewares/autenticar.js';
import upload from '../middlewares/upload.js';
import fs from 'fs';

export function documentoRoutes(router) {
    router.post('/documentos', autenticar, upload.single('file'), async (req, res) => {
      try {
        const { nome } = req.body;
        const { file } = req;
    
        if (!file) {
          return res.status(400).json({ error: 'Nenhum arquivo enviado!' });
        }
    
        const documento = await Documento.create({
          nome,
          src: file.path,
          alunoId: req.alunoId
        });
    
        res.json({ message: 'Arquivo enviado com sucesso!', data: documento });
      } catch (error) {
        res.status(500).json({ error: 'Erro ao enviar arquivo', detalhes: error.message });
      }
    });

    router.get('/documentos', autenticar, async (req, res) => {
        try {
            const documentos = await Documento.findAll({
                where: { alunoId: req.alunoId }
            });
            res.json(documentos);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar documentos', detalhes: error.message });
        }
    });

    router.put('/documentos/:id', autenticar, upload.single('file'), async (req, res) => {
      try {
          const { id } = req.params;
          const { nome } = req.body;
          const { file } = req;

          const documento = await Documento.findByPk(id);

          if (!documento) {
              return res.status(404).json({ error: 'Documento não encontrado!' });
          }

          if (nome) {
              documento.nome = nome;
          }

          if (file) {
              try {
                  fs.unlinkSync(documento.src);
              } catch (error) {
                  console.error('Erro ao deletar arquivo antigo:', error);
              }

              documento.src = file.path;
          }

          await documento.save();

          res.json({ message: 'Documento atualizado com sucesso!', data: documento });
      } catch (error) {
          res.status(500).json({ error: 'Erro ao atualizar documento', detalhes: error.message });
      }
  });

    router.delete('/documentos/:id', autenticar, async (req, res) => {
        try {
            const { id } = req.params;
            const documento = await Documento.findByPk(id);

            if (!documento) {
                return res.status(404).json({ error: 'Documento não encontrado!' });
            }

            if (documento.alunoId !== req.alunoId) {
                return res.status(403).json({ error: 'Você não tem permissão para excluir este documento!' });
            }

            try {
                fs.unlinkSync(documento.src);
            } catch (error) {
                console.error('Erro ao deletar arquivo:', error);
            }

            await documento.destroy();
            res.json({ message: 'Documento excluído com sucesso!' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao excluir documento', detalhes: error.message });
        }
    });
}