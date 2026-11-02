#!/usr/bin/env bash

set -e
cd "$(dirname "$0")"

echo ">> Removendo containers antigos (se existirem)..."
docker rm -f hospital_frontend_ctner hospital_backend_ctner >/dev/null 2>&1 || true

echo ">> Criando e executando o backend..."
cd backend
docker build -t hospital_backend_img:1.0 .
docker run -d --name hospital_backend_ctner --env-file .env -p 42000:42000 --restart unless-stopped hospital_backend_img:1.0
cd ..

echo ">> Criando e executando o frontend..."
cd frontend
docker build -t hospital_frontend_img:1.0 .
docker run -d --name hospital_frontend_ctner --env-file dw3frontend.env -p 42100:42100 --restart unless-stopped hospital_frontend_img:1.0
cd ..

docker ps --filter name=hospital
echo "Pronto! Abra http://localhost:42100 no navegador (usuário: qwe, senha: qwe)."
