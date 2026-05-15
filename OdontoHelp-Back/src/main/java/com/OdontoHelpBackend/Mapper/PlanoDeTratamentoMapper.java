// ─── PlanoDeTratamentoMapper.java ────────────────────────────────────────────
package com.OdontoHelpBackend.Mapper;

import com.OdontoHelpBackend.domain.Clinico.ItemPlanoDeTratamento;
import com.OdontoHelpBackend.domain.Clinico.PlanoDeTratamento;
import com.OdontoHelpBackend.dto.Clinica.Request.ItemPlanoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.PlanoDeTratamentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.ItemPlanoResponseDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.PlanoDeTratamentoResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PlanoDeTratamentoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "dentista", ignore = true)
    @Mapping(target = "atendimento", ignore = true)
    @Mapping(target = "itens", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    PlanoDeTratamento toEntity(PlanoDeTratamentoRequestDTO dto);

    @Mapping(target = "pacienteId", source = "paciente.id")
    @Mapping(target = "pacienteNome", source = "paciente.nome")
    @Mapping(target = "dentistaId", source = "dentista.id")
    @Mapping(target = "dentistaNome", source = "dentista.nome")
    @Mapping(target = "atendimentoId", source = "atendimento.id")
    PlanoDeTratamentoResponseDTO toResponse(PlanoDeTratamento plano);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "plano", ignore = true)
    @Mapping(target = "procedimento", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "atendimentoRealizacao", ignore = true)
    ItemPlanoDeTratamento itemToEntity(ItemPlanoRequestDTO dto);

    @Mapping(target = "procedimentoId", source = "procedimento.id")
    @Mapping(target = "procedimentoNome", source = "procedimento.nome")
    @Mapping(target = "atendimentoRealizacaoId", source = "atendimentoRealizacao.id")
    ItemPlanoResponseDTO itemToResponse(ItemPlanoDeTratamento item);
}
