package br.com.odontohelp.fiscal.service;

import br.com.odontohelp.fiscal.domain.ModoEmissao;
import br.com.odontohelp.fiscal.domain.Nfse;
import br.com.odontohelp.fiscal.dto.ConsultaStatusResponse;
import br.com.odontohelp.fiscal.dto.EmitirNfseRequest;
import br.com.odontohelp.fiscal.dto.EmitirNfseResponse;
import br.com.odontohelp.fiscal.dto.EnderecoDto;
import br.com.odontohelp.fiscal.dto.StatusNfse;
import br.com.odontohelp.fiscal.dto.TomadorDto;
import br.com.odontohelp.fiscal.exception.NfseNaoEncontradaException;
import br.com.odontohelp.fiscal.exception.OperacaoInvalidaException;
import br.com.odontohelp.fiscal.factory.ProvedorFiscalFactory;
import br.com.odontohelp.fiscal.provider.ProvedorFiscal;
import br.com.odontohelp.fiscal.repository.NfseRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

@Service
@Slf4j
public class NfseService {

    private final NfseRepository nfseRepository;
    private final EmissaoAutomaticaAsyncService emissaoAutomaticaAsyncService;
    private final ModoEmissao modoEmissao;
    private final String provedorIdentificador;

    public NfseService(NfseRepository nfseRepository,
                       EmissaoAutomaticaAsyncService emissaoAutomaticaAsyncService,
                       @Value("${fiscal.emissao.modo:MANUAL}") String modoEmissaoConfig,
                       @Value("${fiscal.provedor.identificador:ELOTECH}") String provedorIdentificador) {
        this.nfseRepository = nfseRepository;
        this.emissaoAutomaticaAsyncService = emissaoAutomaticaAsyncService;
        this.modoEmissao = ModoEmissao.valueOf(modoEmissaoConfig.trim().toUpperCase());
        this.provedorIdentificador = provedorIdentificador;
    }

    @Transactional
    public EmitirNfseResponse emitir(EmitirNfseRequest request, String tenantId) {
        Nfse nfse = new Nfse();
        nfse.setTenantId(tenantId);
        nfse.setExternalChargeId(request.externalChargeId());
        nfse.setExternalCustomerId(request.externalCustomerId());
        nfse.setValor(request.valor());
        nfse.setDescricaoServico(request.descricaoServico());
        nfse.setStatus(StatusNfse.PENDENTE);
        nfse.setModoEmissao(modoEmissao);
        preencherTomador(nfse, request.tomador());

        nfse = nfseRepository.save(nfse);

        if (modoEmissao == ModoEmissao.AUTOMATICO) {
            if (!tomadorTemEndereco(request.tomador())) {
                log.warn("Tomador sem endereco completo para tenantId={} nfseId={}. Emissao automatica pode exigir endereco na prefeitura.",
                        nfse.getTenantId(), nfse.getId());
            }
            emissaoAutomaticaAsyncService.processarEmissao(nfse.getId(), nfse.getTenantId(), provedorIdentificador);
        }

        return toEmitirResponse(nfse);
    }

    @Transactional(readOnly = true)
    public ConsultaStatusResponse consultar(UUID id, String tenantId) {
        Nfse nfse = buscarPorIdETenant(id, tenantId, false);
        return toConsultaResponse(nfse);
    }

