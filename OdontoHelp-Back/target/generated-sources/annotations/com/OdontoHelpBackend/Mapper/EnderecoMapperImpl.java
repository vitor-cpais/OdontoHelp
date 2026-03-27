package com.OdontoHelpBackend.Mapper;

import com.OdontoHelpBackend.domain.usuario.Endereco;
import com.OdontoHelpBackend.dto.Usuario.Request.Endereco.EnderecoRequestDTO;
import com.OdontoHelpBackend.dto.Usuario.Request.Endereco.EnderecoUpdateDTO;
import com.OdontoHelpBackend.dto.Usuario.Response.Endereco.EnderecoResponseDTO;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-27T04:23:10-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Amazon.com Inc.)"
)
@Component
public class EnderecoMapperImpl implements EnderecoMapper {

    @Override
    public Endereco toEntity(EnderecoRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Endereco endereco = new Endereco();

        endereco.setRua( dto.rua() );
        endereco.setNumero( dto.numero() );
        endereco.setComplemento( dto.complemento() );
        endereco.setBairro( dto.bairro() );
        endereco.setCidade( dto.cidade() );
        endereco.setUf( dto.uf() );
        endereco.setCep( dto.cep() );
        endereco.setIsPrincipal( dto.isPrincipal() );

        return endereco;
    }

    @Override
    public EnderecoResponseDTO toResponse(Endereco endereco) {
        if ( endereco == null ) {
            return null;
        }

        Long id = null;
        String rua = null;
        String numero = null;
        String complemento = null;
        String bairro = null;
        String cidade = null;
        String uf = null;
        String cep = null;
        Boolean isPrincipal = null;

        id = endereco.getId();
        rua = endereco.getRua();
        numero = endereco.getNumero();
        complemento = endereco.getComplemento();
        bairro = endereco.getBairro();
        cidade = endereco.getCidade();
        uf = endereco.getUf();
        cep = endereco.getCep();
        isPrincipal = endereco.getIsPrincipal();

        EnderecoResponseDTO enderecoResponseDTO = new EnderecoResponseDTO( id, rua, numero, complemento, bairro, cidade, uf, cep, isPrincipal );

        return enderecoResponseDTO;
    }

    @Override
    public void updateEntity(EnderecoUpdateDTO dto, Endereco endereco) {
        if ( dto == null ) {
            return;
        }

        endereco.setRua( dto.rua() );
        endereco.setNumero( dto.numero() );
        endereco.setComplemento( dto.complemento() );
        endereco.setBairro( dto.bairro() );
        endereco.setCidade( dto.cidade() );
        endereco.setUf( dto.uf() );
        endereco.setCep( dto.cep() );
    }
}
