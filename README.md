# Controle Hospitalar - T2 DW3

Trabalho 2 de Desenvolvimento Web 3 - IFSP Votuporanga.

CRUD de Pacientes e Consultas (1:N) do módulo saúde de um ERP hospitalar.

- Back-end: Node.js + Express + PostgreSQL (porta 42000)
- Front-end: Node.js + Express + Nunjucks (porta 42100)
- Os dois servidores rodam em containers Docker.

## Como rodar

1. Banco: com o PostgreSQL na porta 5432, criar o banco `hospital` e executar `backend/databaseConfig.sql`.
2. Liberar o PostgreSQL para o container (veja a seção abaixo).
3. Back-end: em `backend/`, copiar `.env.example` para `.env` e preencher.
4. Subir os containers: `bash subir-docker.sh`
5. Acessar http://localhost:42100 (usuário `qwe`, senha `qwe`).

## Liberando o PostgreSQL para o container do back-end

O back-end roda dentro de um container e acessa o PostgreSQL da máquina pelo
endereço `172.17.0.1` (gateway da rede padrão do Docker, variável `DB_HOST` do `.env`).
Por padrão o PostgreSQL só aceita conexões em `localhost`, então é preciso:

1. No arquivo `postgresql.conf`, permitir conexões externas:

   ```
   listen_addresses = '*'
   ```

2. No arquivo `pg_hba.conf`, liberar a rede do Docker:

   ```
   host    all    all    172.17.0.0/16    scram-sha-256
   ```

3. Reiniciar o PostgreSQL:

   ```
   sudo systemctl restart postgresql
   ```

Para descobrir onde ficam esses arquivos: `sudo -u postgres psql -c "SHOW config_file;"`
e `sudo -u postgres psql -c "SHOW hba_file;"`.

Se o back-end mostrar `ECONNREFUSED` nos logs (`docker logs hospital_backend_ctner`),
normalmente é um desses passos que ficou faltando.
