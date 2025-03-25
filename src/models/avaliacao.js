import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Aluno } from './aluno.js';
import { Disciplina } from './disciplina.js';

export const Avaliacao = sequelize.define('Avaliacoes', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  professor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  nota: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  alunoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  disciplinaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE
  },
  updatedAt: {
    type: DataTypes.DATE
  },
},
{
  timestamps: false,
  tableName: 'avaliacoes'
});

Avaliacao.belongsTo(Aluno, { foreignKey: 'alunoId' });
Avaliacao.belongsTo(Disciplina, { foreignKey: 'disciplinaId' });
