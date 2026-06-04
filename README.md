# OdontoHelp

Sistema odontológico com backend Spring Boot, frontend React e PostgreSQL.

> Repositório público: use sempre `.env` local (a partir de `.env.example`). **Não** commite senhas, `JWT_SECRET` nem arquivos `.env*` com valores reais.

## Inicio rapido (Docker)

```powershell
cd C:\Estudo\OdontoHelp
copy .env.example .env
docker compose up -d --build
```

| Servico | URL |
|---------|-----|
| Aplicacao | http://localhost:5173 |
| API / Swagger | http://localhost:8080/swagger-ui.html |

Credenciais padrão de desenvolvimento (seed): definidas em `APP_ADMIN_*` no seu `.env`. O compose exige `JWT_SECRET` no `.env` — gere uma chave nova antes de expor a API na internet.

## Documentação

| Documento | Conteudo |
|-----------|----------|
| [**Como rodar**](docs/OdontoHelp_Como_Rodar.md) | Docker (subir, atualizar, parar cada servico), host local, banco, Swagger |
| [**Estado da aplicacao**](docs/OdontoHelp_Estado_Aplicacao.md) | Modulos, perfis, Flyway, arquitetura |
| [**Modulo clinico**](docs/OdontoHelp_Contexto_ModuloClinico.md) | Atendimento, odontograma, plano de tratamento |

## Estrutura

```text
OdontoHelp/
  docker-compose.yml
  OdontoHelp-Back/          # API Java
  OdontoHelp-Front/
    odonto-help-frontend/   # React + Vite
  docs/
```

## Comandos Docker (resumo)

```powershell
docker compose up -d --build              # tudo
docker compose build frontend && docker compose up -d frontend
docker compose build backend  && docker compose up -d backend
docker compose up -d postgres             # so banco
docker compose stop frontend              # parar um servico
docker compose down                       # parar tudo
```

Detalhes, fluxos de desenvolvimento e troubleshooting: [docs/OdontoHelp_Como_Rodar.md](docs/OdontoHelp_Como_Rodar.md).

## Segurança (repo público)

| Faça | Não faça |
|------|----------|
| `copy .env.example .env` e altere senhas/JWT | Commitar `.env`, `.env.local`, `.env.production` |
| `docker compose` com variáveis do `.env` | Reutilizar chaves JWT de exemplos em produção |
| Manter `**/dist/` e `node_modules/` fora do Git | Subir build do front (`dist/`) — o Docker gera na imagem |

Arquivos ignorados: ver [.gitignore](.gitignore).
