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

## VPS (Oracle Cloud / producao)

```bash
cp .env.production.example .env
# edite dominios, JWT_SECRET, senhas
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Guia completo: [docs/OdontoHelp_Como_Rodar.md](docs/OdontoHelp_Como_Rodar.md#deploy-vps-oracle-cloud)

## Documentação

| Documento | Conteudo |
|-----------|----------|
| [**Como rodar**](docs/OdontoHelp_Como_Rodar.md) | Docker (subir, atualizar, parar cada servico), host local, banco, Swagger |
| [**Estado da aplicacao**](docs/OdontoHelp_Estado_Aplicacao.md) | Modulos, perfis, Flyway, arquitetura |
| [**Modulo clinico**](docs/OdontoHelp_Contexto_ModuloClinico.md) | Atendimento, odontograma, plano de tratamento |

## Estrutura

```text
OdontoHelp/
  docker-compose.yml          # desenvolvimento local
  docker-compose.prod.yml     # overlay VPS / producao
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
