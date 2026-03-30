package com.OdontoHelpBackend.Mapper;

import com.OdontoHelpBackend.domain.Consulta.Agendamento;
import com.OdontoHelpBackend.dto.Consulta.Request.Agendamento.AgendamentoRequestDTO;
import com.OdontoHelpBackend.dto.Consulta.Request.Agendamento.AgendamentoUpdateDTO;
import com.OdontoHelpBackend.dto.Consulta.Response.Agendamento.AgendamentoResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AgendamentoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "dentista", ignore = true)
    Agendamento toEntity(AgendamentoRequestDTO dto);

    @Mapping(target = "pacienteId", source = "paciente.id")
    @Mapping(target = "pacienteNome", source = "paciente.nome")
    @Mapping(target = "dentistaId", source = "dentista.id")
    @Mapping(target = "dentistaNome", source = "dentista.nome")
    AgendamentoResponseDTO toResponse(Agendamento agendamento);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "dentista", ignore = true)
    void updateEntity(AgendamentoUpdateDTO dto,
                      @MappingTarget Agendamento agendamento);
}