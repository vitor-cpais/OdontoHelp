# OdontoHelp

Sistema odontológico — Spring Boot, React, PostgreSQL e MinIO.

> Não commite `.env` com senhas reais. Use `.env.example` (local) ou `.env.production.example` (VPS).

## Local

```powershell
cd C:\Estudo\OdontoHelp
docker compose up -d --build
```

Opcional: `copy .env.example .env`

| Serviço | URL |
|---------|-----|
| Front | http://localhost:5173 |
| API | http://localhost:8080 |
| Financeiro | http://localhost:8081 |
| Fiscal | http://localhost:8082 |
| Swagger | http://localhost:8080/swagger-ui.html |

Login dev: `admin@odonto.com` / `123456`

Front com hot reload:

```powershell
docker compose stop frontend
cd OdontoHelp-Front\odonto-help-frontend
npm install && npm run dev
```

## Produção

```bash
cp .env.production.example .env
# edite senhas, dominios, JWT e SMTP
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Mantenha o `.env` só no servidor.

## Estrutura

```text
OdontoHelp/
  docker-compose.yml
  docker-compose.prod.yml
  OdontoHelp-Back/
  OdontoHelp-Financeiro/
  odontohelp-fiscal/
  OdontoHelp-Front/odonto-help-frontend/
```
