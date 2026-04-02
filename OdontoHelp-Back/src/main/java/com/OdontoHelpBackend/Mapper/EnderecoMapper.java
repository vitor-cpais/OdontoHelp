package com.OdontoHelpBackend.Mapper;

import com.OdontoHelpBackend.domain.usuario.Endereco;
import com.OdontoHelpBackend.dto.Usuario.Request.Endereco.EnderecoRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Endereco.EnderecoUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Endereco.EnderecoResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface EnderecoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    Endereco toEntity(EnderecoRequestDTO dto);

    EnderecoResponseDTO toResponse(Endereco endereco);


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    void updateEntity(EnderecoRequestDTO dto, @MappingTarget Endereco endereco);


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    void updateEntity(EnderecoUpdateDTO dto, @MappingTarget Endereco endereco);
}
