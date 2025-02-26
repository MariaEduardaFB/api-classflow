import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Documento = sequelize.define('documentos', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    src: {
        type: DataTypes.STRING,
        allowNull: false
    },
    alunoId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

export default Documento;