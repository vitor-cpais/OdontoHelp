package com.OdontoHelpBackend.service.Usuario;

import com.OdontoHelpBackend.Mapper.UsuarioMapper;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Usuario.Request.Usuario.UsuarioUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Usuario.UsuarioResponseDTO;
import com.OdontoHelpBackend.infra.exception.ConflictException;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;

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

    public void desativar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        usuario.setIsAtivo(false);
        usuarioRepository.save(usuario);
    }

    protected void validarCpfDuplicado(String cpf) {
        if (usuarioRepository.existsByCpf(cpf))
            throw new ConflictException("CPF já cadastrado");
    }

    protected void validarEmailDuplicado(String email) {
        if (usuarioRepository.existsByEmail(email))
            throw new ConflictException("E-mail já cadastrado");
    }

    public UsuarioResponseDTO atualizar(Long id, UsuarioUpdateDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        usuarioMapper.updateEntity(dto, usuario);
        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }
}