import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Aluno = sequelize.define('Aluno', {
  nome: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  matricula: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  senha: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  curso: { 
    type: DataTypes.STRING, 
    allowNull: false 
  }
});
