package br.com.odontohelp.fiscal.controller;

import br.com.odontohelp.fiscal.dto.ConsultaStatusResponse;
import br.com.odontohelp.fiscal.dto.EmitirNfseRequest;
import br.com.odontohelp.fiscal.dto.EmitirNfseResponse;
import br.com.odontohelp.fiscal.dto.RegistrarNumeroRequest;
import br.com.odontohelp.fiscal.dto.StatusNfse;
import br.com.odontohelp.fiscal.service.NfseService;
import br.com.odontohelp.fiscal.tenant.TenantContext;
import br.com.odontohelp.fiscal.tenant.TenantResolver;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/v1/notas")
public class NfseController {

    private final NfseService nfseService;

    public NfseController(NfseService nfseService) {
        this.nfseService = nfseService;
    }

    @PostMapping
    public ResponseEntity<EmitirNfseResponse> emitir(@Valid @RequestBody EmitirNfseRequest request,
                                                     HttpServletRequest httpRequest) {
        String tenant = TenantResolver.resolver(httpRequest, request.tenantId());
        EmitirNfseResponse response = nfseService.emitir(request, tenant);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultaStatusResponse> consultar(@PathVariable UUID id,
                                                            @RequestParam String tenantId,
                                                            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(nfseService.consultar(id, tenantCorrente(httpRequest, tenantId)));
    }

    @GetMapping
    public ResponseEntity<Page<ConsultaStatusResponse>> listar(@RequestParam String tenantId,
                                                               @RequestParam(required = false) StatusNfse status,
                                                               @RequestParam(required = false) String externalCustomerId,
                                                               @RequestParam(required = false) LocalDate criadoDe,
                                                               @RequestParam(required = false) LocalDate criadoAte,
                                                               @RequestParam(required = false) String numeroNfse,
                                                               @RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "20") int size,
                                                               HttpServletRequest httpRequest) {
        Page<ConsultaStatusResponse> resultado = nfseService.listar(
                tenantCorrente(httpRequest, tenantId),
                status,
                externalCustomerId,
                criadoDe,
                criadoAte,
                numeroNfse,
                PageRequest.of(page, size));
        return ResponseEntity.ok(resultado);
    }

    @PutMapping("/{id}/numero")
    public ResponseEntity<ConsultaStatusResponse> registrarNumero(@PathVariable UUID id,
                                                                  @RequestParam String tenantId,
                                                                  @Valid @RequestBody RegistrarNumeroRequest request,
                                                                  HttpServletRequest httpRequest) {
        ConsultaStatusResponse response = nfseService.registrarNumero(
                id, tenantCorrente(httpRequest, tenantId), request.nfseNumero());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ConsultaStatusResponse> cancelar(@PathVariable UUID id,
                                                           @RequestParam String tenantId,
                                                           HttpServletRequest httpRequest) {
        ConsultaStatusResponse response = nfseService.cancelar(id, tenantCorrente(httpRequest, tenantId));
        return ResponseEntity.ok(response);
    }

    private static String tenantCorrente(HttpServletRequest request, String tenantIdInformado) {
        String ctx = TenantContext.get();
        if (ctx != null && !ctx.isBlank()) {
            return ctx;
        }
        return TenantResolver.resolver(request, tenantIdInformado);
    }
}
