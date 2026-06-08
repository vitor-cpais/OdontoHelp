package com.OdontoHelpBackend.service.Usuario;

import com.OdontoHelpBackend.Mapper.UsuarioMapper;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.dto.Usuario.Request.Usuario.UsuarioUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Usuario.UsuarioResponseDTO;
import com.OdontoHelpBackend.infra.exception.AcessoNegadoException;
import com.OdontoHelpBackend.infra.util.EmailNormalizer;
import com.OdontoHelpBackend.infra.exception.BusinessException;
import com.OdontoHelpBackend.infra.exception.ConflictException;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.repository.Usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.OdontoHelpBackend.service.Utils.PrivacidadeService;
import com.OdontoHelpBackend.service.Utils.ValidacoesService;
import com.OdontoHelpBackend.dto.Usuario.Request.Usuario.UsuarioRequestDTO;

import java.time.LocalDate;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // Por padrão, tudo é apenas leitura (mais rápido)
public class UsuarioService {

    private final PasswordEncoder passwordEncoder;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final ValidacoesService validacoesService;
    private final PrivacidadeService privacidadeService;

    public UsuarioResponseDTO buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        return privacidadeService.aplicar(usuarioMapper.toResponse(usuario));
    }




    public Slice<UsuarioResponseDTO> listar(String nome, PerfilUsuario perfil, Boolean isAtivo, Pageable pageable) {
        String nomePattern = null;
        if (nome != null && !nome.isBlank()) {
            nomePattern = "%" + nome.trim().toLowerCase() + "%";
        }
        return usuarioRepository.filtrar(nomePattern, perfil, isAtivo, pageable)
                .map(u -> privacidadeService.aplicar(usuarioMapper.toResponse(u)));
    }




    @Transactional
    public UsuarioResponseDTO toggleStatus(Long id, boolean isAtivo, Usuario usuarioLogado) {
        Usuario usuario = buscarEntidadePorId(id);
        if (!isAtivo) {
            validacoesService.validarNaoAutoInativar(id, usuarioLogado);
            validacoesService.validarUltimoAdminAtivo(usuario);
            validacoesService.validarInativacaoUsuario(id);
        }
        usuario.setIsAtivo(isAtivo);
        return privacidadeService.aplicar(usuarioMapper.toResponse(usuarioRepository.save(usuario)));
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

        return privacidadeService.aplicar(usuarioMapper.toResponse(usuarioRepository.save(usuario)));
    }

    @Transactional
    public UsuarioResponseDTO alterarPerfil(Long id, PerfilUsuario novoPerfil, Usuario usuarioLogado) {
        if (usuarioLogado.getPerfil() != PerfilUsuario.ADMIN)
            throw new AcessoNegadoException("Apenas administradores podem alterar perfil de usuário");
        if (usuarioLogado.getId().equals(id))
            throw new BusinessException("Administrador não pode alterar o próprio perfil");
        if (novoPerfil == PerfilUsuario.DENTISTA || novoPerfil == PerfilUsuario.PACIENTE)
            throw new BusinessException("Perfis clínicos devem ser gerenciados pelos módulos específicos");

        Usuario usuario = buscarEntidadePorId(id);
        if (usuario.getPerfil() == PerfilUsuario.DENTISTA || usuario.getPerfil() == PerfilUsuario.PACIENTE)
            throw new BusinessException("Perfis clínicos devem ser gerenciados pelos módulos específicos");

        usuario.setPerfil(novoPerfil);
        return privacidadeService.aplicar(usuarioMapper.toResponse(usuarioRepository.save(usuario)));
    }

    @Transactional
    public UsuarioResponseDTO criar(UsuarioRequestDTO dto) {
        validarCpfDuplicado(dto.cpf());
        validarEmailDuplicado(dto.email());
        validarDataNascimento(dto.dataNascimento());

        Usuario usuario = new Usuario();
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setCpf(dto.cpf());
        usuario.setTelefone(dto.telefone());
        usuario.setSenha(passwordEncoder.encode(dto.senha()));
        usuario.setPerfil(dto.perfil());
        usuario.setDataNascimento(dto.dataNascimento());
        usuario.setGenero(dto.genero());
        usuario.setIsAtivo(true);

        return privacidadeService.aplicar(usuarioMapper.toResponse(usuarioRepository.save(usuario)));
    }

    private void validarDataNascimento(LocalDate dataNascimento) {
        if (dataNascimento == null) {
            throw new IllegalArgumentException("Data de nascimento é obrigatória.");
            // Ou use a sua exceção personalizada do projeto (ex: BusinessException)
        }

        // Regra 1: Impede anos absurdos como 1111, 0001, etc.
        if (dataNascimento.getYear() < 1900) {
            throw new IllegalArgumentException("Data de nascimento inválida. O ano deve ser maior ou igual a 1900.");
        }

        // Regra 2: Impede datas no futuro (garantia caso o front falhe)
        if (dataNascimento.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Data de nascimento não pode ser uma data futura.");
        }
    }

    protected void validarCpfDuplicado(String cpf) {
        String cpfLimpo = (cpf != null) ? cpf.replaceAll("\\D", "") : null;
        if (usuarioRepository.existsByCpf(cpfLimpo))
            throw new ConflictException("CPF já cadastrado");
    }

    protected void validarEmailDuplicado(String email) {
        String normalizado = EmailNormalizer.normalize(email);
        if (normalizado == null) {
            return;
        }
        if (usuarioRepository.existsByEmail(normalizado)) {
            throw new ConflictException("E-mail já cadastrado");
        }
    }

    protected void validarEmailDuplicadoExcluindoId(String email, Long id) {
        String normalizado = EmailNormalizer.normalize(email);
        if (normalizado == null) {
            return;
        }
        if (usuarioRepository.existsByEmailAndIdNot(normalizado, id)) {
            throw new ConflictException("E-mail já cadastrado");
        }
    }
}
