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
        admin.setTelefone("(11) 99999-0000");
        admin.setPerfil(PerfilUsuario.ADMIN);
        admin.setGenero("M");
        admin.setDataNascimento(LocalDate.of(1980, 1, 15));
        admin.setIsAtivo(true);
        criarEndereco(usuarioRepository.save(admin));
    }

    private void criarRecepcionista() {
        Usuario recep = new Usuario();
        recep.setNome("Recepcionista Padrão");
        recep.setEmail("recepcao@odonto.com");
        recep.setSenha("recepcao123");
        recep.setCpf(gerarCpfValido());
        recep.setTelefone("(11) 99999-0001");
        recep.setPerfil(PerfilUsuario.RECEPCAO);
        recep.setGenero("F");
        recep.setDataNascimento(LocalDate.of(1990, 5, 20));
        recep.setIsAtivo(true);
        criarEndereco(usuarioRepository.save(recep));
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
            d.setTelefone("(11) 98000-" + String.format("%04d", i));
            d.setPerfil(PerfilUsuario.DENTISTA);
            d.setGenero(i % 2 == 0 ? "F" : "M");
            d.setDataNascimento(LocalDate.of(1975 + (i % 20), 6, 15));
            d.setIsAtivo(true);
            d.setCro("SP-" + (10000 + i));

            criarEndereco(dentistaRepository.save(d));
        }
    }

    private void criarPacientes(int quantidade) {
        String[] nomes = {"Bruno", "Camila", "Daniel", "Elaine", "Fábio", "Gisele", "Hugo", "Isabela", "Jorge", "Karina", "Lucas", "Mariana", "Nivaldo", "Otávio", "Priscila"};
        String[] sobrenomes = {"Silva", "Pereira", "Alves", "Ribeiro", "Martins", "Carvalho", "Lopes", "Ferreira", "Souza"};

        for (int i = 0; i < quantidade; i++) {
            Paciente p = new Paciente();
            String nomeFull = nomes[i % nomes.length] + " " + sobrenomes[random.nextInt(sobrenomes.length)];

            p.setNome(nomeFull);
            p.setEmail("paciente" + (i + 1) + "@email.com");
            p.setSenha("paciente123");
            p.setCpf(gerarCpfValido());
            p.setTelefone("(11) 97000-" + String.format("%04d", i));
            p.setPerfil(PerfilUsuario.PACIENTE);
            p.setGenero(i % 2 == 0 ? "F" : "M");
            p.setDataNascimento(LocalDate.of(1985 + (i % 25), 3, 10));
            p.setIsAtivo(true);
            p.setObservacoesMedicas(i % 7 == 0 ? "Hipertenso e alérgico" : "Sem observações");

            criarEndereco(pacienteRepository.save(p));
        }
    }

    private void criarEndereco(Usuario usuario) {
        Endereco endereco = new Endereco();
        endereco.setUsuario(usuario);
        endereco.setRua("Avenida Principal");
        endereco.setNumero(String.valueOf(100 + random.nextInt(900)));
        endereco.setBairro("Centro");
        endereco.setCidade("São Paulo");
        endereco.setUf("SP");
        endereco.setCep("01310100");
        endereco.setIsPrincipal(true);
        enderecoRepository.save(endereco);
    }

    private String gerarCpfValido() {
        int n = 9;
        int n1 = random.nextInt(n);
        int n2 = random.nextInt(n);
        int n3 = random.nextInt(n);
        int n4 = random.nextInt(n);
        int n5 = random.nextInt(n);
        int n6 = random.nextInt(n);
        int n7 = random.nextInt(n);
        int n8 = random.nextInt(n);
        int n9 = random.nextInt(n);

        int d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;
        d1 = 11 - (d1 % 11);
        if (d1 >= 10) d1 = 0;

        int d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;
        d2 = 11 - (d2 % 11);
        if (d2 >= 10) d2 = 0;

        return String.format("%d%d%d%d%d%d%d%d%d%d%d", n1, n2, n3, n4, n5, n6, n7, n8, n9, d1, d2);
    }
}


