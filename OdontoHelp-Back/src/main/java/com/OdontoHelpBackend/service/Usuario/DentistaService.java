package com.OdontoHelpBackend.service.Usuario;

import com.OdontoHelpBackend.Mapper.DentistaMapper;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Usuario.Request.Dentista.DentistaRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Dentista.DentistaUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Dentista.DentistaResponseDTO;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Usuario.DentistaRepository;
import com.OdontoHelpBackend.service.Utils.PrivacidadeService;
import com.OdontoHelpBackend.service.Utils.ValidacoesService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DentistaService {

    private final DentistaRepository dentistaRepository;
    private final UsuarioService usuarioService;
    private final DentistaMapper dentistaMapper;
    private final ValidacoesService validacoesService;
    private final PasswordEncoder passwordEncoder;
    private final PrivacidadeService privacidadeService;

    public DentistaResponseDTO buscarPorId(Long id) {
        return privacidadeService.aplicar(dentistaMapper.toResponse(buscarEntidadePorId(id)));
    }

    public Slice<DentistaResponseDTO> listar(String nome, Boolean isAtivo, Pageable pageable) {
        if (nome != null && !nome.isBlank())
            return dentistaRepository.findByNomeContainingIgnoreCase(nome, pageable)
                    .map(d -> privacidadeService.aplicar(dentistaMapper.toResponse(d)));
        if (isAtivo != null)
            return dentistaRepository.findByIsAtivo(isAtivo, pageable)
                    .map(d -> privacidadeService.aplicar(dentistaMapper.toResponse(d)));
        return dentistaRepository.findAllBy(pageable)
                .map(d -> privacidadeService.aplicar(dentistaMapper.toResponse(d)));
    }

    @Transactional
    public DentistaResponseDTO criar(DentistaRequestDTO dto) {
        usuarioService.validarCpfDuplicado(dto.cpf());
        usuarioService.validarEmailDuplicado(dto.email());
        Dentista dentista = dentistaMapper.toEntity(dto);
        dentista.setSenha(passwordEncoder.encode(dto.senha()));
        dentista.setIsAtivo(true);
        if (dentista.getEndereco() != null) {
            dentista.getEndereco().setUsuario(dentista);
        }
        return privacidadeService.aplicar(dentistaMapper.toResponse(dentistaRepository.save(dentista)));
    }


    public Dentista buscarEntidadePorId(Long id) {
        return dentistaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Dentista não encontrado"));
    }

    public Dentista buscarEntidadePorUsuarioId(Long usuarioId) {
        return dentistaRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new NotFoundException("Dentista não encontrado para este usuário"));
    }

    @Transactional
    public DentistaResponseDTO toggleStatus(Long id, boolean isAtivo, Usuario usuarioLogado) {
        Dentista dentista = buscarEntidadePorId(id);
        if (!isAtivo) {
            validacoesService.validarNaoAutoInativar(id, usuarioLogado);
            validacoesService.validarUltimoAdminAtivo(dentista);
            validacoesService.validarInativacaoUsuario(id);
        }
        dentista.setIsAtivo(isAtivo);
        return privacidadeService.aplicar(dentistaMapper.toResponse(dentistaRepository.save(dentista)));
    }
}
