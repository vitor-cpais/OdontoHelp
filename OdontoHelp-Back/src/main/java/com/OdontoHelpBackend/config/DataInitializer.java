package com.OdontoHelpBackend.config;

import com.OdontoHelpBackend.domain.Clinico.*;
import com.OdontoHelpBackend.domain.Clinico.Enums.*;
import com.OdontoHelpBackend.domain.Consulta.Agendamento;
import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.OdontoHelpBackend.domain.usuario.*;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.repository.Clinico.*;
import com.OdontoHelpBackend.repository.Consulta.AgendamentoRepository;
import com.OdontoHelpBackend.repository.Usuario.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final DentistaRepository dentistaRepository;
    private final PacienteRepository pacienteRepository;
    private final EnderecoRepository enderecoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final ProcedimentoRepository procedimentoRepository;
    private final AtendimentoRepository atendimentoRepository;
    private final OdontogramaRepository odontogramaRepository;
    private final HistoricoOdontogramaRepository historicoOdontogramaRepository;
    private final PlanoDeTratamentoRepository planoRepository;
    private final PasswordEncoder passwordEncoder;

    private final Random random = new Random();

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (usuarioRepository.count() > 0) return;

        // ── MVP 1 — Usuários ───────────────────────────────────────────────────
        criarAdmin();
        criarRecepcionista();
        List<Dentista> dentistas = criarDentistas();
        List<Paciente> pacientes = criarPacientes();

        // ── MVP 2 — Clínico ────────────────────────────────────────────────────
        List<Procedimento> procedimentos = criarProcedimentos();
        List<Agendamento>  agendamentos  = criarAgendamentos(dentistas, pacientes);
        criarAtendimentosEOdontograma(agendamentos, procedimentos, dentistas, pacientes);
        criarPlanosDeTratamento(dentistas, pacientes, procedimentos);

        System.out.println("✅ Base de dados inicializada com sucesso!");
        System.out.println("─────────────────────────────────────────");
        System.out.println("👤 admin@odonto.com       | senha: admin123");
        System.out.println("👤 recepcao@odonto.com    | senha: recepcao123");
        System.out.println("👤 dentista1@odonto.com   | senha: dentista123");
        System.out.println("👤 dentista2@odonto.com   | senha: dentista123");
        System.out.println("─────────────────────────────────────────");
    }

    // ─── USUÁRIOS ─────────────────────────────────────────────────────────────

    private Usuario criarAdmin() {
        Usuario admin = new Usuario();
        admin.setNome("Administrador Sistema");
        admin.setEmail("admin@odonto.com");
        admin.setSenha(passwordEncoder.encode("admin123"));
        admin.setCpf(gerarCpfValido());
        admin.setTelefone("11999990000");
        admin.setPerfil(PerfilUsuario.ADMIN);
        admin.setGenero("M");
        admin.setDataNascimento(LocalDate.of(1980, 1, 15));
        admin.setIsAtivo(true);
        Usuario saved = usuarioRepository.save(admin);
        vincularEndereco(saved);
        return saved;
    }

    private Usuario criarRecepcionista() {
        Usuario recep = new Usuario();
        recep.setNome("Recepcionista Padrão");
        recep.setEmail("recepcao@odonto.com");
        recep.setSenha(passwordEncoder.encode("recepcao123"));
        recep.setCpf(gerarCpfValido());
        recep.setTelefone("11999990001");
        recep.setPerfil(PerfilUsuario.RECEPCAO);
        recep.setGenero("F");
        recep.setDataNascimento(LocalDate.of(1990, 5, 20));
        recep.setIsAtivo(true);
        Usuario saved = usuarioRepository.save(recep);
        vincularEndereco(saved);
        return saved;
    }

    private List<Dentista> criarDentistas() {
        String[][] dados = {
                {"Ricardo Oliveira",  "dentista1@odonto.com", "SP-10001", "M"},
                {"Beatriz Costa",     "dentista2@odonto.com", "SP-10002", "F"},
                {"Marcos Santos",     "dentista3@odonto.com", "SP-10003", "M"},
                {"Helena Melo",       "dentista4@odonto.com", "SP-10004", "F"},
                {"Tiago Barbosa",     "dentista5@odonto.com", "SP-10005", "M"},
        };

        return java.util.Arrays.stream(dados).map(d -> {
            Dentista dentista = new Dentista();
            dentista.setNome(d[0]);
            dentista.setEmail(d[1]);
            dentista.setSenha(passwordEncoder.encode("dentista123"));
            dentista.setCpf(gerarCpfValido());
            dentista.setTelefone("119800" + random.nextInt(9999));
            dentista.setPerfil(PerfilUsuario.DENTISTA);
            dentista.setGenero(d[3]);
            dentista.setDataNascimento(LocalDate.of(1975 + random.nextInt(20), 6, 15));
            dentista.setIsAtivo(true);
            dentista.setCro(d[2]);
            Dentista saved = dentistaRepository.save(dentista);
            vincularEndereco(saved);
            return saved;
        }).toList();
    }

    private List<Paciente> criarPacientes() {
        String[][] dados = {
                {"Bruno Silva",     "paciente1@email.com", "M", "Sem observações"},
                {"Camila Pereira",  "paciente2@email.com", "F", "Alérgica a penicilina"},
                {"Daniel Alves",    "paciente3@email.com", "M", "Hipertenso"},
                {"Elaine Ribeiro",  "paciente4@email.com", "F", "Sem observações"},
                {"Fábio Martins",   "paciente5@email.com", "M", "Diabético tipo 2"},
                {"Gisele Carvalho", "paciente6@email.com", "F", "Sem observações"},
                {"Hugo Lopes",      "paciente7@email.com", "M", "Sem observações"},
                {"Isabela Ferreira","paciente8@email.com", "F", "Gestante"},
        };

        return java.util.Arrays.stream(dados).map(d -> {
            Paciente p = new Paciente();
            p.setNome(d[0]);
            p.setEmail(d[1]);
            p.setSenha(passwordEncoder.encode("paciente123"));
            p.setCpf(gerarCpfValido());
            p.setTelefone("119700" + random.nextInt(9999));
            p.setPerfil(PerfilUsuario.PACIENTE);
            p.setGenero(d[2]);
            p.setDataNascimento(LocalDate.of(1985 + random.nextInt(25), 3, 10));
            p.setIsAtivo(true);
            p.setObservacoesMedicas(d[3]);
            Paciente saved = pacienteRepository.save(p);
            vincularEndereco(saved);
            return saved;
        }).toList();
    }

    // ─── MVP 2 ────────────────────────────────────────────────────────────────

    private List<Procedimento> criarProcedimentos() {
        record ProcData(String nome, String desc, double valor, int min, String cor) {}

        List<ProcData> lista = List.of(
                new ProcData("CONSULTA",            "Consulta e avaliação geral",           80.00,  30, "#4DB6AC"),
                new ProcData("LIMPEZA",             "Profilaxia dental",                   120.00,  45, "#81C784"),
                new ProcData("RESTAURACAO",         "Restauração com resina composta",     200.00,  60, "#FFB74D"),
                new ProcData("EXTRACAO",            "Extração simples",                    180.00,  45, "#E57373"),
                new ProcData("TRATAMENTO_CANAL",    "Endodontia / tratamento de canal",    800.00, 120, "#9575CD"),
                new ProcData("CLAREAMENTO",         "Clareamento dental a laser",          600.00,  90, "#4FC3F7"),
                new ProcData("IMPLANTE",            "Implante dentário",                  3000.00, 180, "#F06292"),
                new ProcData("APARELHO_ORTODONTICO","Instalação de aparelho ortodôntico", 2500.00, 120, "#A1887F")
        );

        return lista.stream().map(pd -> {
            Procedimento proc = new Procedimento();
            proc.setNome(pd.nome());
            proc.setDescricao(pd.desc());
            proc.setValorBase(BigDecimal.valueOf(pd.valor()));
            proc.setDuracaoMinutos(pd.min());
            proc.setCorLegenda(pd.cor());
            proc.setIsAtivo(true);
            return procedimentoRepository.save(proc);
        }).toList();
    }

    private List<Agendamento> criarAgendamentos(List<Dentista> dentistas, List<Paciente> pacientes) {
        LocalDateTime base = LocalDateTime.now().withHour(9).withMinute(0).withSecond(0).withNano(0);

        // Futuros — ainda não atendidos
        Agendamento a1 = salvarAgendamento(pacientes.get(0), dentistas.get(0), base.plusDays(1),          30, StatusConsulta.AGENDADO,    null);
        Agendamento a2 = salvarAgendamento(pacientes.get(1), dentistas.get(0), base.plusDays(1).plusHours(1), 45, StatusConsulta.CONFIRMADO,  null);
        Agendamento a3 = salvarAgendamento(pacientes.get(2), dentistas.get(1), base.plusDays(2),          60, StatusConsulta.AGENDADO,    null);
        Agendamento a4 = salvarAgendamento(pacientes.get(3), dentistas.get(1), base.plusDays(2).plusHours(1), 30, StatusConsulta.AGENDADO, null);

        // Passados — atendimento iniciado (status ATENDIDO — transição correta do modelo atual)
        Agendamento a5 = salvarAgendamento(pacientes.get(0), dentistas.get(0), base.minusDays(3), 45, StatusConsulta.ATENDIDO, null);
        Agendamento a6 = salvarAgendamento(pacientes.get(1), dentistas.get(1), base.minusDays(5), 60, StatusConsulta.ATENDIDO, null);
        Agendamento a7 = salvarAgendamento(pacientes.get(2), dentistas.get(0), base.minusDays(7), 30, StatusConsulta.ATENDIDO, null);

        // Cancelado e falta
        salvarAgendamento(pacientes.get(4), dentistas.get(2), base.plusDays(3),  30, StatusConsulta.CANCELADO, "Paciente solicitou cancelamento");
        salvarAgendamento(pacientes.get(5), dentistas.get(2), base.minusDays(2), 30, StatusConsulta.FALTA,     "Paciente não compareceu");

        return List.of(a5, a6, a7); // retorna só os ATENDIDO para gerar atendimentos
    }

    private Agendamento salvarAgendamento(Paciente paciente, Dentista dentista,
                                          LocalDateTime inicio, int duracaoMin,
                                          StatusConsulta status, String obs) {
        Agendamento a = new Agendamento();
        a.setPaciente(paciente);
        a.setDentista(dentista);
        a.setDataInicio(inicio);
        a.setDataFim(inicio.plusMinutes(duracaoMin));
        a.setStatus(status);
        a.setObservacoes(obs);
        return agendamentoRepository.save(a);
    }

    private void criarAtendimentosEOdontograma(List<Agendamento> agendamentosAtendidos,
                                                List<Procedimento> procedimentos,
                                                List<Dentista> dentistas,
                                                List<Paciente> pacientes) {
        Procedimento limpeza     = procedimentos.get(1); // LIMPEZA
        Procedimento restauracao = procedimentos.get(2); // RESTAURACAO
        Procedimento consulta    = procedimentos.get(0); // CONSULTA
        Procedimento canal       = procedimentos.get(4); // TRATAMENTO_CANAL

        // ── Atendimento 1 — FINALIZADO com limpeza (36) + restauração (46) ──
        Agendamento ag1 = agendamentosAtendidos.get(0);
        Atendimento at1 = Atendimento.iniciar(ag1, ag1.getDentista(), "Cárie no dente 36. Limpeza e restauração realizadas.");

        ItemAtendimento item1a = new ItemAtendimento();
        item1a.setProcedimento(limpeza);
        item1a.setNumeroDente(36);
        item1a.setSituacaoIdentificada(SituacaoDente.RESTAURADO);
        item1a.setObservacao("Cárie tratada com resina composta");

        ItemAtendimento item1b = new ItemAtendimento();
        item1b.setProcedimento(restauracao);
        item1b.setNumeroDente(46);
        item1b.setFace(FaceDente.OCLUSAL);
        item1b.setSituacaoIdentificada(SituacaoDente.CARIADO);
        item1b.setObservacao("Cárie identificada — aguarda tratamento na próxima consulta");

        at1.adicionarItem(item1a);
        at1.adicionarItem(item1b);
        at1.finalizar(); // EM_ANDAMENTO → FINALIZADO (único ciclo de vida válido)
        atendimentoRepository.save(at1);

        // Atualiza odontograma dos dois itens
        salvarOdontograma(ag1.getPaciente(), ag1.getDentista(), at1, item1a);
        salvarOdontograma(ag1.getPaciente(), ag1.getDentista(), at1, item1b);

        // ── Atendimento 2 — EM_ANDAMENTO (dentista ainda atendendo) ──
        Agendamento ag2 = agendamentosAtendidos.get(1);
        Atendimento at2 = Atendimento.iniciar(ag2, ag2.getDentista(), "Consulta de rotina. Necessário retorno para limpeza.");

        ItemAtendimento item2 = new ItemAtendimento();
        item2.setProcedimento(consulta);
        item2.setNumeroDente(11);
        item2.setSituacaoIdentificada(SituacaoDente.SAUDAVEL);
        item2.setObservacao("Dente em bom estado");

        at2.adicionarItem(item2);
        // Não chama finalizar() — permanece EM_ANDAMENTO
        atendimentoRepository.save(at2);

        // ── Atendimento 3 — EM_ANDAMENTO sem itens ainda ──
        Agendamento ag3 = agendamentosAtendidos.get(2);
        Atendimento at3 = Atendimento.iniciar(ag3, ag3.getDentista(), "Avaliação em andamento.");

        ItemAtendimento item3 = new ItemAtendimento();
        item3.setProcedimento(canal);
        item3.setNumeroDente(47);
        item3.setFace(FaceDente.DISTAL);
        item3.setSituacaoIdentificada(SituacaoDente.TRATAMENTO_CANAL);
        item3.setObservacao("Iniciado tratamento de canal — sessão 1 de 3");

        at3.adicionarItem(item3);
        atendimentoRepository.save(at3);
    }

    private void salvarOdontograma(Paciente paciente, Dentista dentista,
                                   Atendimento atendimento, ItemAtendimento item) {
        // Histórico imutável — um registro por evento
        HistoricoOdontograma historico = new HistoricoOdontograma();
        historico.setPaciente(paciente);
        historico.setNumeroDente(item.getNumeroDente());
        historico.setSituacaoAnterior(null); // primeiro registro deste dente
        historico.setSituacaoNova(item.getSituacaoIdentificada());
        historico.setDentista(dentista);
        historico.setAtendimento(atendimento);
        historico.setObservacao(item.getObservacao());
        historicoOdontogramaRepository.save(historico);

        // Estado atual do dente — upsert
        Odontograma odontograma = odontogramaRepository
                .findByPacienteIdAndNumeroDente(paciente.getId(), item.getNumeroDente())
                .orElseGet(() -> {
                    Odontograma o = new Odontograma();
                    o.setPaciente(paciente);
                    o.setNumeroDente(item.getNumeroDente());
                    return o;
                });
        odontograma.setSituacaoAtual(item.getSituacaoIdentificada());
        odontograma.setObservacao(item.getObservacao());
        odontogramaRepository.save(odontograma);
    }

    private void criarPlanosDeTratamento(List<Dentista> dentistas, List<Paciente> pacientes,
                                          List<Procedimento> procedimentos) {
        Procedimento canal       = procedimentos.get(4); // TRATAMENTO_CANAL
        Procedimento restauracao = procedimentos.get(2); // RESTAURACAO
        Procedimento limpeza     = procedimentos.get(1); // LIMPEZA

        // Plano 1 — paciente 0, dentista 0
        PlanoDeTratamento plano1 = new PlanoDeTratamento();
        plano1.setPaciente(pacientes.get(0));
        plano1.setDentista(dentistas.get(0));
        plano1.setObservacoes("Tratamento de canal no dente 46 e limpeza geral pendentes");

        ItemPlanoDeTratamento ip1 = new ItemPlanoDeTratamento();
        ip1.setPlano(plano1);
        ip1.setProcedimento(canal);
        ip1.setNumeroDente(46);
        ip1.setPrioridade(1);
        ip1.setStatus(StatusItemPlano.PENDENTE);
        ip1.setObservacao("Cárie profunda identificada na consulta anterior");

        ItemPlanoDeTratamento ip2 = new ItemPlanoDeTratamento();
        ip2.setPlano(plano1);
        ip2.setProcedimento(restauracao);
        ip2.setNumeroDente(16);
        ip2.setPrioridade(2);
        ip2.setStatus(StatusItemPlano.PENDENTE);
        ip2.setObservacao("Restauração preventiva recomendada");

        ItemPlanoDeTratamento ip3 = new ItemPlanoDeTratamento();
        ip3.setPlano(plano1);
        ip3.setProcedimento(limpeza);
        ip3.setNumeroDente(18);
        ip3.setPrioridade(3);
        ip3.setStatus(StatusItemPlano.AGENDADO);
        ip3.setObservacao("Limpeza já agendada para próxima semana");

        plano1.getItens().addAll(List.of(ip1, ip2, ip3));
        planoRepository.save(plano1);

        // Plano 2 — paciente 1, dentista 1
        PlanoDeTratamento plano2 = new PlanoDeTratamento();
        plano2.setPaciente(pacientes.get(1));
        plano2.setDentista(dentistas.get(1));
        plano2.setObservacoes("Clareamento e acompanhamento pós-limpeza");

        ItemPlanoDeTratamento ip4 = new ItemPlanoDeTratamento();
        ip4.setPlano(plano2);
        ip4.setProcedimento(procedimentos.get(5)); // CLAREAMENTO
        ip4.setNumeroDente(11);
        ip4.setPrioridade(1);
        ip4.setStatus(StatusItemPlano.PENDENTE);
        ip4.setObservacao("Paciente solicitou clareamento");

        plano2.getItens().add(ip4);
        planoRepository.save(plano2);
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    private void vincularEndereco(Usuario usuario) {
        Endereco endereco = new Endereco();
        endereco.setUsuario(usuario);
        endereco.setRua("Avenida Principal");
        endereco.setNumero(String.valueOf(100 + random.nextInt(900)));
        endereco.setComplemento("Apto " + (random.nextInt(20) + 1));
        endereco.setBairro("Centro");
        endereco.setCidade("São Paulo");
        endereco.setUf("SP");
        endereco.setCep("01310100");
        enderecoRepository.save(endereco);
    }

    private String gerarCpfValido() {
        int[] n = new int[9];
        for (int i = 0; i < 9; i++) n[i] = random.nextInt(10);

        int d1 = 0;
        for (int i = 0; i < 9; i++) d1 += n[i] * (10 - i);
        d1 = 11 - (d1 % 11);
        if (d1 >= 10) d1 = 0;

        int d2 = d1 * 2;
        for (int i = 0; i < 9; i++) d2 += n[i] * (11 - i);
        d2 = 11 - (d2 % 11);
        if (d2 >= 10) d2 = 0;

        return String.format("%d%d%d%d%d%d%d%d%d%d%d",
                n[0], n[1], n[2], n[3], n[4], n[5], n[6], n[7], n[8], d1, d2);
    }
}
