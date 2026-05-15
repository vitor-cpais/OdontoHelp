// ─── ProcedimentoMapper.java ──────────────────────────────────────────────────
package com.OdontoHelpBackend.Mapper;

import com.OdontoHelpBackend.domain.Clinico.Procedimento;
import com.OdontoHelpBackend.dto.Clinica.Request.ProcedimentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.ProcedimentoResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProcedimentoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isAtivo", ignore = true)
    Procedimento toEntity(ProcedimentoRequestDTO dto);

    ProcedimentoResponseDTO toResponse(Procedimento procedimento);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isAtivo", ignore = true)
    void updateEntity(ProcedimentoRequestDTO dto, @MappingTarget Procedimento procedimento);
}
