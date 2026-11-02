# Controle Hospitalar - T2 DW3

Trabalho 2 de Desenvolvimento Web 3 - IFSP Votuporanga.

CRUD de Pacientes e Consultas (1:N) do módulo saúde de um ERP hospitalar.

- Back-end: Node.js + Express + PostgreSQL (porta 42000)
- Front-end: Node.js + Express + Nunjucks (porta 42100)
- Os dois servidores rodam em containers Docker.

## Como rodar

1. Banco: com o PostgreSQL na porta 5432, criar o banco `hospital` e executar `backend/databaseConfig.sql`.
2. Back-end: em `backend/`, copiar `.env.example` para `.env` e preencher.
3. Subir os containers: `bash subir-docker.sh`
4. Acessar http://localhost:42100 (usuário `qwe`, senha `qwe`).
