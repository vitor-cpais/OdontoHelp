package com.OdontoHelpBackend.Mapper;

import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Paciente.PacienteUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Paciente.PacienteResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PacienteMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isAtivo", ignore = true)
    @Mapping(target = "senha", ignore = true)
    Paciente toEntity(PacienteRequestDTO dto);

    PacienteResponseDTO toResponse(Paciente paciente);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isAtivo", ignore = true)
    @Mapping(target = "cpf", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "senha", ignore = true)
    @Mapping(target = "perfil", ignore = true)
    void updateEntity(PacienteUpdateDTO dto, @MappingTarget Paciente paciente);
}