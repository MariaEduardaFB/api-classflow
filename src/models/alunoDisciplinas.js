import { Aluno } from './aluno.js';
import { Disciplina } from './disciplina.js';

export const alunosDisciplinas = () => {
  Aluno.hasMany(Disciplina, { as: 'disciplinas', foreignKey: 'alunoId' });
  Disciplina.belongsTo(Aluno, { as: 'aluno', foreignKey: 'alunoId' });
};
