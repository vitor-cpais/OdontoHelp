package com.OdontoHelpBackend.service.Usuario;

import com.OdontoHelpBackend.Mapper.UsuarioMapper;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Usuario.Request.Usuario.UsuarioUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Paciente.PacienteResponseDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Usuario.UsuarioResponseDTO;
import com.OdontoHelpBackend.infra.exception.ConflictException;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.OdontoHelpBackend.service.Utils.ValidacoesService;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // Por padrão, tudo é apenas leitura (mais rápido)
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final ValidacoesService validacoesService;
    public UsuarioResponseDTO buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        return usuarioMapper.toResponse(usuario);
    }

    public Slice<UsuarioResponseDTO> listar(String nome, Pageable pageable) {
        Slice<Usuario> usuarios;
        if (nome != null && !nome.isBlank())
            usuarios = usuarioRepository.findByNomeContainingIgnoreCase(nome, pageable);
        else
            usuarios = usuarioRepository.findAllBy(pageable);
        return usuarios.map(usuarioMapper::toResponse);
    }




    @Transactional
    public UsuarioResponseDTO toggleStatus(Long id, boolean isAtivo) {
        if (!isAtivo) {
            validacoesService.validarInativacaoUsuario(id);
        }
        Usuario usuario = buscarEntidadePorId(id);
        usuario.setIsAtivo(isAtivo);
        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    public Usuario buscarEntidadePorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario não encontrado"));
    }





    @Transactional
    public UsuarioResponseDTO atualizar(Long id, UsuarioUpdateDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        usuarioMapper.updateEntity(dto, usuario);

        if (usuario.getEndereco() != null) {
            usuario.getEndereco().setUsuario(usuario);
        }

        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    protected void validarCpfDuplicado(String cpf) {
        // Garante que o CPF chegue liso para a consulta no banco
        String cpfLimpo = (cpf != null) ? cpf.replaceAll("\\D", "") : null;
        if (usuarioRepository.existsByCpf(cpfLimpo))
            throw new ConflictException("CPF já cadastrado");
    }

    protected void validarEmailDuplicado(String email) {
        if (usuarioRepository.existsByEmail(email))
            throw new ConflictException("E-mail já cadastrado");
    }
}
