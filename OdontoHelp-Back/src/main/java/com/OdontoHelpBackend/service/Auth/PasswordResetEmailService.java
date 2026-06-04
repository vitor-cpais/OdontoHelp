package com.OdontoHelpBackend.service.Auth;

import com.OdontoHelpBackend.domain.usuario.Usuario;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PasswordResetEmailService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetEmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:no-reply@odontohelp.local}")
    private String from;

    public void enviar(Usuario usuario, String resetLink) {
        if (!mailEnabled) {
            log.info("Link de redefinicao de senha para {}: {}", usuario.getEmail(), resetLink);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(usuario.getEmail());
        message.setSubject("Redefinicao de senha - OdontoHelp");
        message.setText("""
                Ola, %s.

                Recebemos uma solicitacao para redefinir sua senha no OdontoHelp.
                Acesse o link abaixo para criar uma nova senha:

                %s

                O link expira em 30 minutos. Se voce nao solicitou, ignore este e-mail.
                """.formatted(usuario.getNome(), resetLink));

        mailSender.send(message);
    }
}
