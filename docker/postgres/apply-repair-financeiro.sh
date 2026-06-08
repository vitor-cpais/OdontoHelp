#!/bin/sh
# VPS: cd ~/OdontoHelp && sh docker/postgres/apply-repair-financeiro.sh
set -eu
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  POSTGRES_USER="$(grep -E '^POSTGRES_USER=' .env | cut -d= -f2- | tr -d '\r' || true)"
  POSTGRES_DB="$(grep -E '^POSTGRES_DB=' .env | cut -d= -f2- | tr -d '\r' || true)"
fi
POSTGRES_USER="${POSTGRES_USER:-odontohelp}"
POSTGRES_DB="${POSTGRES_DB:-odontohelp}"

echo "Reparando schema financeiro (user=$POSTGRES_USER db=$POSTGRES_DB)..."
docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  < "$ROOT/docker/postgres/repair-financeiro-v3.sql"

echo "Verificando colunas..."
docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c \
  "SELECT column_name FROM information_schema.columns WHERE table_schema='financeiro' AND table_name='cliente_financeiro' AND column_name LIKE '%encrypted%';"

echo "Rebuild financeiro..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build financeiro

echo "Aguarde ~30s e rode: docker compose ps && docker logs odontohelp-financeiro --tail 15"
