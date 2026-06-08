package com.OdontoHelpBackend.service.Usuario;

import com.OdontoHelpBackend.Mapper.PacienteMapper;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteAnamneseDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Paciente.PacienteDadosPessoaisDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Paciente.PacienteResponseDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Paciente.PacienteSnapshotFinanceiroDTO;
import com.OdontoHelpBackend.infra.exception.AcessoNegadoException;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.infra.util.EmailNormalizer;
import com.OdontoHelpBackend.repository.Usuario.PacienteRepository;
import com.OdontoHelpBackend.service.Clinico.OdontogramaService;
import com.OdontoHelpBackend.service.Utils.PrivacidadeService;
import com.OdontoHelpBackend.service.Utils.ValidacoesService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final UsuarioService usuarioService;
    private final PacienteMapper pacienteMapper;
    private final ValidacoesService validacoesService;
    private final OdontogramaService odontogramaService;
    private final PrivacidadeService privacidadeService;

    public PacienteResponseDTO buscarPorId(Long id) {
        Paciente paciente = buscarEntidadePorId(id);
        return privacidadeService.aplicar(pacienteMapper.toResponse(paciente));
    }

    public PacienteSnapshotFinanceiroDTO snapshotFinanceiro(Long id) {
        Paciente paciente = buscarEntidadePorId(id);
        return new PacienteSnapshotFinanceiroDTO(
                paciente.getId(),
                paciente.getNome(),
                paciente.getCpf(),
                paciente.getEmail(),
                paciente.getTelefone(),
                paciente.getIsAtivo()
        );
    }

    public Slice<PacienteResponseDTO> listar(String nome, Boolean isAtivo, Pageable pageable) {
        if (nome != null && !nome.isBlank())
            return pacienteRepository.findByNomeContainingIgnoreCase(nome, pageable)
                    .map(p -> privacidadeService.aplicar(pacienteMapper.toResponse(p)));
        if (isAtivo != null)
            return pacienteRepository.findByIsAtivo(isAtivo, pageable)
                    .map(p -> privacidadeService.aplicar(pacienteMapper.toResponse(p)));
        return pacienteRepository.findAllBy(pageable)
                .map(p -> privacidadeService.aplicar(pacienteMapper.toResponse(p)));
    }

    @Transactional
    public PacienteResponseDTO criar(PacienteRequestDTO dto) {
        usuarioService.validarCpfDuplicado(dto.cpf());
        String email = EmailNormalizer.normalize(dto.email());
        usuarioService.validarEmailDuplicado(email);
        Paciente paciente = pacienteMapper.toEntity(dto);
        paciente.setEmail(email);
        paciente.setIsAtivo(true);
        if (paciente.getEndereco() != null) {
            paciente.getEndereco().setUsuario(paciente);
        }

        Paciente salvo = pacienteRepository.save(paciente);
        odontogramaService.garantirSnapshotInicialSeNecessario(salvo.getId());
        return privacidadeService.aplicar(pacienteMapper.toResponse(salvo));
    }

    @Transactional
    public PacienteResponseDTO atualizar(Long id, PacienteUpdateDTO dto) {
        Paciente paciente = buscarEntidadePorId(id);
        usuarioService.validarEmailDuplicadoExcluindoId(EmailNormalizer.normalize(dto.email()), paciente.getId());
        pacienteMapper.updateEntity(dto, paciente);
        paciente.setEmail(EmailNormalizer.normalize(dto.email()));
        if (paciente.getEndereco() != null) {
            paciente.getEndereco().setUsuario(paciente);
        }
        return privacidadeService.aplicar(pacienteMapper.toResponse(pacienteRepository.save(paciente)));
    }

    public Paciente buscarEntidadePorId(Long id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Paciente não encontrado"));
    }

    @Transactional
    public PacienteResponseDTO atualizarAnamnese(Long id, PacienteAnamneseDTO dto) {
        Paciente paciente = buscarEntidadePorId(id);
        String texto = dto.anamnese();
        paciente.setObservacoesMedicas(texto == null || texto.isBlank() ? null : texto.trim());
        return privacidadeService.aplicar(pacienteMapper.toResponse(pacienteRepository.save(paciente)));
    }

    @Transactional
    public PacienteResponseDTO toggleStatus(Long id, boolean isAtivo) {
        if (!isAtivo) {
            validacoesService.validarInativacaoUsuario(id);
        }
        Paciente paciente = buscarEntidadePorId(id);
        paciente.setIsAtivo(isAtivo);

        return privacidadeService.aplicar(pacienteMapper.toResponse(pacienteRepository.save(paciente)));
    }

    @Transactional(readOnly = true)
    public PacienteDadosPessoaisDTO dadosPessoais(Long id, Usuario usuarioLogado) {
        validarAcessoTitular(id, usuarioLogado);
        Paciente paciente = buscarEntidadePorId(id);
        var endereco = paciente.getEndereco();
        return new PacienteDadosPessoaisDTO(
                paciente.getId(),
                paciente.getNome(),
                paciente.getCpf(),
                paciente.getEmail(),
                paciente.getTelefone(),
                paciente.getGenero(),
                paciente.getDataNascimento(),
                endereco != null ? endereco.getRua() : null,
                endereco != null ? endereco.getNumero() : null,
                endereco != null ? endereco.getComplemento() : null,
                endereco != null ? endereco.getBairro() : null,
                endereco != null ? endereco.getCidade() : null,
                endereco != null ? endereco.getUf() : null,
                endereco != null ? endereco.getCep() : null,
                paciente.getObservacoesMedicas()
        );
    }

    // LGPD Art. 18 VI — anonimização de dados desnecessários. O registro clínico é mantido por obrigação legal (CFO), mas desvinculado da identidade do titular.
    @Transactional
    public void anonimizar(Long id) {
        Paciente paciente = buscarEntidadePorId(id);
        paciente.setNome("PACIENTE_ANONIMIZADO_" + id);
        paciente.setCpf(null);
        paciente.setEmail(null);
        paciente.setTelefone("");
        if (paciente.getEndereco() != null) {
            paciente.setEndereco(null);
        }
        pacienteRepository.save(paciente);
    }

    private void validarAcessoTitular(Long pacienteId, Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() == PerfilUsuario.ADMIN) {
            return;
        }
        if (usuarioLogado.getId().equals(pacienteId)) {
            return;
        }
        throw new AcessoNegadoException("Acesso negado aos dados pessoais do paciente");
    }
}
