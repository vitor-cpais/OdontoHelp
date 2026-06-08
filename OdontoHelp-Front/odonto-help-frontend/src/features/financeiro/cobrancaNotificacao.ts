import { fmtData, fmtMoeda } from './financeiroLabels';
import type { ParcelaReceber } from './types';

export function formatLembreteCobrancaMessage(parcela: ParcelaReceber): string {
  const nome = parcela.pacienteNome ?? 'paciente';
  const saldo = fmtMoeda(parcela.saldo);
  const vencimento = fmtData(parcela.dataVencimento);
  const descricao = parcela.cobrancaDescricao ?? `cobrança #${parcela.cobrancaId}`;
  return (
    `Olá ${nome}, identificamos uma pendência de ${saldo} referente a ${descricao}, ` +
    `com vencimento em ${vencimento}. Por favor, entre em contato para regularizar. Obrigado!`
  );
}

export function buildWhatsAppCobrancaUrl(telefone: string, message: string): string {
  const digits = telefone.replace(/\D/g, '');
  if (!digits) return '';
  const phone = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
