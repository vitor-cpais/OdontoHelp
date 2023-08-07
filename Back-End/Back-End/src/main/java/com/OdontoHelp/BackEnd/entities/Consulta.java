package com.OdontoHelp.BackEnd.entities;
import com.OdontoHelp.BackEnd.entities.models.Observacao;
import com.OdontoHelp.BackEnd.entities.models.enums.StatusConsulta;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Consulta {

    private Long ID;
    private LocalDateTime dataHoraConsulta;
    private Paciente paciente;
    private Dentista dentista;
    private Observacao observacao;
    private StatusConsulta statusConsulta;

}
