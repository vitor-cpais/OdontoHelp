package com.OdontoHelpBackend.config;

import com.OdontoHelpBackend.domain.Clinico.Atendimento;
import com.OdontoHelpBackend.domain.Clinico.ItemAtendimento;
import com.OdontoHelpBackend.domain.Clinico.ItemPlanoDeTratamento;
import com.OdontoHelpBackend.domain.Clinico.OdontogramaDente;
import com.OdontoHelpBackend.domain.Clinico.OdontogramaFdi;
import com.OdontoHelpBackend.domain.Clinico.OdontogramaSnapshot;
import com.OdontoHelpBackend.domain.Clinico.PlanoDeTratamento;
import com.OdontoHelpBackend.domain.Clinico.Procedimento;
import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;
import com.OdontoHelpBackend.domain.Clinico.Enums.StatusItemPlano;
import com.OdontoHelpBackend.domain.Consulta.enums.StatusConsulta;
import com.OdontoHelpBackend.domain.Consulta.Agendamento;
import com.OdontoHelpBackend.domain.usuario.*;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.repository.Clinico.AtendimentoRepository;
import com.OdontoHelpBackend.repository.Clinico.OdontogramaSnapshotRepository;
import com.OdontoHelpBackend.repository.Clinico.PlanoDeTratamentoRepository;
import com.OdontoHelpBackend.repository.Clinico.ProcedimentoRepository;
import com.OdontoHelpBackend.repository.Consulta.AgendamentoRepository;
import com.OdontoHelpBackend.repository.Usuario.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
@Profile("dev")
public class DataInitializer implements ApplicationRunner {

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    private final UsuarioRepository usuarioRepository;
    private final DentistaRepository dentistaRepository;
    private final PacienteRepository pacienteRepository;
    private final EnderecoRepository enderecoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final ProcedimentoRepository procedimentoRepository;
    private final AtendimentoRepository atendimentoRepository;
    private final OdontogramaSnapshotRepository snapshotRepository;
    private final PlanoDeTratamentoRepository planoRepository;
    private final PasswordEncoder passwordEncoder;

    private final Random random = new Random();

    public DataInitializer(UsuarioRepository usuarioRepository, DentistaRepository dentistaRepository,
                           PacienteRepository pacienteRepository, EnderecoRepository enderecoRepository,
                           AgendamentoRepository agendamentoRepository, ProcedimentoRepository procedimentoRepository,
                           AtendimentoRepository atendimentoRepository,
                           OdontogramaSnapshotRepository snapshotRepository,
                           PlanoDeTratamentoRepository planoRepository,
                           PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.dentistaRepository = dentistaRepository;
        this.pacienteRepository = pacienteRepository;
        this.enderecoRepository = enderecoRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.procedimentoRepository = procedimentoRepository;
        this.atendimentoRepository = atendimentoRepository;
        this.snapshotRepository = snapshotRepository;
        this.planoRepository = planoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // Se já existirem dados, para a execução imediatamente para proteger o banco
        if (usuarioRepository.count() > 0) {
            garantirAdminAtivo();
            System.out.println("✨ Base de dados já possui registros. Pulando carga de dados.");
            return;
        }

        criarAdmin();
        criarRecepcionista();
        List<Dentista> dentistas = criarDentistas();
        List<Paciente> pacientes = criarPacientes();
        Usuario admin = usuarioRepository.findByEmail(adminEmail).orElseThrow();
        pacientes.forEach(p -> criarSnapshotInicial(p, admin));

        List<Procedimento> procedimentos = criarProcedimentos();
        List<Agendamento> agendamentos = criarAgendamentos(dentistas, pacientes);
        criarAtendimentosEOdontograma(agendamentos, procedimentos, admin);
        criarPlanosDeTratamento(dentistas, pacientes, procedimentos);

        System.out.println("✅ Base de dados inicializada com sucesso!");
    }

    private void garantirAdminAtivo() {
        usuarioRepository.findByEmail(adminEmail)
                .filter(admin -> !Boolean.TRUE.equals(admin.getIsAtivo()))
                .ifPresent(admin -> {
                    admin.setIsAtivo(true);
                    usuarioRepository.save(admin);
                    System.out.println("Admin configurado reativado: " + adminEmail);
                });
    }

    private Usuario criarAdmin() {
        Usuario admin = new Usuario();
        admin.setNome("ADMINISTRADOR SISTEMA");
        admin.setEmail(adminEmail);
        admin.setSenha(passwordEncoder.encode(adminPassword));
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
        recep.setNome("RECEPCIONISTA PADRÃO");
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
                {"RICARDO OLIVEIRA",  "dentista1@odonto.com", "SP-10001", "M"},
                {"BEATRIZ COSTA",     "dentista2@odonto.com", "SP-10002", "F"},
                {"MARCOS SANTOS",     "dentista3@odonto.com", "SP-10003", "M"},
                {"HELENA MELO",       "dentista4@odonto.com", "SP-10004", "F"},
                {"TIAGO BARBOSA",     "dentista5@odonto.com", "SP-10005", "M"},
        };

