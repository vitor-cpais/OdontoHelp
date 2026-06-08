package com.OdontoHelpBackend.service.Clinico;

import com.OdontoHelpBackend.domain.Clinico.*;
import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.dto.Clinica.Request.AtualizarDenteRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.HistoricoOdontogramaResponseDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.OdontogramaResponseDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.OdontogramaVersaoResponseDTO;
import com.OdontoHelpBackend.infra.exception.BusinessException;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Clinico.AtendimentoRepository;
import com.OdontoHelpBackend.repository.Clinico.OdontogramaSnapshotRepository;
import com.OdontoHelpBackend.repository.Usuario.DentistaRepository;
import com.OdontoHelpBackend.repository.Usuario.PacienteRepository;
import com.OdontoHelpBackend.repository.Usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OdontogramaService {

    private final OdontogramaSnapshotRepository snapshotRepository;
    private final PacienteRepository pacienteRepository;
    private final AtendimentoRepository atendimentoRepository;
    private final DentistaRepository dentistaRepository;
    private final UsuarioRepository usuarioRepository;

    public List<OdontogramaResponseDTO> buscarPorPaciente(Long pacienteId) {
        garantirSnapshotInicialSeNecessario(pacienteId);
        return reconstruirEstado(pacienteId).values().stream()
                .filter(e -> e.situacao() != SituacaoDente.SAUDAVEL || e.observacao() != null)
                .map(e -> new OdontogramaResponseDTO(
                        e.snapshotDenteId(),
                        e.numeroDente(),
                        e.situacao(),
                        e.observacao(),
                        e.atualizadoEm()
                ))
                .sorted(Comparator.comparing(OdontogramaResponseDTO::numeroDente))
                .toList();
    }

    public Slice<OdontogramaVersaoResponseDTO> buscarVersoes(Long pacienteId, Pageable pageable) {
        garantirSnapshotInicialSeNecessario(pacienteId);

        List<OdontogramaSnapshot> snapshots = snapshotRepository.findByPacienteIdOrderByCriadoEmAsc(pacienteId);
        List<OdontogramaVersaoResponseDTO> versoes = new ArrayList<>();
        for (int i = 0; i < snapshots.size(); i++) {
            OdontogramaSnapshot snap = snapshots.get(i);
            boolean inicial = isSnapshotInicial(snap);
            versoes.add(new OdontogramaVersaoResponseDTO(
                    snap.getId(),
                    i + 1,
                    snap.getAtendimento() != null ? snap.getAtendimento().getId() : null,
                    snap.getEditadoPor().getNome(),
                    inicial ? 0 : snap.getDentes().size(),
                    inicial,
                    snap.getCriadoEm()
            ));
        }

        Collections.reverse(versoes);
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), versoes.size());
        List<OdontogramaVersaoResponseDTO> page = start >= versoes.size()
                ? List.of()
                : versoes.subList(start, end);
        return new org.springframework.data.domain.SliceImpl<>(page, pageable, end < versoes.size());
    }

    public List<OdontogramaResponseDTO> buscarVersao(Long pacienteId, Long snapshotId) {
        garantirSnapshotInicialSeNecessario(pacienteId);
        OdontogramaSnapshot snapshot = snapshotRepository.findById(snapshotId)
                .filter(s -> s.getPaciente().getId().equals(pacienteId))
                .orElseThrow(() -> new NotFoundException("Versão do odontograma não encontrada"));

        return reconstruirEstadoAteSnapshot(pacienteId, snapshot.getId()).values().stream()
                .filter(e -> e.situacao() != SituacaoDente.SAUDAVEL || e.observacao() != null)
                .map(e -> new OdontogramaResponseDTO(
                        e.snapshotDenteId(),
                        e.numeroDente(),
                        e.situacao(),
                        e.observacao(),
                        e.atualizadoEm()
                ))
                .sorted(Comparator.comparing(OdontogramaResponseDTO::numeroDente))
                .toList();
    }

    public Slice<HistoricoOdontogramaResponseDTO> buscarHistorico(Long pacienteId, Pageable pageable) {
        garantirSnapshotInicialSeNecessario(pacienteId);
        return flattenHistorico(pacienteId, null, pageable);
    }

    public Slice<HistoricoOdontogramaResponseDTO> buscarHistoricoPorDente(
            Long pacienteId, Integer numeroDente, Pageable pageable) {
        garantirSnapshotInicialSeNecessario(pacienteId);
        return flattenHistorico(pacienteId, numeroDente, pageable);
    }

    @Transactional
    public OdontogramaResponseDTO atualizarDiretamente(Long pacienteId, Integer numeroDente,
                                                        AtualizarDenteRequestDTO dto,
                                                        Dentista dentista, Usuario usuario) {
        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
        garantirSnapshotInicialSeNecessario(pacienteId);

        Map<Integer, EstadoDente> antes = reconstruirEstado(pacienteId);
        SituacaoDente anterior = situacaoDe(antes, numeroDente);

        registrarAlteracoes(paciente, null, usuario, List.of(
                new AlteracaoDente(numeroDente, dto.situacaoAtual(), dto.observacao(), anterior)
        ));

        EstadoDente depois = reconstruirEstado(pacienteId).get(numeroDente);
        return new OdontogramaResponseDTO(
                depois.snapshotDenteId(),
                depois.numeroDente(),
                depois.situacao(),
                depois.observacao(),
                depois.atualizadoEm()
        );
    }

    @Transactional
    public void registrarPorItemAtendimento(Paciente paciente, ItemAtendimento item,
                                            Atendimento atendimento, Usuario usuario) {
        registrarPorItensAtendimento(paciente, List.of(item), atendimento, usuario);
    }

    @Transactional
    public void registrarPorItensAtendimento(Paciente paciente, List<ItemAtendimento> itens,
                                             Atendimento atendimento, Usuario usuario) {
        if (itens.isEmpty()) return;

        garantirSnapshotInicialSeNecessario(paciente.getId());
        Map<Integer, EstadoDente> estado = reconstruirEstado(paciente.getId());

        List<AlteracaoDente> alteracoes = new ArrayList<>();
        for (ItemAtendimento item : itens) {
            SituacaoDente anterior = situacaoDe(estado, item.getNumeroDente());
            alteracoes.add(new AlteracaoDente(
                    item.getNumeroDente(),
                    item.getSituacaoNova(),
                    item.getObservacao(),
                    anterior
            ));
            if (!anterior.equals(item.getSituacaoNova())) {
                estado.put(item.getNumeroDente(), new EstadoDente(
                        item.getNumeroDente(),
                        item.getSituacaoNova(),
                        item.getObservacao(),
                        null,
                        null,
                        true
                ));
            }
        }

        registrarAlteracoes(paciente, atendimento, usuario, alteracoes);
    }

    @Transactional
    public void garantirSnapshotInicialSeNecessario(Long pacienteId) {
        if (snapshotRepository.existsByPacienteId(pacienteId)) return;

        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));

        Usuario editor = usuarioRepository.findByPerfil(PerfilUsuario.ADMIN, PageRequest.of(0, 1))
                .getContent()
                .stream()
                .findFirst()
                .orElseThrow(() -> new BusinessException("Nenhum usuário admin para criar odontograma inicial"));

        OdontogramaSnapshot snapshot = new OdontogramaSnapshot();
        snapshot.setPaciente(paciente);
        snapshot.setEditadoPor(editor);

        for (Integer numero : OdontogramaFdi.TODOS_DENTES_ADULTOS) {
            OdontogramaDente dente = new OdontogramaDente();
            dente.setNumeroDente(numero);
            dente.setSituacao(SituacaoDente.SAUDAVEL);
            dente.vincularSnapshot(snapshot);
            snapshot.getDentes().add(dente);
        }

        snapshotRepository.save(snapshot);
    }

    @Transactional
    public void garantirSnapshotInicialParaNovoPaciente(Paciente paciente, Usuario criadoPor) {
        if (snapshotRepository.existsByPacienteId(paciente.getId())) return;

        OdontogramaSnapshot snapshot = new OdontogramaSnapshot();
        snapshot.setPaciente(paciente);
        snapshot.setEditadoPor(criadoPor);

        for (Integer numero : OdontogramaFdi.TODOS_DENTES_ADULTOS) {
            OdontogramaDente dente = new OdontogramaDente();
            dente.setNumeroDente(numero);
            dente.setSituacao(SituacaoDente.SAUDAVEL);
            dente.vincularSnapshot(snapshot);
            snapshot.getDentes().add(dente);
        }

        snapshotRepository.save(snapshot);
    }

    public Dentista resolverDentistaResponsavel(Long pacienteId) {
        var atendimentos = atendimentoRepository.findByPacienteId(pacienteId, PageRequest.of(0, 1));
        if (atendimentos.hasContent()) {
            return atendimentos.getContent().get(0).getDentista();
        }
        return dentistaRepository.findByIsAtivo(true, PageRequest.of(0, 1))
                .getContent()
                .stream()
                .findFirst()
                .orElseThrow(() -> new BusinessException(
                        "Nenhum dentista ativo encontrado para registrar a alteração"));
    }

    private void registrarAlteracoes(Paciente paciente, Atendimento atendimento, Usuario usuario,
                                     List<AlteracaoDente> alteracoes) {
        List<AlteracaoDente> relevantes = alteracoes.stream()
                .filter(a -> a.novaSituacao() != a.situacaoAnterior())
                .toList();
        if (relevantes.isEmpty()) return;

        OdontogramaSnapshot snapshot;
        if (atendimento != null) {
            snapshot = snapshotRepository.findByAtendimentoId(atendimento.getId())
                    .orElseGet(() -> {
                        OdontogramaSnapshot novo = new OdontogramaSnapshot();
                        novo.setPaciente(paciente);
                        novo.setAtendimento(atendimento);
                        novo.setEditadoPor(usuario);
                        return novo;
                    });
        } else {
            snapshot = new OdontogramaSnapshot();
            snapshot.setPaciente(paciente);
            snapshot.setEditadoPor(usuario);
        }

        for (AlteracaoDente alt : relevantes) {
            Optional<OdontogramaDente> existente = snapshot.getDentes().stream()
                    .filter(d -> d.getNumeroDente().equals(alt.numeroDente()))
                    .findFirst();

            if (existente.isPresent()) {
                OdontogramaDente dente = existente.get();
                dente.setSituacao(alt.novaSituacao());
                dente.setObservacao(alt.observacao());
            } else {
                OdontogramaDente dente = new OdontogramaDente();
                dente.setNumeroDente(alt.numeroDente());
                dente.setSituacao(alt.novaSituacao());
                dente.setObservacao(alt.observacao());
                dente.vincularSnapshot(snapshot);
                snapshot.getDentes().add(dente);
            }
        }

        snapshotRepository.save(snapshot);
    }

    private Map<Integer, EstadoDente> reconstruirEstado(Long pacienteId) {
        return reconstruirEstadoAteSnapshot(pacienteId, null);
    }

    private Map<Integer, EstadoDente> reconstruirEstadoAteSnapshot(Long pacienteId, Long snapshotLimiteId) {
        Map<Integer, EstadoDente> mapa = new LinkedHashMap<>();
        for (Integer n : OdontogramaFdi.TODOS_DENTES_ADULTOS) {
            mapa.put(n, new EstadoDente(n, SituacaoDente.SAUDAVEL, null, null, null, false));
        }

        for (OdontogramaSnapshot snap : snapshotRepository.findByPacienteIdOrderByCriadoEmAsc(pacienteId)) {
            for (OdontogramaDente d : snap.getDentes()) {
                boolean alterado = !SituacaoDente.SAUDAVEL.equals(d.getSituacao())
                        || snap.getDentes().size() == 1 && snap.getDentes().get(0).equals(d)
                        || snap.getDentes().size() > 1;
                mapa.put(d.getNumeroDente(), new EstadoDente(
                        d.getNumeroDente(),
                        d.getSituacao(),
                        d.getObservacao(),
                        snap.getCriadoEm(),
                        d.getId(),
                        true
                ));
            }
            if (snapshotLimiteId != null && snap.getId().equals(snapshotLimiteId)) {
                break;
            }
        }
        return mapa;
    }

    private static boolean isSnapshotInicial(OdontogramaSnapshot snap) {
        return snap.getAtendimento() == null
                && snap.getDentes().size() == OdontogramaFdi.TODOS_DENTES_ADULTOS.size()
                && snap.getDentes().stream().allMatch(d -> d.getSituacao() == SituacaoDente.SAUDAVEL);
    }

    private Slice<HistoricoOdontogramaResponseDTO> flattenHistorico(
            Long pacienteId, Integer filtroDente, Pageable pageable) {

        List<HistoricoOdontogramaResponseDTO> linhas = new ArrayList<>();
        Map<Integer, EstadoDente> estado = new LinkedHashMap<>();
        for (Integer n : OdontogramaFdi.TODOS_DENTES_ADULTOS) {
            estado.put(n, new EstadoDente(n, SituacaoDente.SAUDAVEL, null, null, null, false));
        }

        for (OdontogramaSnapshot snap : snapshotRepository.findByPacienteIdOrderByCriadoEmAsc(pacienteId)) {
            if (snap.getDentes().size() == OdontogramaFdi.TODOS_DENTES_ADULTOS.size()
                    && snap.getAtendimento() == null
                    && snap.getDentes().stream().allMatch(d -> d.getSituacao() == SituacaoDente.SAUDAVEL)) {
                for (OdontogramaDente d : snap.getDentes()) {
                    estado.put(d.getNumeroDente(), new EstadoDente(
                            d.getNumeroDente(), d.getSituacao(), null, snap.getCriadoEm(), d.getId(), false));
                }
                continue;
            }

            for (OdontogramaDente d : snap.getDentes()) {
                SituacaoDente anterior = situacaoDe(estado, d.getNumeroDente());
                if (filtroDente != null && !filtroDente.equals(d.getNumeroDente())) {
                    estado.put(d.getNumeroDente(), new EstadoDente(
                            d.getNumeroDente(), d.getSituacao(), d.getObservacao(),
                            snap.getCriadoEm(), d.getId(), true));
                    continue;
                }

                Long dentistaId = null;
                String dentistaNome = snap.getEditadoPor().getNome();
                Long atendimentoId = null;
                if (snap.getAtendimento() != null) {
                    dentistaId = snap.getAtendimento().getDentista().getId();
                    dentistaNome = snap.getAtendimento().getDentista().getNome();
                    atendimentoId = snap.getAtendimento().getId();
                }

                linhas.add(new HistoricoOdontogramaResponseDTO(
                        d.getId(),
                        d.getNumeroDente(),
                        anterior,
                        d.getSituacao(),
                        dentistaId,
                        dentistaNome,
                        atendimentoId,
                        d.getObservacao(),
                        snap.getCriadoEm()
                ));

                estado.put(d.getNumeroDente(), new EstadoDente(
                        d.getNumeroDente(), d.getSituacao(), d.getObservacao(),
                        snap.getCriadoEm(), d.getId(), true));
            }
        }

        Collections.reverse(linhas);
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), linhas.size());
        List<HistoricoOdontogramaResponseDTO> page = start >= linhas.size()
                ? List.of()
                : linhas.subList(start, end);
        return new org.springframework.data.domain.SliceImpl<>(page, pageable, end < linhas.size());
    }

    private static SituacaoDente situacaoDe(Map<Integer, EstadoDente> mapa, Integer numero) {
        EstadoDente e = mapa.get(numero);
        return e != null ? e.situacao() : SituacaoDente.SAUDAVEL;
    }

    private record AlteracaoDente(Integer numeroDente, SituacaoDente novaSituacao, String observacao,
                                SituacaoDente situacaoAnterior) {}

    private record EstadoDente(Integer numeroDente, SituacaoDente situacao, String observacao,
                               LocalDateTime atualizadoEm, Long snapshotDenteId, boolean alterado) {}
}