    @Transactional(readOnly = true)
    public Page<ConsultaStatusResponse> listar(String tenantId,
                                               StatusNfse status,
                                               String externalCustomerId,
                                               LocalDate criadoDe,
                                               LocalDate criadoAte,
                                               String numeroNfse,
                                               Pageable pageable) {
        Page<Nfse> pagina = nfseRepository.filtrar(
                tenantId,
                status,
                blankToNull(externalCustomerId),
                inicioDia(criadoDe),
                inicioDiaExclusive(criadoAte),
                blankToNull(numeroNfse),
                pageable
        );
        return pagina.map(this::toConsultaResponse);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static Instant inicioDia(LocalDate data) {
        if (data == null) {
            return null;
        }
        return data.atStartOfDay(ZoneId.of("America/Sao_Paulo")).toInstant();
    }

    private static Instant inicioDiaExclusive(LocalDate data) {
        if (data == null) {
            return null;
        }
        return data.plusDays(1).atStartOfDay(ZoneId.of("America/Sao_Paulo")).toInstant();
    }

    @Transactional
    public ConsultaStatusResponse registrarNumero(UUID id, String tenantId, String nfseNumero) {
        Nfse nfse = buscarPorIdETenant(id, tenantId, true);
        if (nfse.getStatus() != StatusNfse.PENDENTE) {
            throw new OperacaoInvalidaException("Somente notas PENDENTE podem receber numero manual");
        }
        nfse.setNfseNumero(nfseNumero.trim());
        nfse.setStatus(StatusNfse.EMITIDA);
        nfse.setMensagemErro(null);
        return toConsultaResponse(nfseRepository.save(nfse));
    }

    @Transactional
    public ConsultaStatusResponse cancelar(UUID id, String tenantId) {
        Nfse nfse = buscarPorIdETenant(id, tenantId, true);
        if (nfse.getStatus() != StatusNfse.PENDENTE) {
            throw new OperacaoInvalidaException("Somente notas PENDENTE podem ser canceladas");
        }
        nfse.setStatus(StatusNfse.CANCELADA);
        return toConsultaResponse(nfseRepository.save(nfse));
    }

    Nfse buscarPorIdETenant(UUID id, String tenantId, boolean operacaoEscrita) {
        return nfseRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> {
                    if (operacaoEscrita && nfseRepository.existsById(id)) {
                        throw new br.com.odontohelp.fiscal.exception.AcessoNegadoException(
                                "Acesso negado: nota pertence a outro tenant");
                    }
                    throw new NfseNaoEncontradaException(id, tenantId);
                });
    }

    Nfse buscarPorIdETenant(UUID id, String tenantId) {
        return buscarPorIdETenant(id, tenantId, false);
    }

    private void preencherTomador(Nfse nfse, TomadorDto tomador) {
        nfse.setTomadorNome(tomador.nome());
        nfse.setTomadorCpfCnpj(tomador.cpfCnpj());
        nfse.setTomadorEmail(tomador.email());
        EnderecoDto endereco = tomador.endereco();
        if (endereco != null) {
            nfse.setTomadorLogradouro(endereco.logradouro());
            nfse.setTomadorNumero(endereco.numero());
            nfse.setTomadorBairro(endereco.bairro());
            nfse.setTomadorMunicipio(endereco.municipio());
            nfse.setTomadorUf(endereco.uf());
            nfse.setTomadorCep(endereco.cep());
        }
    }

    private boolean tomadorTemEndereco(TomadorDto tomador) {
        EnderecoDto endereco = tomador.endereco();
        return endereco != null
                && endereco.logradouro() != null && !endereco.logradouro().isBlank()
                && endereco.municipio() != null && !endereco.municipio().isBlank()
                && endereco.uf() != null && !endereco.uf().isBlank();
    }

    private EmitirNfseResponse toEmitirResponse(Nfse nfse) {
        return new EmitirNfseResponse(
                nfse.getId().toString(),
                nfse.getTenantId(),
                nfse.getStatus().name(),
                mensagemOperacional(nfse),
                nfse.getNfseNumero(),
                nfse.getCriadoEm()
        );
    }

    private ConsultaStatusResponse toConsultaResponse(Nfse nfse) {
        return new ConsultaStatusResponse(
                nfse.getId().toString(),
                nfse.getTenantId(),
                nfse.getExternalChargeId(),
                nfse.getExternalCustomerId(),
                nfse.getStatus(),
                nfse.getNfseNumero(),
                mensagemOperacional(nfse),
                nfse.getCriadoEm(),
                nfse.getAtualizadoEm()
        );
    }

    private String mensagemOperacional(Nfse nfse) {
        if (nfse.getStatus() == StatusNfse.ERRO) {
            return nfse.getMensagemErro();
        }
        if (nfse.getStatus() == StatusNfse.PENDENTE && nfse.getModoEmissao() == ModoEmissao.MANUAL) {
            return "Aguardando emissao manual no portal OXY";
        }
        if (nfse.getStatus() == StatusNfse.PROCESSANDO) {
            return "Emissao automatica em processamento";
        }
        if (nfse.getStatus() == StatusNfse.EMITIDA) {
            return "Nota fiscal emitida";
        }
        if (nfse.getStatus() == StatusNfse.CANCELADA) {
            return "Nota fiscal cancelada";
        }
        return null;
    }
}