        return java.util.Arrays.stream(dados).map(d -> {
            Dentista dentista = new Dentista();
            dentista.setNome(d[0]);
            dentista.setEmail(d[1]);
            dentista.setSenha(passwordEncoder.encode("dentista123"));
            dentista.setCpf(gerarCpfValido());
            dentista.setTelefone("119800" + String.format("%04d", random.nextInt(9999)));
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
                {"BRUNO SILVA",     "paciente1@email.com", "M", "Sem observações"},
                {"CAMILA PEREIRA",  "paciente2@email.com", "F", "Alérgica a penicilina"},
                {"DANIEL ALVES",    "paciente3@email.com", "M", "Hipertenso"},
                {"ELAINE RIBEIRO",  "paciente4@email.com", "F", "Sem observações"},
                {"FÁBIO MARTINS",   "paciente5@email.com", "M", "Diabético tipo 2"},
                {"GISELE CARVALHO", "paciente6@email.com", "F", "Sem observações"},
                {"HUGO LOPES",      "paciente7@email.com", "M", "Sem observações"},
                {"ISABELA FERREIRA","paciente8@email.com", "F", "Gestante"},
        };

        return java.util.Arrays.stream(dados).map(d -> {
            Paciente p = new Paciente();
            p.setNome(d[0]);
            p.setEmail(d[1]);
            p.setSenha(passwordEncoder.encode("paciente123"));
            p.setCpf(gerarCpfValido());
            p.setTelefone("119700" + String.format("%04d", random.nextInt(9999)));
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

    private List<Procedimento> criarProcedimentos() {
        if (procedimentoRepository.count() > 0) return procedimentoRepository.findAll();

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

        salvarAgendamento(pacientes.get(0), dentistas.get(0), base.plusDays(1),          30, StatusConsulta.AGENDADO,    null);
        salvarAgendamento(pacientes.get(1), dentistas.get(0), base.plusDays(1).plusHours(1), 45, StatusConsulta.CONFIRMADO,  null);
        salvarAgendamento(pacientes.get(2), dentistas.get(1), base.plusDays(2),          60, StatusConsulta.AGENDADO,    null);
        salvarAgendamento(pacientes.get(3), dentistas.get(1), base.plusDays(2).plusHours(1), 30, StatusConsulta.AGENDADO, null);

        Agendamento a5 = salvarAgendamento(pacientes.get(0), dentistas.get(0), base.minusDays(3), 45, StatusConsulta.ATENDIDO, null);
        Agendamento a6 = salvarAgendamento(pacientes.get(1), dentistas.get(1), base.minusDays(5), 60, StatusConsulta.ATENDIDO, null);
        Agendamento a7 = salvarAgendamento(pacientes.get(2), dentistas.get(0), base.minusDays(7), 30, StatusConsulta.ATENDIDO, null);

        salvarAgendamento(pacientes.get(4), dentistas.get(2), base.plusDays(3),  30, StatusConsulta.CANCELADO, "Paciente solicitou cancelamento");
        salvarAgendamento(pacientes.get(5), dentistas.get(2), base.minusDays(2), 30, StatusConsulta.FALTA,     "Paciente não compareceu");

        return List.of(a5, a6, a7);
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
                                               Usuario editor) {
        Procedimento limpeza     = procedimentos.get(1);
        Procedimento restauracao = procedimentos.get(2);
        Procedimento consulta    = procedimentos.get(0);
        Procedimento canal       = procedimentos.get(4);

        Agendamento ag1 = agendamentosAtendidos.get(0);
        Atendimento at1 = Atendimento.iniciar(ag1, ag1.getDentista(), "Cárie no dente 36. Limpeza e restauração realizadas.");

        ItemAtendimento item1a = new ItemAtendimento();
        item1a.definirProcedimentoCobravel(limpeza);
        item1a.setNumeroDente(36);
        item1a.setSituacaoNova(SituacaoDente.RESTAURADO);
        item1a.setObservacao("Cárie tratada com resina composta");

        ItemAtendimento item1b = new ItemAtendimento();
        item1b.definirProcedimentoCobravel(restauracao);
        item1b.setNumeroDente(46);
        item1b.setSituacaoNova(SituacaoDente.CARIADO);
        item1b.setObservacao("Cárie identificada — aguarda tratamento na próxima consulta");

        at1.adicionarItem(item1a);
        at1.adicionarItem(item1b);
        at1 = atendimentoRepository.save(at1);
        salvarSnapshotOdontograma(ag1.getPaciente(), editor, at1, item1a);
        salvarSnapshotOdontograma(ag1.getPaciente(), editor, at1, item1b);
        at1.finalizar();
        atendimentoRepository.save(at1);

        Agendamento ag2 = agendamentosAtendidos.get(1);
        Atendimento at2 = Atendimento.iniciar(ag2, ag2.getDentista(), "Consulta de rotina. Necessário retorno para limpeza.");

        ItemAtendimento item2 = new ItemAtendimento();
        item2.definirProcedimentoCobravel(consulta);
        item2.setNumeroDente(11);
        item2.setSituacaoNova(SituacaoDente.SAUDAVEL);
        item2.setObservacao("Dente em bom estado");

        at2.adicionarItem(item2);
        at2 = atendimentoRepository.save(at2);
        salvarSnapshotOdontograma(ag2.getPaciente(), editor, at2, item2);

        Agendamento ag3 = agendamentosAtendidos.get(2);
        Atendimento at3 = Atendimento.iniciar(ag3, ag3.getDentista(), "Avaliação em andamento.");

        ItemAtendimento item3 = new ItemAtendimento();
        item3.definirProcedimentoCobravel(canal);
        item3.setNumeroDente(47);
        item3.setSituacaoNova(SituacaoDente.TRATAMENTO_CANAL);
        item3.setObservacao("Iniciado tratamento de canal — sessão 1 de 3");

        at3.adicionarItem(item3);
        at3 = atendimentoRepository.save(at3);
        salvarSnapshotOdontograma(ag3.getPaciente(), editor, at3, item3);
    }

    private void criarSnapshotInicial(Paciente paciente, Usuario editor) {
        if (snapshotRepository.existsByPacienteId(paciente.getId())) return;
        OdontogramaSnapshot inicial = new OdontogramaSnapshot();
        inicial.setPaciente(paciente);
        inicial.setEditadoPor(editor);
        for (Integer numero : OdontogramaFdi.TODOS_DENTES_ADULTOS) {
            OdontogramaDente d = new OdontogramaDente();
            d.setNumeroDente(numero);
            d.setSituacao(SituacaoDente.SAUDAVEL);
            d.vincularSnapshot(inicial);
            inicial.getDentes().add(d);
        }
        snapshotRepository.save(inicial);
    }

    private void salvarSnapshotOdontograma(Paciente paciente, Usuario editor,
                                           Atendimento atendimento, ItemAtendimento item) {
        if (!snapshotRepository.existsByPacienteId(paciente.getId())) {
            OdontogramaSnapshot inicial = new OdontogramaSnapshot();
            inicial.setPaciente(paciente);
            inicial.setEditadoPor(editor);
            for (Integer numero : OdontogramaFdi.TODOS_DENTES_ADULTOS) {
                OdontogramaDente d = new OdontogramaDente();
                d.setNumeroDente(numero);
                d.setSituacao(SituacaoDente.SAUDAVEL);
                d.vincularSnapshot(inicial);
                inicial.getDentes().add(d);
            }
            snapshotRepository.save(inicial);
        }

        OdontogramaSnapshot snap = new OdontogramaSnapshot();
        snap.setPaciente(paciente);
        snap.setAtendimento(atendimento);
        snap.setEditadoPor(editor);

        OdontogramaDente dente = new OdontogramaDente();
        dente.setNumeroDente(item.getNumeroDente());
        dente.setSituacao(item.getSituacaoNova());
        dente.setObservacao(item.getObservacao());
        dente.vincularSnapshot(snap);
        snap.getDentes().add(dente);

        snapshotRepository.save(snap);
    }

    private void criarPlanosDeTratamento(List<Dentista> dentistas, List<Paciente> pacientes,
                                         List<Procedimento> procedimentos) {
        Procedimento canal       = procedimentos.get(4);
        Procedimento restauracao = procedimentos.get(2);
        Procedimento limpeza     = procedimentos.get(1);

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
        ip3.setStatus(StatusItemPlano.PENDENTE);
        ip3.setObservacao("Limpeza já agendada para próxima semana");

        plano1.getItens().addAll(List.of(ip1, ip2, ip3));
        planoRepository.save(plano1);

        PlanoDeTratamento plano2 = new PlanoDeTratamento();
        plano2.setPaciente(pacientes.get(1));
        plano2.setDentista(dentistas.get(1));
        plano2.setObservacoes("Clareamento e acompanhamento pós-limpeza");

        ItemPlanoDeTratamento ip4 = new ItemPlanoDeTratamento();
        ip4.setPlano(plano2);
        ip4.setProcedimento(procedimentos.get(5));
        ip4.setNumeroDente(11);
        ip4.setPrioridade(1);
        ip4.setStatus(StatusItemPlano.PENDENTE);
        ip4.setObservacao("Paciente solicitou clareamento");

        plano2.getItens().add(ip4);
        planoRepository.save(plano2);
    }

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