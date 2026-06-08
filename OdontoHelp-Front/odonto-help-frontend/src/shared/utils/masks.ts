export function maskCpf(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskTelefone(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

/** Ocultação parcial para exibição (LGPD). */
export function ocultarCpf(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 11) return '***.***.***-**';
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

/** Ocultação parcial para exibição (LGPD). */
export function ocultarTelefone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 10) return '(**) *****-****';
  const ddd = digits.slice(0, 2);
  const sufixo = digits.slice(-2);
  if (digits.length === 11) {
    return `(${ddd}) ${digits[2]}****-**${sufixo}`;
  }
  return `(${ddd}) ****-**${sufixo}`;
}

export function maskCro(value: string): string {
  // Formato: UF-NNNNN ex: SP-12345
  const digits = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2, 7)}`;
}

export function maskData(value: string): string {
  // Formato: DD/MM/YYYY
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

export function formatDataToISO(dataBr: string): string {
  // Converte DD/MM/YYYY para YYYY-MM-DD
  const match = dataBr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return '';
  const [, dia, mes, ano] = match;
  return `${ano}-${mes}-${dia}`;
}

export function formatDataFromISO(dataISO: string): string {
  // Converte YYYY-MM-DD para DD/MM/YYYY
  const match = dataISO.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return '';
  const [, ano, mes, dia] = match;
  return `${dia}/${mes}/${ano}`;
}

export function isValidBirthDate(dataBr: string): boolean {
  // Valida se é uma data de nascimento realista
  const match = dataBr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return false;
  
  const [, dia, mes, ano] = match;
  const year = parseInt(ano);
  const month = parseInt(mes);
  const day = parseInt(dia);
  
  // Rejeita datas antes de 1900
  if (year < 1900) return false;
  
  // Rejeita datas no futuro
  const date = new Date(year, month - 1, day);
  if (date > new Date()) return false;
  
  // Rejeita datas inválidas
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  return true;
}
