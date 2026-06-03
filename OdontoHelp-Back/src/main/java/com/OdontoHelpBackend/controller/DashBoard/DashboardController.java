package com.OdontoHelpBackend.controller.DashBoard;

import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Dashboard.Response.AgendamentoStatusDTO;
import com.OdontoHelpBackend.dto.Dashboard.Response.DashboardResumoDTO;
import com.OdontoHelpBackend.service.DashBoard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ResponseEntity<DashboardResumoDTO> resumo(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(dashboardService.resumo(usuario));
    }

    @GetMapping("/agendamentos-por-status")
    public ResponseEntity<List<AgendamentoStatusDTO>> agendamentosPorStatus(
            @RequestParam
            LocalDate dataInicio,
            @RequestParam
            LocalDate dataFim,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(dashboardService.agendamentosPorStatus(dataInicio, dataFim, usuario));
    }
}