package com.OdontoHelpBackend.Mapper;

import com.OdontoHelpBackend.domain.Clinico.Atendimento;
import com.OdontoHelpBackend.domain.Clinico.Enums.StatusItemPlano;
import com.OdontoHelpBackend.domain.Clinico.ItemPlanoDeTratamento;
import com.OdontoHelpBackend.domain.Clinico.PlanoDeTratamento;
import com.OdontoHelpBackend.domain.Clinico.Procedimento;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.dto.Clinica.Request.ItemPlanoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.PlanoDeTratamentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.ItemPlanoResponseDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.PlanoDeTratamentoResponseDTO;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T17:23:17-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Amazon.com Inc.)"
)
@Component
public class PlanoDeTratamentoMapperImpl implements PlanoDeTratamentoMapper {

    @Override
    public PlanoDeTratamento toEntity(PlanoDeTratamentoRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        PlanoDeTratamento planoDeTratamento = new PlanoDeTratamento();

        planoDeTratamento.setObservacoes( dto.observacoes() );

        return planoDeTratamento;
    }

    @Override
    public PlanoDeTratamentoResponseDTO toResponse(PlanoDeTratamento plano) {
        if ( plano == null ) {
            return null;
        }

        Long pacienteId = null;
        String pacienteNome = null;
        Long dentistaId = null;
        String dentistaNome = null;
        Long atendimentoId = null;
        Long id = null;
        String observacoes = null;
        List<ItemPlanoResponseDTO> itens = null;
        LocalDateTime criadoEm = null;
        LocalDateTime atualizadoEm = null;

        pacienteId = planoPacienteId( plano );
        pacienteNome = planoPacienteNome( plano );
        dentistaId = planoDentistaId( plano );
        dentistaNome = planoDentistaNome( plano );
        atendimentoId = planoAtendimentoId( plano );
        id = plano.getId();
        observacoes = plano.getObservacoes();
        itens = itemPlanoDeTratamentoListToItemPlanoResponseDTOList( plano.getItens() );
        criadoEm = plano.getCriadoEm();
        atualizadoEm = plano.getAtualizadoEm();

        PlanoDeTratamentoResponseDTO planoDeTratamentoResponseDTO = new PlanoDeTratamentoResponseDTO( id, pacienteId, pacienteNome, dentistaId, dentistaNome, atendimentoId, observacoes, itens, criadoEm, atualizadoEm );

        return planoDeTratamentoResponseDTO;
    }

    @Override
    public ItemPlanoDeTratamento itemToEntity(ItemPlanoRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        ItemPlanoDeTratamento itemPlanoDeTratamento = new ItemPlanoDeTratamento();

        itemPlanoDeTratamento.setNumeroDente( dto.numeroDente() );
        itemPlanoDeTratamento.setPrioridade( dto.prioridade() );
        itemPlanoDeTratamento.setObservacao( dto.observacao() );

        return itemPlanoDeTratamento;
    }

    @Override
    public ItemPlanoResponseDTO itemToResponse(ItemPlanoDeTratamento item) {
        if ( item == null ) {
            return null;
        }

        Long procedimentoId = null;
        String procedimentoNome = null;
        Long atendimentoRealizacaoId = null;
        Long id = null;
        Integer numeroDente = null;
        Integer prioridade = null;
        StatusItemPlano status = null;
        String observacao = null;

        procedimentoId = itemProcedimentoId( item );
        procedimentoNome = itemProcedimentoNome( item );
        atendimentoRealizacaoId = itemAtendimentoRealizacaoId( item );
        id = item.getId();
        numeroDente = item.getNumeroDente();
        prioridade = item.getPrioridade();
        status = item.getStatus();
        observacao = item.getObservacao();

        ItemPlanoResponseDTO itemPlanoResponseDTO = new ItemPlanoResponseDTO( id, procedimentoId, procedimentoNome, numeroDente, prioridade, status, observacao, atendimentoRealizacaoId );

        return itemPlanoResponseDTO;
    }

    private Long planoPacienteId(PlanoDeTratamento planoDeTratamento) {
        if ( planoDeTratamento == null ) {
            return null;
        }
        Paciente paciente = planoDeTratamento.getPaciente();
        if ( paciente == null ) {
            return null;
        }
        Long id = paciente.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String planoPacienteNome(PlanoDeTratamento planoDeTratamento) {
        if ( planoDeTratamento == null ) {
            return null;
        }
        Paciente paciente = planoDeTratamento.getPaciente();
        if ( paciente == null ) {
            return null;
        }
        String nome = paciente.getNome();
        if ( nome == null ) {
            return null;
        }
        return nome;
    }

    private Long planoDentistaId(PlanoDeTratamento planoDeTratamento) {
        if ( planoDeTratamento == null ) {
            return null;
        }
        Dentista dentista = planoDeTratamento.getDentista();
        if ( dentista == null ) {
            return null;
        }
        Long id = dentista.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String planoDentistaNome(PlanoDeTratamento planoDeTratamento) {
        if ( planoDeTratamento == null ) {
            return null;
        }
        Dentista dentista = planoDeTratamento.getDentista();
        if ( dentista == null ) {
            return null;
        }
        String nome = dentista.getNome();
        if ( nome == null ) {
            return null;
        }
        return nome;
    }

    private Long planoAtendimentoId(PlanoDeTratamento planoDeTratamento) {
        if ( planoDeTratamento == null ) {
            return null;
        }
        Atendimento atendimento = planoDeTratamento.getAtendimento();
        if ( atendimento == null ) {
            return null;
        }
        Long id = atendimento.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    protected List<ItemPlanoResponseDTO> itemPlanoDeTratamentoListToItemPlanoResponseDTOList(List<ItemPlanoDeTratamento> list) {
        if ( list == null ) {
            return null;
        }

        List<ItemPlanoResponseDTO> list1 = new ArrayList<ItemPlanoResponseDTO>( list.size() );
        for ( ItemPlanoDeTratamento itemPlanoDeTratamento : list ) {
            list1.add( itemToResponse( itemPlanoDeTratamento ) );
        }

        return list1;
    }

    private Long itemProcedimentoId(ItemPlanoDeTratamento itemPlanoDeTratamento) {
        if ( itemPlanoDeTratamento == null ) {
            return null;
        }
        Procedimento procedimento = itemPlanoDeTratamento.getProcedimento();
        if ( procedimento == null ) {
            return null;
        }
        Long id = procedimento.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String itemProcedimentoNome(ItemPlanoDeTratamento itemPlanoDeTratamento) {
        if ( itemPlanoDeTratamento == null ) {
            return null;
        }
        Procedimento procedimento = itemPlanoDeTratamento.getProcedimento();
        if ( procedimento == null ) {
            return null;
        }
        String nome = procedimento.getNome();
        if ( nome == null ) {
            return null;
        }
        return nome;
    }

    private Long itemAtendimentoRealizacaoId(ItemPlanoDeTratamento itemPlanoDeTratamento) {
        if ( itemPlanoDeTratamento == null ) {
            return null;
        }
        Atendimento atendimentoRealizacao = itemPlanoDeTratamento.getAtendimentoRealizacao();
        if ( atendimentoRealizacao == null ) {
            return null;
        }
        Long id = atendimentoRealizacao.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
