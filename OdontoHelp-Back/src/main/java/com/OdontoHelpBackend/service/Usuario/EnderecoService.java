package com.OdontoHelpBackend.service.Usuario;

import com.OdontoHelpBackend.Mapper.EnderecoMapper;
import com.OdontoHelpBackend.domain.usuario.Endereco;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Usuario.Request.Endereco.EnderecoRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Endereco.EnderecoUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Endereco.EnderecoResponseDTO;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Usuario.EnderecoRepository;
import com.OdontoHelpBackend.repository.Usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EnderecoMapper enderecoMapper;

    @Transactional
    public EnderecoResponseDTO criar(Long usuarioId, EnderecoRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        Endereco endereco = enderecoRepository.findByUsuarioId(usuarioId)
                .stream().findFirst()
                .orElseGet(() -> enderecoMapper.toEntity(dto));

        if (endereco.getId() != null) {
            enderecoMapper.updateEntity(dto, endereco);
        }

        endereco.setUsuario(usuario);
        return enderecoMapper.toResponse(enderecoRepository.save(endereco));
    }

    @Transactional
    public EnderecoResponseDTO atualizar(Long usuarioId, Long enderecoId, EnderecoUpdateDTO dto) {
        Endereco endereco = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new NotFoundException("Endereço não encontrado"));

        enderecoMapper.updateEntity(dto, endereco);
        return enderecoMapper.toResponse(enderecoRepository.save(endereco));
    }

    @Transactional
    public void deletar(Long usuarioId, Long enderecoId) {
        Endereco endereco = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new NotFoundException("Endereço não encontrado"));

        enderecoRepository.delete(endereco);
    }

    public EnderecoResponseDTO buscarPorUsuario(Long usuarioId) {
        return enderecoRepository.findByUsuarioId(usuarioId)
                .stream().findFirst()
                .map(enderecoMapper::toResponse)
                .orElseThrow(() -> new NotFoundException("Endereço não encontrado"));
    }
}
