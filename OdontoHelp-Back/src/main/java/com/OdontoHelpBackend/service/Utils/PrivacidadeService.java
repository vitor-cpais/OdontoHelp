package com.OdontoHelpBackend.service.Utils;

import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.dto.Usuario.Response.Dentista.DentistaResponseDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Paciente.PacienteResponseDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Usuario.UsuarioResponseDTO;
import com.OdontoHelpBackend.infra.util.DadoSensivelUtil;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class PrivacidadeService {

    public boolean deveOcultarDadosSensiveis() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Usuario usuario)) {
            return false;
        }
        return usuario.getPerfil() == PerfilUsuario.RECEPCAO;
    }

    public PacienteResponseDTO aplicar(PacienteResponseDTO dto) {
        if (!deveOcultarDadosSensiveis()) return dto;
        return new PacienteResponseDTO(
                dto.id(),
                dto.nome(),
                DadoSensivelUtil.ocultarTelefone(dto.telefone()),
                dto.email(),
                DadoSensivelUtil.ocultarCpf(dto.cpf()),
                dto.perfil(),
                dto.dataNascimento(),
                dto.genero(),
                dto.observacoesMedicas(),
                dto.isAtivo()
        );
    }

    public DentistaResponseDTO aplicar(DentistaResponseDTO dto) {
        if (!deveOcultarDadosSensiveis()) return dto;
        return new DentistaResponseDTO(
                dto.id(),
                dto.nome(),
                DadoSensivelUtil.ocultarTelefone(dto.telefone()),
                dto.email(),
                DadoSensivelUtil.ocultarCpf(dto.cpf()),
                dto.cro(),
                dto.perfil(),
                dto.dataNascimento(),
                dto.genero(),
                dto.isAtivo()
        );
    }

    public UsuarioResponseDTO aplicar(UsuarioResponseDTO dto) {
        if (!deveOcultarDadosSensiveis()) return dto;
        return new UsuarioResponseDTO(
                dto.id(),
                dto.nome(),
                DadoSensivelUtil.ocultarTelefone(dto.telefone()),
                dto.email(),
                DadoSensivelUtil.ocultarCpf(dto.cpf()),
                dto.perfil(),
                dto.dataNascimento(),
                dto.genero(),
                dto.isAtivo()
        );
    }
}
