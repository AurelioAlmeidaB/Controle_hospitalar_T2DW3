-- arquivo: backend/databaseConfig.sql
-- Módulo saúde: Controle Hospitalar
-- Relacionamento 1:N -> um paciente possui várias consultas.

----- Cria o banco de dados (executar conectado ao banco postgres)
-- create database hospital;

create table IF NOT EXISTS pacientes (
    pacienteid bigserial constraint pk_pacientes PRIMARY KEY,
    cpf varchar(14) UNIQUE,
    nome varchar(60),
    datanascimento date,
    telefone varchar(20),
    removido boolean DEFAULT false
);

insert into pacientes values
    (default, '123.456.789-00', 'José das Neves', '1980-05-14', '(17) 99111-2233'),
    (default, '234.567.890-11', 'Maria Silveira', '1992-11-02', '(17) 99222-3344'),
    (default, '345.678.901-22', 'Carlos Pereira', '1965-03-28', '(17) 99333-4455')
    ON CONFLICT DO NOTHING;

create table IF NOT EXISTS consultas (
    consultaid bigserial constraint pk_consultas PRIMARY KEY,
    dataconsulta date,
    medico varchar(60),
    motivo varchar(100),
    valor numeric(10,2),
    pacienteid bigint constraint fk_consulta_paciente REFERENCES pacientes,
    removido boolean DEFAULT false
);

insert into consultas values
    (1, '2026-10-05', 'Dra. Ana Souza', 'Consulta de rotina', 250.00,
        (SELECT pacienteid from pacientes where cpf = '123.456.789-00')),
    (2, '2026-10-12', 'Dr. Paulo Lima', 'Dor nas costas', 320.50,
        (SELECT pacienteid from pacientes where cpf = '234.567.890-11')),
    (3, '2026-10-20', 'Dra. Ana Souza', 'Retorno de exames', 180.00,
        (SELECT pacienteid from pacientes where cpf = '123.456.789-00'))
    ON CONFLICT DO NOTHING;

-- Ajusta a sequência após inserir IDs fixos
SELECT setval('consultas_consultaid_seq', (SELECT COALESCE(MAX(consultaid), 1) FROM consultas));

create table IF NOT EXISTS usuarios (
    usuarioid bigserial constraint pk_usuarios PRIMARY KEY,
    username varchar(10) UNIQUE,
    password text,
    removido boolean DEFAULT false
);

CREATE EXTENSION if NOT EXISTS pgcrypto;

insert into usuarios values
    (default, 'admin', crypt('admin', gen_salt('bf'))), -- senha criptografada com bcrypt
    (default, 'qwe', crypt('qwe', gen_salt('bf'))) -- senha criptografada com bcrypt
    ON CONFLICT DO NOTHING;
