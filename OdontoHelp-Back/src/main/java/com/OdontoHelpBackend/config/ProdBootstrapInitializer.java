package com.OdontoHelpBackend.config;

import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.repository.Usuario.UsuarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("prod")
@RequiredArgsConstructor
public class ProdBootstrapInitializer implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.name:ADMINISTRADOR MASTER}")
    private String adminName;

    @Value("${app.admin.phone}")
    private String adminPhone;

    @Value("${app.admin.cpf:}")
    private String adminCpf;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String email = adminEmail.trim().toLowerCase();

        usuarioRepository.findByEmail(email)
                .ifPresentOrElse(this::garantirAdminAtivo, () -> criarAdmin(email));
    }

    private void garantirAdminAtivo(Usuario admin) {
        boolean alterado = false;

        if (!Boolean.TRUE.equals(admin.getIsAtivo())) {
            admin.setIsAtivo(true);
            alterado = true;
        }

        if (admin.getPerfil() != PerfilUsuario.ADMIN) {
            admin.setPerfil(PerfilUsuario.ADMIN);
            alterado = true;
        }

        if (alterado) {
            usuarioRepository.save(admin);
            System.out.println("Admin master de producao reativado/ajustado: " + admin.getEmail());
        }
    }

    private void criarAdmin(String email) {
        Usuario admin = new Usuario();
        admin.setNome(adminName);
        admin.setEmail(email);
        admin.setSenha(passwordEncoder.encode(adminPassword));
        admin.setTelefone(adminPhone);
        admin.setCpf(adminCpf == null || adminCpf.isBlank() ? null : adminCpf);
        admin.setPerfil(PerfilUsuario.ADMIN);
        admin.setIsAtivo(true);

        usuarioRepository.save(admin);
        System.out.println("Admin master de producao criado: " + email);
    }
}
