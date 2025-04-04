CREATE DATABASE classflow;

USE classflow;

CREATE TABLE alunos (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255),
    matricula VARCHAR(255),
    email VARCHAR(255),
    senha VARCHAR(255),
    curso VARCHAR(255),
    createdAt DATETIME,
    updatedAt DATETIME
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
    src VARCHAR(255) NOT NULL,
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

CREATE TABLE Avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    professor VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    nota FLOAT NOT NULL CHECK (nota >= 0 AND nota <= 10),
    alunoId INT NOT NULL,
    disciplinaId INT NOT NULL,
    FOREIGN KEY (alunoId) REFERENCES Alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplinaId) REFERENCES Disciplinas(id) ON DELETE CASCADE
);
