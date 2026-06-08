package com.OdontoHelpBackend.controller.Notificacao;

import com.OdontoHelpBackend.dto.notificacao.LembreteCobrancaEmailRequest;
import com.OdontoHelpBackend.service.Notificacao.CobrancaLembreteEmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notificacoes/cobranca")
@RequiredArgsConstructor
public class NotificacaoCobrancaController {

    private final CobrancaLembreteEmailService lembreteEmailService;

    @PostMapping("/lembrete-email")
    public ResponseEntity<Void> lembreteEmail(@Valid @RequestBody LembreteCobrancaEmailRequest request) {
        lembreteEmailService.enviar(request);
        return ResponseEntity.noContent().build();
    }
}
