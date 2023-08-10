package com.OdontoHelp.BackEnd.config;

import com.OdontoHelp.BackEnd.Service.ObservacaoService;
import com.OdontoHelp.BackEnd.Service.PacienteService;
import com.OdontoHelp.BackEnd.entities.Paciente;
import com.OdontoHelp.BackEnd.entities.models.Endereco;
import com.OdontoHelp.BackEnd.entities.models.Observacao;
import com.OdontoHelp.BackEnd.entities.models.enums.Genero;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.ArrayList;
import java.util.List;

@Component
public class TestDatabaseConfig implements CommandLineRunner {

    @Autowired
    private PacienteService pacienteService;

    @Autowired
    ObservacaoService observacaoService;

    @Override
    public void run(String... args) throws Exception {
        popularBancoDeDadosComPacientesDeTeste();
        // Outras ações de inicialização...
    }

   public void popularBancoDeDadosComPacientesDeTeste() {

        /*
        List<Observacao> observacoesPaciente1 = new ArrayList<>();
        observacoesPaciente1.add(new Observacao("caiu da bike e quebrou o dente", LocalDateTime.now()));
        observacoesPaciente1.add(new Observacao("implante dentario", LocalDateTime.now()));*/




        Paciente paciente1 = new Paciente(null, "jaiminho", LocalDate.of(1990, Month.JANUARY, 1),
                Genero.MALE, "12345678901", "jaiminho@gmail.com", "19912213344",
                new Endereco("rua do chaves", "71", "Bairro Exemplo", "tangamandapio", "12345"),null);


        pacienteService.salvarPaciente(paciente1);




        List<Observacao> observacoesPaciente2 = new ArrayList<>();
        observacoesPaciente2.add(new Observacao("colocar aparelho", LocalDateTime.now()));

        Paciente paciente2 = new Paciente(null, "pato", LocalDate.of(1985, Month.FEBRUARY, 15),
                Genero.FEMALE, "98765432109", "patogamer@gmail.com", "123456789",
                new Endereco("rua dos patos", "456", "Bairro Teste", "patolandia", "54321"),
                observacoesPaciente2);

        pacienteService.salvarPaciente(paciente2);

        // Outros pacientes...
    }
}