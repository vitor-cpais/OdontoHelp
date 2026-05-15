package com.OdontoHelpBackend.Mapper;

import com.OdontoHelpBackend.domain.Clinico.Procedimento;
import com.OdontoHelpBackend.dto.Clinica.Request.ProcedimentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.ProcedimentoResponseDTO;
import java.math.BigDecimal;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T17:23:17-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Amazon.com Inc.)"
)
@Component
public class ProcedimentoMapperImpl implements ProcedimentoMapper {

    @Override
    public Procedimento toEntity(ProcedimentoRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Procedimento procedimento = new Procedimento();

        procedimento.setNome( dto.nome() );
        procedimento.setDescricao( dto.descricao() );
        procedimento.setValorBase( dto.valorBase() );
        procedimento.setDuracaoMinutos( dto.duracaoMinutos() );
        procedimento.setCorLegenda( dto.corLegenda() );

        return procedimento;
    }

    @Override
    public ProcedimentoResponseDTO toResponse(Procedimento procedimento) {
        if ( procedimento == null ) {
            return null;
        }

        Long id = null;
        String nome = null;
        String descricao = null;
        BigDecimal valorBase = null;
        Integer duracaoMinutos = null;
        String corLegenda = null;
        Boolean isAtivo = null;

        id = procedimento.getId();
        nome = procedimento.getNome();
        descricao = procedimento.getDescricao();
        valorBase = procedimento.getValorBase();
        duracaoMinutos = procedimento.getDuracaoMinutos();
        corLegenda = procedimento.getCorLegenda();
        isAtivo = procedimento.getIsAtivo();

        ProcedimentoResponseDTO procedimentoResponseDTO = new ProcedimentoResponseDTO( id, nome, descricao, valorBase, duracaoMinutos, corLegenda, isAtivo );

        return procedimentoResponseDTO;
    }

    @Override
    public void updateEntity(ProcedimentoRequestDTO dto, Procedimento procedimento) {
        if ( dto == null ) {
            return;
        }

        procedimento.setNome( dto.nome() );
        procedimento.setDescricao( dto.descricao() );
        procedimento.setValorBase( dto.valorBase() );
        procedimento.setDuracaoMinutos( dto.duracaoMinutos() );
        procedimento.setCorLegenda( dto.corLegenda() );
    }
}
