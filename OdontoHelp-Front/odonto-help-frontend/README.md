# OdontoHelp Frontend

Frontend da plataforma OdontoHelp, construido com React, TypeScript, Vite, MUI v5, TanStack Query, React Hook Form, Zustand, Recharts e FullCalendar.

## Como Rodar

```powershell
npm install
npm run dev
```

## Scripts

- `npm run dev`: inicia o Vite em modo desenvolvimento.
- `npm run build`: executa TypeScript e gera build de producao.
- `npm run preview`: serve o build localmente.
- `npm run lint`: executa ESLint em `src`.

## Estrutura Atual

- `src/app`: bootstrap, router e query client.
- `src/shared`: componentes compartilhados, tema atual, store de auth, lib Axios e utils.
- `src/features`: telas, hooks, services, stores e tipos por modulo.

## Evolucao Planejada

A migracao arquitetural deve seguir o guia de Sprint 0 em `../../docs/OdontoHelp_Frontend_Sprint0.md`.

Diretrizes principais:

- evoluir sem big bang;
- criar `design-system` e `domains` ao lado da estrutura atual;
- migrar uma tela ou fluxo por vez;
- manter React Query como cache de API;
- limitar Zustand a sessao, UI cross-feature, drafts e preferencias.
