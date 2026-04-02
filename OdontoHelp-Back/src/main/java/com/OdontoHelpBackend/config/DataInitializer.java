package com.OdontoHelpBackend.config;

import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Endereco;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.repository.Usuario.DentistaRepository;
import com.OdontoHelpBackend.repository.Usuario.EnderecoRepository;
import com.OdontoHelpBackend.repository.Usuario.PacienteRepository;
import com.OdontoHelpBackend.repository.Usuario.UsuarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;





import com.OdontoHelpBackend.domain.usuario.Dentista;
import com.OdontoHelpBackend.domain.usuario.Endereco;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.domain.usuario.enums.PerfilUsuario;
import com.OdontoHelpBackend.repository.Usuario.DentistaRepository;
import com.OdontoHelpBackend.repository.Usuario.EnderecoRepository;
import com.OdontoHelpBackend.repository.Usuario.PacienteRepository;
import com.OdontoHelpBackend.repository.Usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final DentistaRepository dentistaRepository;
    private final PacienteRepository pacienteRepository;
    private final EnderecoRepository enderecoRepository;
    private final Random random = new Random();

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (usuarioRepository.count() == 0) {
            criarAdmin();
            criarRecepcionista();
            criarDentistas(15);
            criarPacientes(31);
            System.out.println("✅ Base de dados inicializada com sucesso!");
        }
    }

    private void criarAdmin() {
        Usuario admin = new Usuario();
        admin.setNome("Administrador Sistema");
        admin.setEmail("admin@odonto.com");
        admin.setSenha("admin123");
        admin.setCpf(gerarCpfValido());
        admin.setTelefone("11999990000");
        admin.setPerfil(PerfilUsuario.ADMIN);
        admin.setGenero("M");
        admin.setDataNascimento(LocalDate.of(1980, 1, 15));
        admin.setIsAtivo(true);

        // Salva e cria o vínculo bidirecional
        vincularESalvarEndereco(usuarioRepository.save(admin));
    }

    private void criarRecepcionista() {
        Usuario recep = new Usuario();
        recep.setNome("Recepcionista Padrão");
        recep.setEmail("recepcao@odonto.com");
        recep.setSenha("recepcao123");
        recep.setCpf(gerarCpfValido());
        recep.setTelefone("11999990001");
        recep.setPerfil(PerfilUsuario.RECEPCAO);
        recep.setGenero("F");
        recep.setDataNascimento(LocalDate.of(1990, 5, 20));
        recep.setIsAtivo(true);

        vincularESalvarEndereco(usuarioRepository.save(recep));
    }

    private void criarDentistas(int quantidade) {
        String[] nomes = {"Ricardo", "Beatriz", "Marcos", "Helena", "Tiago", "Sérgio", "Larissa", "Roberto", "Cláudia", "André", "Fernanda", "Juliana", "Fábio", "Patrícia", "Gustavo"};
        String[] sobrenomes = {"Oliveira", "Costa", "Santos", "Melo", "Barbosa", "Teixeira", "Gomes", "Almeida", "Rodrigues"};

        for (int i = 0; i < quantidade; i++) {
            Dentista d = new Dentista();
            String nomeFull = "Dr(a). " + nomes[i % nomes.length] + " " + sobrenomes[random.nextInt(sobrenomes.length)];

            d.setNome(nomeFull);
            d.setEmail("dentista" + (i + 1) + "@odonto.com");
            d.setSenha("dentista123");
            d.setCpf(gerarCpfValido());
            d.setTelefone("1198000" + String.format("%04d", i));
            d.setPerfil(PerfilUsuario.DENTISTA);
            d.setGenero(i % 2 == 0 ? "F" : "M");
            d.setDataNascimento(LocalDate.of(1975 + (i % 20), 6, 15));
            d.setIsAtivo(true);
            d.setCro("SP-" + (10000 + i));

            vincularESalvarEndereco(dentistaRepository.save(d));
        }
    }

    private void criarPacientes(int quantidade) {
        String[] nomes = {"Bruno", "Camila", "Daniel", "Elaine", "Fábio", "Gisele", "Hugo", "Isabela", "Jorge", "Karina", "Lucas", "Mariana", "Nivaldo", "Otávio", "Priscila"};
        String[] sobrenomes = {"Silva", "Pereira", "Alves", "Ribeiro", "Martins", "Carvalho", "Lopes", "Ferreira", "Sou Souza"};

        for (int i = 0; i < quantidade; i++) {
            Paciente p = new Paciente();
            String nomeFull = nomes[i % nomes.length] + " " + sobrenomes[random.nextInt(sobrenomes.length)];

            p.setNome(nomeFull);
            p.setEmail("paciente" + (i + 1) + "@email.com");
            p.setSenha("paciente123");
            p.setCpf(gerarCpfValido());
            p.setTelefone("1197000" + String.format("%04d", i));
            p.setPerfil(PerfilUsuario.PACIENTE);
            p.setGenero(i % 2 == 0 ? "F" : "M");
            p.setDataNascimento(LocalDate.of(1985 + (i % 25), 3, 10));
            p.setIsAtivo(true);
            p.setObservacoesMedicas(i % 7 == 0 ? "Hipertenso e alérgico" : "Sem observações");

            vincularESalvarEndereco(pacienteRepository.save(p));
        }
    }

    private void vincularESalvarEndereco(Usuario usuario) {
        Endereco endereco = new Endereco();
        endereco.setUsuario(usuario); // FK
        endereco.setRua("Avenida Principal");
        endereco.setNumero(String.valueOf(100 + random.nextInt(900)));
        endereco.setBairro("Centro");
        endereco.setCidade("São Paulo");
        endereco.setUf("SP");
        endereco.setCep("01310100");
        // isPrincipal removido conforme regra 1:1

        enderecoRepository.save(endereco);
    }

    private String gerarCpfValido() {
        // ... (lógica de geração mantida igual)
        int[] n = new int[9];
        for (int i = 0; i < 9; i++) n[i] = random.nextInt(10);

        int d1 = 0;
        for (int i = 0; i < 9; i++) d1 += n[i] * (10 - i);
        d1 = 11 - (d1 % 11);
        if (d1 >= 10) d1 = 0;

        int d2 = d1 * 2;
        for (int i = 0; i < 9; i++) d2 += n[i] * (11 - i);
        d2 = 11 - (d2 % 11);
        if (d2 >= 10) d2 = 0;

        return String.format("%d%d%d%d%d%d%d%d%d%d%d", n[0], n[1], n[2], n[3], n[4], n[5], n[6], n[7], n[8], d1, d2);
    }
}



