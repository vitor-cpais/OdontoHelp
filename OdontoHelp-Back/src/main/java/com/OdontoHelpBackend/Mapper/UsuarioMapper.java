package com.OdontoHelpBackend.Mapper;

import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Usuario.UsuarioRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Usuario.UsuarioUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Usuario.UsuarioResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isAtivo", ignore = true)
    @Mapping(target = "senha", ignore = true)
    Paciente toEntity(UsuarioRequestDTO dto);
    UsuarioResponseDTO toResponse(Usuario usuario);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isAtivo", ignore = true)
    @Mapping(target = "cpf", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "senha", ignore = true)
    @Mapping(target = "perfil", ignore = true)


    void updateEntity(UsuarioUpdateDTO dto, @MappingTarget Usuario usuario);










}