import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Aluno } from './aluno.js';
import { Disciplina } from './disciplina.js';

export const Horario = sequelize.define(
  'Horario',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cargaHoraria: { type: DataTypes.INTEGER, allowNull: false },
    diaSemana: { type: DataTypes.STRING(20), allowNull: false },
    hInicio: { type: DataTypes.TIME, allowNull: false },
    hFim: { type: DataTypes.TIME, allowNull: false },
    alunoId: { type: DataTypes.INTEGER, allowNull: false },
    disciplinaId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'horarios',
    timestamps: false,
  }
);

Horario.belongsTo(Aluno, { foreignKey: 'alunoId' });
Horario.belongsTo(Disciplina, { foreignKey: 'disciplinaId' });
