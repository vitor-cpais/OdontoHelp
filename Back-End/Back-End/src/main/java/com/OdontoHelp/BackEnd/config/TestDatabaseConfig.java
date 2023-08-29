package com.OdontoHelp.BackEnd.config;

import com.OdontoHelp.BackEnd.service.ObservacaoService;
import com.OdontoHelp.BackEnd.service.PacienteService;
import com.OdontoHelp.BackEnd.entities.Paciente;
import com.OdontoHelp.BackEnd.entities.models.Endereco;
import com.OdontoHelp.BackEnd.entities.models.enums.Genero;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.Month;

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




        Paciente paciente1 = new Paciente(null, "jaiminho", LocalDate.of(1990, Month.JANUARY, 1),
                Genero.MALE, "12345678901", "jaiminho@gmail.com", "19912213344",
                new Endereco("rua do chaves", "71", "vila do chaves", "tangamandapio", "12345"));


        pacienteService.salvarPaciente(paciente1);






        Paciente paciente2 = new Paciente(null, "pato", LocalDate.of(1985, Month.FEBRUARY, 15),
                Genero.FEMALE, "98765432109", "patogamer@gmail.com", "123456789",
                new Endereco("rua dos patos", "456", "duck streets", "patolandia", "54321"));

        pacienteService.salvarPaciente(paciente2);


    }
}