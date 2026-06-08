package com.OdontoHelpFinanceiro.controller;

import com.OdontoHelpFinanceiro.domain.enums.OrigemCobranca;
import com.OdontoHelpFinanceiro.domain.enums.StatusFinanceiro;
import com.OdontoHelpFinanceiro.domain.enums.StatusPreNfse;
import com.OdontoHelpFinanceiro.dto.DtoRecords.*;
import com.OdontoHelpFinanceiro.dto.ResponseRecords.*;
import com.OdontoHelpFinanceiro.infra.security.AuthUser;
import com.OdontoHelpFinanceiro.service.FinanceiroService;
import com.OdontoHelpFinanceiro.service.FiscalEmissaoService;
import com.OdontoHelpFinanceiro.service.NfseFiscalService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/financeiro")
@RequiredArgsConstructor
public class FinanceiroController {

    private final FinanceiroService service;
    private final NfseFiscalService nfseFiscalService;
    private final FiscalEmissaoService fiscalEmissaoService;

    @PostMapping("/cobrancas")
    public ResponseEntity<CobrancaResponse> criarCobranca(
            @Valid @RequestBody CriarCobrancaRequest req,
            @AuthenticationPrincipal AuthUser user,
            HttpServletRequest http) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.criarCobranca(req, user, bearer(http)));
    }

    @PostMapping("/cobrancas/atendimento")
    public ResponseEntity<CobrancaResponse> gerarAtendimento(
            @Valid @RequestBody GerarCobrancaAtendimentoRequest req,
            @AuthenticationPrincipal AuthUser user,
            HttpServletRequest http) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.gerarCobrancaAtendimento(req, user, bearer(http)));
    }

    @GetMapping("/cobrancas")
    public Page<CobrancaResponse> listar(
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(required = false) StatusFinanceiro status,
            @RequestParam(required = false) OrigemCobranca origemTipo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataEmissaoDe,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataEmissaoAte,
            Pageable pageable) {
        return service.listarCobrancas(pacienteId, status, origemTipo, dataEmissaoDe, dataEmissaoAte, pageable);
    }

    @GetMapping("/cobrancas/{id}")
    public CobrancaResponse buscar(@PathVariable Long id) {
        return service.buscarCobranca(id);
    }

    @PatchMapping("/cobrancas/{id}/cancelar")
    public CobrancaResponse cancelar(@PathVariable Long id, @AuthenticationPrincipal AuthUser user) {
        return service.cancelarCobranca(id, user);
    }

    @GetMapping("/parcelas-receber")
    public Page<ParcelaResponse> listarParcelas(
            @RequestParam(required = false) StatusFinanceiro status,
            Pageable pageable) {
        return service.listarParcelas(status, pageable);
    }

    @PatchMapping("/parcelas-receber/{id}/vencimento")
    public ParcelaResponse alterarVencimento(@PathVariable Long id, @Valid @RequestBody AlterarVencimentoRequest req) {
        return service.alterarVencimento(id, req);
    }

    @PatchMapping("/parcelas-receber/{id}/ajustar-valores")
    public ParcelaResponse ajustar(@PathVariable Long id, @Valid @RequestBody AjustarParcelaRequest req,
                                   @AuthenticationPrincipal AuthUser user) {
        return service.ajustarParcela(id, req, user);
    }

    @PatchMapping("/parcelas-receber/{id}/perdoar")
    public ParcelaResponse perdoar(@PathVariable Long id,
                                   @RequestBody(required = false) PerdoarParcelaRequest req,
                                   @AuthenticationPrincipal AuthUser user) {
        return service.perdoarParcela(id, req != null ? req : new PerdoarParcelaRequest(null), user);
    }

    @PostMapping("/parcelas-receber/{id}/pagamentos")
    public ResponseEntity<PagamentoResponse> pagar(@PathVariable Long id, @Valid @RequestBody RegistrarPagamentoRequest req,
                                                    @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
                                                    @AuthenticationPrincipal AuthUser user,
                                                    HttpServletRequest http) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.registrarPagamento(id, req, user, idempotencyKey, bearer(http)));
    }

    @PostMapping("/parcelas-receber/{id}/lembrete-email")
    public ResponseEntity<Void> lembreteEmail(@PathVariable Long id,
                                              @AuthenticationPrincipal AuthUser user,
                                              HttpServletRequest http) {
        service.enviarLembreteEmail(id, user, bearer(http));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/pagamentos/{id}/estornar")
    public PagamentoResponse estornar(@PathVariable Long id, @AuthenticationPrincipal AuthUser user) {
        return service.estornarPagamento(id, user);
    }

    @PostMapping("/pagamentos/{id}/reprocessar-nfse")
    public ResponseEntity<Void> reprocessarNfse(@PathVariable Long id, HttpServletRequest http) {
        fiscalEmissaoService.reprocessarNfse(id, bearer(http));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/inadimplencia")
    public Page<ParcelaResponse> inadimplencia(
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate vencimentoDe,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate vencimentoAte,
            Pageable pageable) {
        return service.listarInadimplencia(pacienteId, vencimentoDe, vencimentoAte, pageable);
    }

    @GetMapping("/clientes/{pacienteId}/posicao")
    public PosicaoFinanceiraResponse posicao(@PathVariable Long pacienteId) {
        return service.posicaoPaciente(pacienteId);
    }

    @GetMapping("/dashboard/resumo")
    public DashboardResumoResponse dashboard() {
        return service.dashboardResumo();
    }

    @GetMapping("/cobrancas/{id}/recorrencia")
    public RecorrenciaResponse buscarRecorrencia(@PathVariable Long id) {
        return service.buscarRecorrenciaPorCobranca(id);
    }

    @PostMapping("/cobrancas/{id}/recorrencia")
    public ResponseEntity<RecorrenciaResponse> recorrencia(@PathVariable Long id, @Valid @RequestBody CriarRecorrenciaRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criarRecorrencia(id, req));
    }

    @PatchMapping("/recorrencias/{id}")
    public RecorrenciaResponse atualizarRecorrencia(@PathVariable Long id,
                                                    @Valid @RequestBody AtualizarRecorrenciaRequest req) {
        return service.atualizarRecorrencia(id, req);
    }

    @PatchMapping("/recorrencias/{id}/pausar")
    public RecorrenciaResponse pausar(@PathVariable Long id) {
        return service.pausarRecorrencia(id);
    }

    @PatchMapping("/recorrencias/{id}/reativar")
    public RecorrenciaResponse reativar(@PathVariable Long id) {
        return service.reativarRecorrencia(id);
    }

    @PatchMapping("/recorrencias/{id}/encerrar")
    public RecorrenciaResponse encerrar(@PathVariable Long id) {
        return service.encerrarRecorrencia(id);
    }

    @PostMapping("/recorrencias/gerar-parcelas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Integer> gerarParcelas() {
        return ResponseEntity.ok(service.gerarParcelasRecorrencia());
    }

    @PostMapping("/cobrancas/{id}/pre-nfse")
    public ResponseEntity<PreNfseResponse> preNfse(@PathVariable Long id, @Valid @RequestBody CriarPreNfseRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criarPreNfse(id, req));
    }

    @GetMapping("/pre-nfse")
    public Page<PreNfseResponse> listarPreNfse(@RequestParam(required = false) StatusPreNfse status, Pageable pageable) {
        return service.listarPreNfse(status, pageable);
    }

    @PatchMapping("/pre-nfse/{id}/validar")
    public PreNfseResponse validarPreNfse(@PathVariable Long id) {
        return service.validarPreNfse(id);
    }

    @PatchMapping("/pre-nfse/{id}/marcar-emitida-manualmente")
    public PreNfseResponse emitidaManual(@PathVariable Long id, @Valid @RequestBody MarcarPreNfseEmitidaRequest req) {
        return service.marcarEmitidaManualmente(id, req);
    }

    @GetMapping("/nfse/config")
    public NfseConfigResponse nfseConfig() {
        return nfseFiscalService.config();
    }

    @GetMapping("/nfse")
    public Page<NfseFiscalResponse> listarNfse(@RequestParam(required = false) String status,
                                               @RequestParam(required = false) Long pacienteId,
                                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate criadoDe,
                                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate criadoAte,
                                               @RequestParam(required = false) String numeroNfse,
                                               Pageable pageable,
                                               HttpServletRequest http) {
        return nfseFiscalService.listar(status, pacienteId, criadoDe, criadoAte, numeroNfse, pageable, bearer(http));
    }

    @PutMapping("/nfse/{id}/numero")
    public NfseFiscalResponse registrarNumeroNfse(@PathVariable String id,
                                                   @Valid @RequestBody MarcarPreNfseEmitidaRequest req,
                                                   HttpServletRequest http) {
        return nfseFiscalService.registrarNumero(id, req.numeroNfse(), bearer(http));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("ok");
    }

    private static String bearer(HttpServletRequest req) {
        String h = req.getHeader("Authorization");
        return h != null ? h : "";
    }
}
