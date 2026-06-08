#!/bin/sh
# VPS: cd ~/OdontoHelp && sh docker/postgres/apply-repair-financeiro.sh
set -eu
cd "$(dirname "$0")/../.."
USER="${POSTGRES_USER:-odontohelp}"
DB="${POSTGRES_DB:-odontohelp}"
docker compose exec -T postgres psql -U "$USER" -d "$DB" -f /scripts/repair-financeiro-v3.sql
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build financeiro
echo "Aguarde ~30s e rode: docker compose ps"
