package com.OdontoHelp.BackEnd.config;

import com.OdontoHelp.BackEnd.entities.Consulta;
import com.OdontoHelp.BackEnd.entities.Dentista;
import com.OdontoHelp.BackEnd.entities.Paciente;
import com.OdontoHelp.BackEnd.entities.util.Endereco;
import com.OdontoHelp.BackEnd.entities.util.enums.EspecializacaoDentista;
import com.OdontoHelp.BackEnd.entities.util.enums.Genero;
import com.OdontoHelp.BackEnd.entities.util.enums.StatusConsulta;
import com.OdontoHelp.BackEnd.service.ConsultaService;
import com.OdontoHelp.BackEnd.service.DentistaService;
import com.OdontoHelp.BackEnd.service.PacienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;

@Component
public class TestDatabaseConfig implements CommandLineRunner {

    @Autowired
    private PacienteService pacienteService;

    @Autowired
    private ConsultaService consultaService;


    @Autowired
    private DentistaService dentistaService;


    @Override
    public void run(String... args) throws Exception {
        popularBancoDeDadosComPacientesDeTeste();
        // Outras ações de inicialização...
    }

    public void popularBancoDeDadosComPacientesDeTeste() {

// CADASTRO PACIENTE>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


        Paciente paciente1 = new Paciente(null, "jaiminho", LocalDate.of(1990, Month.JANUARY, 1),
                Genero.MALE, "12345678901", "jaiminho@gmail.com", "19912213344",
                new Endereco("rua do chaves", "71", "vila do chaves", "tangamandapio", "12345"));


        pacienteService.salvarPaciente(paciente1);


        Paciente paciente2 = new Paciente(null, "pato", LocalDate.of(1985, Month.FEBRUARY, 15),
                Genero.FEMALE, "98765432109", "patogamer@gmail.com", "123456789",
                new Endereco("rua dos patos", "456", "duck streets", "patolandia", "54321"));

        pacienteService.salvarPaciente(paciente2);


// CADASTRO DENTISTAS>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


        Dentista dentista1 = new Dentista(null, "Maria Julia", EspecializacaoDentista.CLINICO_GERAL,
                "67999198739", "maju@gmail.com");


        dentistaService.salvarDentista(dentista1);


//  CADASTRO CONSULTA>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


        Consulta consulta1 = new Consulta();
        consulta1.setDataHoraConsulta(LocalDateTime.of(2023, Month.DECEMBER, 6, 14, 30));
        consulta1.setPaciente(paciente1);
        consulta1.setDentista(dentista1);
        consulta1.setStatusConsulta(StatusConsulta.AGENDADA);

        consultaService.salvarConsulta(consulta1);

    }
}