package com.OdontoHelpBackend.service.Notificacao;

import com.OdontoHelpBackend.dto.notificacao.LembreteCobrancaEmailRequest;
import com.OdontoHelpBackend.util.MaskUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class CobrancaLembreteEmailService {

    private static final Logger log = LoggerFactory.getLogger(CobrancaLembreteEmailService.class);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:no-reply@odontohelp.local}")
    private String from;

    @Value("${app.frontend-url:${APP_FRONTEND_URL:http://localhost:5173}}")
    private String frontendUrl;

    public void enviar(LembreteCobrancaEmailRequest req) {
        String assunto = "Lembrete de pagamento - OdontoHelp";
        String corpo = """
                Ola, %s.

                Identificamos um valor em aberto referente a: %s.
                Valor: R$ %s
                Vencimento: %s

                Entre em contato com a clinica para regularizar.

                OdontoHelp
                """.formatted(
                req.pacienteNome(),
                req.descricao() != null && !req.descricao().isBlank() ? req.descricao() : "servicos odontologicos",
                req.valor().toPlainString(),
                req.dataVencimento().format(FMT));

        if (!mailEnabled) {
            log.info("Lembrete cobranca (mail desabilitado) para {} parcela {}", MaskUtil.email(req.email()), req.parcelaId());
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(req.email());
        message.setSubject(assunto);
        message.setText(corpo);
        mailSender.send(message);
    }
}
