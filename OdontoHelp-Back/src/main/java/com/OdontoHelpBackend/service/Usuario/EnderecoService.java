package com.OdontoHelpBackend.service.Usuario;

import com.OdontoHelpBackend.Mapper.EnderecoMapper;
import com.OdontoHelpBackend.domain.usuario.Endereco;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Usuario.Request.Endereco.EnderecoRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Endereco.EnderecoUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Endereco.EnderecoResponseDTO;
import com.OdontoHelpBackend.infra.exception.BusinessException;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Usuario.EnderecoRepository;
import com.OdontoHelpBackend.repository.Usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EnderecoMapper enderecoMapper;

    public List<EnderecoResponseDTO> listarPorUsuario(Long usuarioId) {
        return enderecoRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(enderecoMapper::toResponse)
                .toList();
    }

    public EnderecoResponseDTO criar(Long usuarioId, EnderecoRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        Endereco endereco = enderecoMapper.toEntity(dto);
        endereco.setUsuario(usuario);

        boolean temPrincipal = enderecoRepository.existsByUsuarioIdAndIsPrincipal(usuarioId, true);
        if (!temPrincipal)
            endereco.setIsPrincipal(true);

        return enderecoMapper.toResponse(enderecoRepository.save(endereco));
    }

    public EnderecoResponseDTO atualizar(Long usuarioId, Long enderecoId, EnderecoUpdateDTO dto) {
        Endereco endereco = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new NotFoundException("Endereço não encontrado"));
        enderecoMapper.updateEntity(dto, endereco);
        return enderecoMapper.toResponse(enderecoRepository.save(endereco));
    }

    public EnderecoResponseDTO definirPrincipal(Long usuarioId, Long enderecoId) {
        List<Endereco> enderecos = enderecoRepository.findByUsuarioId(usuarioId);
        enderecos.forEach(e -> e.setIsPrincipal(false));
        enderecoRepository.saveAll(enderecos);

        Endereco principal = enderecos.stream()
                .filter(e -> e.getId().equals(enderecoId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Endereço não encontrado"));

        principal.setIsPrincipal(true);
        return enderecoMapper.toResponse(enderecoRepository.save(principal));
    }

    public void deletar(Long usuarioId, Long enderecoId) {
        List<Endereco> enderecos = enderecoRepository.findByUsuarioId(usuarioId);

        if (enderecos.size() == 1)
            throw new BusinessException("Usuário deve ter pelo menos um endereço");

        Endereco endereco = enderecos.stream()
                .filter(e -> e.getId().equals(enderecoId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Endereço não encontrado"));

        if (endereco.getIsPrincipal()) {
            enderecos.stream()
                    .filter(e -> !e.getId().equals(enderecoId))
                    .findFirst()
                    .ifPresent(e -> {
                        e.setIsPrincipal(true);
                        enderecoRepository.save(e);
                    });
        }

        enderecoRepository.delete(endereco);
    }
}