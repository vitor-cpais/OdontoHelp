# OdontoHelp

Sistema odontológico com backend Spring Boot, frontend React e PostgreSQL.

> Repositório público: **não** commite `.env` com senhas reais. Use `.env.example` (local) ou `.env.production.example` (VPS).

## Inicio rapido (Docker — local)

```powershell
cd C:\Estudo\OdontoHelp
docker compose up -d --build
```

Opcional: `copy .env.example .env` para customizar portas/senhas.

| Servico | URL |
|---------|-----|
| Aplicacao | http://localhost:5173 |
| API / Swagger | http://localhost:8080/swagger-ui.html |

Login seed (dev): `admin@odonto.com` / `123456`

## Produção

Na VPS, clone o repositório e crie o `.env` real a partir do exemplo:

```bash
cp .env.production.example .env
```

Edite o `.env` com os dados do servidor:

- `POSTGRES_PASSWORD`, `JWT_SECRET` e `APP_ADMIN_PASSWORD` fortes.
- `VITE_API_URL` apontando para a API, por exemplo `http://IP_DA_VPS:8080` enquanto estiver sem domínio.
- `CORS_ORIGINS` e `APP_FRONTEND_URL` apontando para o front, por exemplo `http://IP_DA_VPS`.
- SMTP real para recuperação de senha.

Subir produção:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Em produção, mantenha o arquivo `.env` somente no servidor.

Comandos úteis na VPS:

```bash
docker ps
docker logs odontohelp-backend --tail 100
docker logs odontohelp-frontend --tail 50
```

Se mudar `VITE_API_URL`, recrie o frontend porque essa variável entra no build:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache frontend
docker rm -f odontohelp-frontend
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d frontend
```

Com IP público e sem proxy HTTPS, o front fica em `http://IP_DA_VPS` e a API em `http://IP_DA_VPS:8080`. Libere as portas necessárias no firewall da VPS e na rede da cloud.

## Estrutura

```text
OdontoHelp/
  docker-compose.yml          # desenvolvimento local
  docker-compose.prod.yml     # overlay VPS / producao
  OdontoHelp-Back/          # API Java
  OdontoHelp-Front/
    odonto-help-frontend/   # React + Vite
```

## Comandos Docker (resumo)

Desenvolvimento local:

```powershell
docker compose up -d --build
docker compose build frontend && docker compose up -d frontend
docker compose build backend && docker compose up -d backend
docker compose up -d postgres
docker compose stop frontend
docker compose down
```

Produção:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d frontend
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d backend
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## Segurança (repo público)

| Faça | Não faça |
|------|----------|
| `copy .env.example .env` e altere senhas/JWT | Commitar `.env`, `.env.local`, `.env.production` |
| `docker compose` com variáveis do `.env` | Reutilizar chaves JWT de exemplos em produção |
| Manter `**/dist/` e `node_modules/` fora do Git | Subir build do front (`dist/`) — o Docker gera na imagem |

Arquivos ignorados: ver [.gitignore](.gitignore).