/*@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final DentistaRepository dentistaRepository;
    private final PacienteRepository pacienteRepository;
    private final EnderecoRepository enderecoRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (usuarioRepository.count() == 0) {
            criarAdmin();
            criarRecepcionista();
            criarDentistas();
            criarPacientes();
        }
    }

    private void criarAdmin() {
        Usuario admin = new Usuario();
        admin.setNome("Administrador Sistema");
        admin.setEmail("admin@odonto.com");
        admin.setSenha("admin123");
        admin.setCpf("01442459069"); // Corrigido
        admin.setTelefone("(11) 99999-0000");
        admin.setPerfil(PerfilUsuario.ADMIN);
        admin.setGenero("M");
        admin.setDataNascimento(LocalDate.of(1980, 1, 15));
        admin.setIsAtivo(true);
        criarEndereco(usuarioRepository.save(admin));
    }

    private void criarRecepcionista() {
        Usuario recep = new Usuario();
        recep.setNome("Recepcionista Padrão");
        recep.setEmail("recepcao@odonto.com");
        recep.setSenha("recepcao123");
        recep.setCpf("48259316005"); // Corrigido
        recep.setTelefone("(11) 99999-0001");
        recep.setPerfil(PerfilUsuario.RECEPCAO);
        recep.setGenero("F");
        recep.setDataNascimento(LocalDate.of(1990, 5, 20));
        recep.setIsAtivo(true);
        criarEndereco(usuarioRepository.save(recep));
    }

    private void criarDentistas() {
        Dentista d1 = new Dentista();
        d1.setNome("Dra. Ana Paula Souza");
        d1.setEmail("ana@odonto.com");
        d1.setSenha("dentista123");
        d1.setCpf("31343173035"); // Corrigido
        d1.setTelefone("(11) 98888-0002");
        d1.setPerfil(PerfilUsuario.DENTISTA);
        d1.setGenero("F");
        d1.setDataNascimento(LocalDate.of(1988, 3, 22));
        d1.setIsAtivo(true);
        d1.setCro("SP-11111");
        criarEndereco(dentistaRepository.save(d1));

        Dentista d2 = new Dentista();
        d2.setNome("Dr. Carlos Eduardo Lima");
        d2.setEmail("carlos@odonto.com");
        d2.setSenha("dentista123");
        d2.setCpf("49296854008"); // Corrigido
        d2.setTelefone("(11) 98888-0003");
        d2.setPerfil(PerfilUsuario.DENTISTA);
        d2.setGenero("M");
        d2.setDataNascimento(LocalDate.of(1985, 7, 10));
        d2.setIsAtivo(true);
        d2.setCro("SP-22222");
        criarEndereco(dentistaRepository.save(d2));

        Dentista d3 = new Dentista();
        d3.setNome("Dra. Fernanda Oliveira");
        d3.setEmail("fernanda@odonto.com");
        d3.setSenha("dentista123");
        d3.setCpf("98349487003"); // Corrigido
        d3.setTelefone("(11) 98888-0004");
        d3.setPerfil(PerfilUsuario.DENTISTA);
        d3.setGenero("F");
        d3.setDataNascimento(LocalDate.of(1992, 11, 5));
        d3.setIsAtivo(false);
        d3.setCro("SP-33333");
        criarEndereco(dentistaRepository.save(d3));
    }

    private void criarPacientes() {
        Paciente p1 = new Paciente();
        p1.setNome("João Silva Santos");
        p1.setEmail("joao@email.com");
        p1.setSenha("paciente123");
        p1.setCpf("73885580047"); // Corrigido
        p1.setTelefone("(11) 97777-0001");
        p1.setPerfil(PerfilUsuario.PACIENTE);
        p1.setGenero("M");
        p1.setDataNascimento(LocalDate.of(1995, 4, 12));
        p1.setIsAtivo(true);
        p1.setObservacoesMedicas("Alérgico a penicilina");
        criarEndereco(pacienteRepository.save(p1));

        Paciente p2 = new Paciente();
        p2.setNome("Maria Fernanda Costa");
        p2.setEmail("maria@email.com");
        p2.setSenha("paciente123");
        p2.setCpf("05165626067"); // Corrigido
        p2.setTelefone("(11) 97777-0002");
        p2.setPerfil(PerfilUsuario.PACIENTE);
        p2.setGenero("F");
        p2.setDataNascimento(LocalDate.of(1990, 9, 25));
        p2.setIsAtivo(true);
        p2.setObservacoesMedicas("Hipertensa");
        criarEndereco(pacienteRepository.save(p2));

        Paciente p3 = new Paciente();
        p3.setNome("Pedro Henrique Alves");
        p3.setEmail("pedro@email.com");
        p3.setSenha("paciente123");
        p3.setCpf("13270397020"); // Corrigido
        p3.setTelefone("(11) 97777-0003");
        p3.setPerfil(PerfilUsuario.PACIENTE);
        p3.setGenero("M");
        p3.setDataNascimento(LocalDate.of(2000, 2, 8));
        p3.setIsAtivo(true);
        p3.setObservacoesMedicas("Sem observações");
        criarEndereco(pacienteRepository.save(p3));

        Paciente p4 = new Paciente();
        p4.setNome("Juliana Rodrigues Martins");
        p4.setEmail("juliana@email.com");
        p4.setSenha("paciente123");
        p4.setCpf("25618636034"); // Corrigido
        p4.setTelefone("(11) 97777-0004");
        p4.setPerfil(PerfilUsuario.PACIENTE);
        p4.setGenero("F");
        p4.setDataNascimento(LocalDate.of(1987, 6, 30));
        p4.setIsAtivo(true);
        p4.setObservacoesMedicas("Diabética");
        criarEndereco(pacienteRepository.save(p4));

        Paciente p5 = new Paciente();
        p5.setNome("Lucas Mendes Pereira");
        p5.setEmail("lucas@email.com");
        p5.setSenha("paciente123");
        p5.setCpf("72674489090"); // Corrigido
        p5.setTelefone("(11) 97777-0005");
        p5.setPerfil(PerfilUsuario.PACIENTE);
        p5.setGenero("M");
        p5.setDataNascimento(LocalDate.of(1993, 12, 17));
        p5.setIsAtivo(true);
        p5.setObservacoesMedicas("Sem observações");
        criarEndereco(pacienteRepository.save(p5));
    }

    private void criarEndereco(Usuario usuario) {
        Endereco endereco = new Endereco();
        endereco.setUsuario(usuario);
        endereco.setRua("Rua das Flores");
        endereco.setNumero("123");
        endereco.setBairro("Centro");
        endereco.setCidade("São Paulo");
        endereco.setUf("SP");
        endereco.setCep("01310100");
        endereco.setIsPrincipal(true);
        enderecoRepository.save(endereco);
    }
}*/