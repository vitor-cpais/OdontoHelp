// ─── AtendimentoMapper.java ───────────────────────────────────────────────────
package com.OdontoHelpBackend.Mapper;

import com.OdontoHelpBackend.domain.Clinico.Atendimento;
import com.OdontoHelpBackend.domain.Clinico.ItemAtendimento;
import com.OdontoHelpBackend.dto.Clinica.Request.AtendimentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.AtendimentoUpdateDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.ItemAtendimentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.AtendimentoResponseDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.ItemAtendimentoResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AtendimentoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "agendamento", ignore = true)
    @Mapping(target = "dentista", ignore = true)
    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "itens", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    @Mapping(target = "horaFim", ignore = true) // horaFim não existe no RequestDTO — só no UpdateDTO
    Atendimento toEntity(AtendimentoRequestDTO dto);

    @Mapping(target = "agendamentoStatus", source = "agendamento.status")
    @Mapping(target = "agendamentoId", source = "agendamento.id")
    @Mapping(target = "dentistaId", source = "dentista.id")
    @Mapping(target = "dentistaNome", source = "dentista.nome")
    @Mapping(target = "pacienteId", source = "paciente.id")
    @Mapping(target = "pacienteNome", source = "paciente.nome")
    AtendimentoResponseDTO toResponse(Atendimento atendimento);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "procedimento", ignore = true)
    @Mapping(target = "atendimento", ignore = true)
    ItemAtendimento itemToEntity(ItemAtendimentoRequestDTO dto);

    @Mapping(target = "procedimentoId", source = "procedimento.id")
    @Mapping(target = "procedimentoNome", source = "procedimento.nome")
    ItemAtendimentoResponseDTO itemToResponse(ItemAtendimento item);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "agendamento", ignore = true)
    @Mapping(target = "dentista", ignore = true)
    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "itens", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    void updateEntity(AtendimentoUpdateDTO dto, @MappingTarget Atendimento atendimento);
}

