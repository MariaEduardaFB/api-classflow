CREATE DATABASE classflow;

USE classflow;

CREATE TABLE alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    matricula VARCHAR(50) NOT NULL UNIQUE,
    dataNascimento DATE NOT NULL,
    curso VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    foto VARCHAR(255) NOT NULL
);

CREATE TABLE disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    cargaHoraria INT NOT NULL,
    descricao TEXT,
    status ENUM('Pendente', 'Em andamento', 'Concluída') NOT NULL,
    alunoId INT NOT NULL,
    FOREIGN KEY (alunoId) REFERENCES alunos(id)
);

CREATE TABLE documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    src VARCHAR(255) NOT NULL,
    alunoId INT NOT NULL,
    FOREIGN KEY (alunoId) REFERENCES alunos(id)
);

CREATE TABLE projetos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    status ENUM('Em andamento', 'Concluído') NOT NULL DEFAULT 'Em andamento',
    notas TEXT,
    alunoId INT NOT NULL,
    FOREIGN KEY (alunoId) REFERENCES alunos(id) ON DELETE CASCADE
);

CREATE TABLE horarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cargaHoraria INT NOT NULL,
    diaSemana VARCHAR(20) NOT NULL,
    hInicio TIME NOT NULL,
    hFim TIME NOT NULL,
    alunoId INT NOT NULL,
    disciplinaId INT NOT NULL,
    FOREIGN KEY (alunoId) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplinaId) REFERENCES disciplinas(id) ON DELETE CASCADE
);
