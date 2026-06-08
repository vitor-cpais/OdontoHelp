import type { PerfilUsuario } from '../../shared/store/authStore';

export interface OnboardingStep {
  title: string;
  description: string;
}

const STEPS_COMUM: OnboardingStep[] = [
  {
    title: 'Bem-vindo ao OdontoHelp',
    description:
      'Este guia rápido mostra o fluxo principal do sistema. Você pode rever o tutorial a qualquer momento pelo ícone de ajuda no topo da tela.',
  },
];

const STEPS_DASHBOARD: OnboardingStep = {
  title: 'Dashboard',
  description:
    'Acompanhe resumos do dia, status dos agendamentos e indicadores da clínica. É o ponto de partida para recepção e administração.',
};

const STEPS_AGENDAMENTOS: OnboardingStep = {
  title: 'Agendamentos',
  description:
    'Crie e gerencie consultas no calendário. A partir de um agendamento você pode iniciar o atendimento clínico quando o paciente chegar.',
};

const STEPS_PACIENTES: OnboardingStep = {
  title: 'Pacientes e prontuário',
  description:
    'Cadastre pacientes e abra o prontuário para ver odontograma, plano de tratamento, histórico, documentos e fotos. Na aba Documentos é possível enviar radiografias, laudos e a foto principal.',
};

const STEPS_ATENDIMENTOS: OnboardingStep = {
  title: 'Atendimentos clínicos',
  description:
    'Durante a consulta, registre procedimentos no odontograma. Dentes com borda laranja têm itens pendentes no plano — ao selecionar o dente, o sistema sugere o que fazer. Anexe receitas e exames na aba Dados. Em emergências, é possível iniciar um atendimento avulso (sem agenda prévia) pela tela de Atendimentos.',
};

const STEPS_ADMIN: OnboardingStep[] = [
  {
    title: 'Usuários e procedimentos',
    description:
      'Como administrador, cadastre usuários (recepção, dentistas) e mantenha a tabela de procedimentos atualizada para uso no plano e nos atendimentos.',
  },
  {
    title: 'Pronto para começar',
    description:
      'Fluxo sugerido: cadastre pacientes → crie agendamentos → inicie atendimento → registre procedimentos → finalize e acompanhe o histórico.',
  },
];

const STEPS_DENTISTA_FIM: OnboardingStep = {
  title: 'Pronto para começar',
  description:
    'Fluxo sugerido: veja sua agenda → abra o paciente → inicie o atendimento → use o odontograma e as sugestões do plano → finalize a consulta.',
};

const STEPS_RECEPCAO_FIM: OnboardingStep = {
  title: 'Pronto para começar',
  description:
    'Fluxo sugerido: cadastre ou localize o paciente → agende a consulta → no dia, o dentista inicia o atendimento a partir do agendamento.',
};

export function getOnboardingSteps(perfil: PerfilUsuario | undefined): OnboardingStep[] {
  if (!perfil) return STEPS_COMUM;

  const steps = [...STEPS_COMUM];

  if (perfil === 'ADMIN' || perfil === 'RECEPCAO') {
    steps.push(STEPS_DASHBOARD);
  }

  steps.push(STEPS_AGENDAMENTOS, STEPS_PACIENTES);

  if (perfil === 'ADMIN' || perfil === 'DENTISTA') {
    steps.push(STEPS_ATENDIMENTOS);
  }

  if (perfil === 'ADMIN') {
    steps.push(...STEPS_ADMIN);
  } else if (perfil === 'DENTISTA') {
    steps.push(STEPS_DENTISTA_FIM);
  } else {
    steps.push(STEPS_RECEPCAO_FIM);
  }

  return steps;
}
