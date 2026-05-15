package com.OdontoHelpBackend.Mapper;

import com.OdontoHelpBackend.domain.Clinico.Atendimento;
import com.OdontoHelpBackend.domain.Clinico.Enums.FaceDente;
import com.OdontoHelpBackend.domain.Clinico.Enums.SituacaoDente;
import com.OdontoHelpBackend.domain.Clinico.Enums.StatusAtendimento;
import com.OdontoHelpBackend.domain.Clinico.ItemAtendimento;
import com.OdontoHelpBackend.domain.Clinico.Procedimento;
import com.OdontoHelpBackend.domain.Consulta.Agendamento;
import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.dto.Clinica.Request.AtendimentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.AtendimentoUpdateDTO;
import com.OdontoHelpBackend.dto.Clinica.Request.ItemAtendimentoRequestDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.AtendimentoResponseDTO;
import com.OdontoHelpBackend.dto.Clinica.Response.ItemAtendimentoResponseDTO;
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
public class AtendimentoMapperImpl implements AtendimentoMapper {

    @Override
    public Atendimento toEntity(AtendimentoRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Atendimento atendimento = new Atendimento();

        atendimento.setHoraInicio( dto.horaInicio() );
        atendimento.setObservacoesGerais( dto.observacoesGerais() );

        return atendimento;
    }

    @Override
    public AtendimentoResponseDTO toResponse(Atendimento atendimento) {
        if ( atendimento == null ) {
            return null;
        }

        Long agendamentoId = null;
        Long dentistaId = null;
        String dentistaNome = null;
        Long pacienteId = null;
        String pacienteNome = null;
        Long id = null;
        LocalDateTime horaInicio = null;
        LocalDateTime horaFim = null;
        String observacoesGerais = null;
        StatusAtendimento status = null;
        List<ItemAtendimentoResponseDTO> itens = null;
        LocalDateTime criadoEm = null;
        LocalDateTime atualizadoEm = null;

        agendamentoId = atendimentoAgendamentoId( atendimento );
        dentistaId = atendimentoDentistaId( atendimento );
        dentistaNome = atendimentoDentistaNome( atendimento );
        pacienteId = atendimentoPacienteId( atendimento );
        pacienteNome = atendimentoPacienteNome( atendimento );
        id = atendimento.getId();
        horaInicio = atendimento.getHoraInicio();
        horaFim = atendimento.getHoraFim();
        observacoesGerais = atendimento.getObservacoesGerais();
        status = atendimento.getStatus();
        itens = itemAtendimentoListToItemAtendimentoResponseDTOList( atendimento.getItens() );
        criadoEm = atendimento.getCriadoEm();
        atualizadoEm = atendimento.getAtualizadoEm();

        AtendimentoResponseDTO atendimentoResponseDTO = new AtendimentoResponseDTO( id, agendamentoId, dentistaId, dentistaNome, pacienteId, pacienteNome, horaInicio, horaFim, observacoesGerais, status, itens, criadoEm, atualizadoEm );

        return atendimentoResponseDTO;
    }

    @Override
    public ItemAtendimento itemToEntity(ItemAtendimentoRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        ItemAtendimento itemAtendimento = new ItemAtendimento();

        itemAtendimento.setNumeroDente( dto.numeroDente() );
        itemAtendimento.setFace( dto.face() );
        itemAtendimento.setSituacaoIdentificada( dto.situacaoIdentificada() );
        itemAtendimento.setObservacao( dto.observacao() );

        return itemAtendimento;
    }

    @Override
    public ItemAtendimentoResponseDTO itemToResponse(ItemAtendimento item) {
        if ( item == null ) {
            return null;
        }

        Long procedimentoId = null;
        String procedimentoNome = null;
        Long id = null;
        Integer numeroDente = null;
        FaceDente face = null;
        SituacaoDente situacaoIdentificada = null;
        String observacao = null;

        procedimentoId = itemProcedimentoId( item );
        procedimentoNome = itemProcedimentoNome( item );
        id = item.getId();
        numeroDente = item.getNumeroDente();
        face = item.getFace();
        situacaoIdentificada = item.getSituacaoIdentificada();
        observacao = item.getObservacao();

        ItemAtendimentoResponseDTO itemAtendimentoResponseDTO = new ItemAtendimentoResponseDTO( id, procedimentoId, procedimentoNome, numeroDente, face, situacaoIdentificada, observacao );

        return itemAtendimentoResponseDTO;
    }

    @Override
    public void updateEntity(AtendimentoUpdateDTO dto, Atendimento atendimento) {
        if ( dto == null ) {
            return;
        }

        atendimento.setHoraInicio( dto.horaInicio() );
        atendimento.setHoraFim( dto.horaFim() );
        atendimento.setObservacoesGerais( dto.observacoesGerais() );
    }

    private Long atendimentoAgendamentoId(Atendimento atendimento) {
        if ( atendimento == null ) {
            return null;
        }
        Agendamento agendamento = atendimento.getAgendamento();
        if ( agendamento == null ) {
            return null;
        }
        Long id = agendamento.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private Long atendimentoDentistaId(Atendimento atendimento) {
        if ( atendimento == null ) {
            return null;
        }
        Dentista dentista = atendimento.getDentista();
        if ( dentista == null ) {
            return null;
        }
        Long id = dentista.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String atendimentoDentistaNome(Atendimento atendimento) {
        if ( atendimento == null ) {
            return null;
        }
        Dentista dentista = atendimento.getDentista();
        if ( dentista == null ) {
            return null;
        }
        String nome = dentista.getNome();
        if ( nome == null ) {
            return null;
        }
        return nome;
    }

    private Long atendimentoPacienteId(Atendimento atendimento) {
        if ( atendimento == null ) {
            return null;
        }
        Paciente paciente = atendimento.getPaciente();
        if ( paciente == null ) {
            return null;
        }
        Long id = paciente.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String atendimentoPacienteNome(Atendimento atendimento) {
        if ( atendimento == null ) {
            return null;
        }
        Paciente paciente = atendimento.getPaciente();
        if ( paciente == null ) {
            return null;
        }
        String nome = paciente.getNome();
        if ( nome == null ) {
            return null;
        }
        return nome;
    }

    protected List<ItemAtendimentoResponseDTO> itemAtendimentoListToItemAtendimentoResponseDTOList(List<ItemAtendimento> list) {
        if ( list == null ) {
            return null;
        }

        List<ItemAtendimentoResponseDTO> list1 = new ArrayList<ItemAtendimentoResponseDTO>( list.size() );
        for ( ItemAtendimento itemAtendimento : list ) {
            list1.add( itemToResponse( itemAtendimento ) );
        }

        return list1;
    }

    private Long itemProcedimentoId(ItemAtendimento itemAtendimento) {
        if ( itemAtendimento == null ) {
            return null;
        }
        Procedimento procedimento = itemAtendimento.getProcedimento();
        if ( procedimento == null ) {
            return null;
        }
        Long id = procedimento.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String itemProcedimentoNome(ItemAtendimento itemAtendimento) {
        if ( itemAtendimento == null ) {
            return null;
        }
        Procedimento procedimento = itemAtendimento.getProcedimento();
        if ( procedimento == null ) {
            return null;
        }
        String nome = procedimento.getNome();
        if ( nome == null ) {
            return null;
        }
        return nome;
    }
}
