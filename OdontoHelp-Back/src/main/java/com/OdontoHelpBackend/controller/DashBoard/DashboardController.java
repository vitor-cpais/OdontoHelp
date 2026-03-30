package com.OdontoHelpBackend.controller.DashBoard;

import com.OdontoHelpBackend.dto.Dashboard.Response.AgendamentoStatusDTO;
import com.OdontoHelpBackend.dto.Dashboard.Response.DashboardResumoDTO;
import com.OdontoHelpBackend.service.DashBoard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/resumo")
    public ResponseEntity<DashboardResumoDTO> resumo() {
        return ResponseEntity.ok(dashboardService.resumo());
    }

    @GetMapping("/agendamentos-por-status")
    public ResponseEntity<List<AgendamentoStatusDTO>> agendamentosPorStatus(
            @RequestParam
            LocalDate dataInicio,
            @RequestParam
            LocalDate dataFim) {
        return ResponseEntity.ok(dashboardService.agendamentosPorStatus(dataInicio, dataFim));
    }
}