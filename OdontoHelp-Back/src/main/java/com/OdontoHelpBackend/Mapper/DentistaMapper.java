package com.OdontoHelpBackend.Mapper;

import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.dto.Usuario.Request.Dentista.DentistaRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Dentista.DentistaUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Dentista.DentistaResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DentistaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isAtivo", ignore = true)
    @Mapping(target = "senha", ignore = true)
    Dentista toEntity(DentistaRequestDTO dto);

    DentistaResponseDTO toResponse(Dentista dentista);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isAtivo", ignore = true)
    @Mapping(target = "cpf", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "senha", ignore = true)
    @Mapping(target = "perfil", ignore = true)
    void updateEntity(DentistaUpdateDTO dto,
                      @MappingTarget Dentista dentista);
}
