package com.OdontoHelpBackend.service.Arquivo;

import com.OdontoHelpBackend.domain.Arquivo.Arquivo;
import com.OdontoHelpBackend.domain.Arquivo.Enums.TipoArquivo;
import com.OdontoHelpBackend.domain.Clinico.Atendimento;
import com.OdontoHelpBackend.domain.usuario.Paciente;
import com.OdontoHelpBackend.domain.usuario.Usuario;
import com.OdontoHelpBackend.dto.Arquivo.ArquivoResponseDTO;
import com.OdontoHelpBackend.infra.exception.BusinessException;
import com.OdontoHelpBackend.infra.exception.NotFoundException;
import com.OdontoHelpBackend.infra.storage.StorageProperties;
import com.OdontoHelpBackend.infra.storage.StorageService;
import com.OdontoHelpBackend.repository.Arquivo.ArquivoRepository;
import com.OdontoHelpBackend.service.Clinico.AtendimentoService;
import com.OdontoHelpBackend.service.Usuario.PacienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArquivoService {

    private static final Set<String> MIME_PERMITIDOS = Set.of(
            "image/jpeg", "image/png", "image/webp", "application/pdf"
    );

    private static final Set<TipoArquivo> TIPOS_PACIENTE = EnumSet.of(
            TipoArquivo.DOCUMENTO_IDENTIDADE,
            TipoArquivo.FOTO_PACIENTE,
            TipoArquivo.MODELO_BUCAL,
            TipoArquivo.RADIOGRAFIA,
            TipoArquivo.LAUDO,
            TipoArquivo.OUTRO
    );

    private static final Set<TipoArquivo> TIPOS_ATENDIMENTO = EnumSet.of(
            TipoArquivo.RECEITA_ATESTADO,
            TipoArquivo.LAUDO,
            TipoArquivo.RADIOGRAFIA
    );

    private final ArquivoRepository arquivoRepository;
    private final PacienteService pacienteService;
    private final AtendimentoService atendimentoService;
    private final StorageService storageService;
    private final StorageProperties storageProperties;

    public List<ArquivoResponseDTO> listar(Long pacienteId, TipoArquivo tipo, Long atendimentoId) {
        validarPaciente(pacienteId);
        List<Arquivo> arquivos;
        if (atendimentoId != null) {
            arquivos = arquivoRepository.findByPacienteIdAndAtendimentoIdOrderByCriadoEmDesc(pacienteId, atendimentoId);
        } else if (tipo != null) {
            arquivos = arquivoRepository.findByPacienteIdAndTipoOrderByCriadoEmDesc(pacienteId, tipo);
        } else {
            arquivos = arquivoRepository.findByPacienteIdOrderByCriadoEmDesc(pacienteId);
        }
        return arquivos.stream().map(this::toResponse).toList();
    }

    public ArquivoResponseDTO buscarFotoPrincipal(Long pacienteId) {
        validarPaciente(pacienteId);
        return arquivoRepository.findByPacienteIdAndTipoAndPrincipalTrue(pacienteId, TipoArquivo.FOTO_PACIENTE)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional
    public ArquivoResponseDTO upload(Long pacienteId, MultipartFile file, TipoArquivo tipo,
                                     String descricao, Integer numeroDente, Boolean principal,
                                     Usuario usuario) {
        return uploadInterno(pacienteId, null, file, tipo, descricao, numeroDente, principal, usuario);
    }

    @Transactional
    public ArquivoResponseDTO uploadPorAtendimento(Long atendimentoId, MultipartFile file, TipoArquivo tipo,
                                                   String descricao, Integer numeroDente, Usuario usuario) {
        Atendimento atendimento = atendimentoService.buscarEntidadePorId(atendimentoId);
        if (!TIPOS_ATENDIMENTO.contains(tipo)) {
            throw new BusinessException("Tipo de arquivo não permitido no atendimento: " + tipo);
        }
        if (tipo == TipoArquivo.RECEITA_ATESTADO && atendimento == null) {
            throw new BusinessException("Receita/atestado exige vínculo com atendimento");
        }
        return uploadInterno(
                atendimento.getPaciente().getId(),
                atendimento,
                file,
                tipo,
                descricao,
                numeroDente,
                false,
                usuario
        );
    }

    @Transactional
    public void excluir(Long pacienteId, Long arquivoId) {
        Arquivo arquivo = buscarPorPaciente(pacienteId, arquivoId);
        storageService.delete(arquivo.getStorageKey());
        arquivoRepository.delete(arquivo);
    }

    public ResponseEntity<InputStreamResource> download(Long pacienteId, Long arquivoId) {
        Arquivo arquivo = buscarPorPaciente(pacienteId, arquivoId);
        InputStreamResource resource = new InputStreamResource(storageService.download(arquivo.getStorageKey()));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(arquivo.getMimeType()))
                .header("Content-Disposition", "inline; filename=\"" + arquivo.getNomeOriginal() + "\"")
                .body(resource);
    }

    private ArquivoResponseDTO uploadInterno(Long pacienteId, Atendimento atendimento, MultipartFile file,
                                             TipoArquivo tipo, String descricao, Integer numeroDente,
                                             Boolean principal, Usuario usuario) {
        Paciente paciente = pacienteService.buscarEntidadePorId(pacienteId);
        validarTipoUpload(tipo, atendimento);
        validarArquivo(file);
        validarNumeroDente(tipo, numeroDente);

        boolean marcarPrincipal = Boolean.TRUE.equals(principal) && tipo == TipoArquivo.FOTO_PACIENTE;
        if (marcarPrincipal) {
            arquivoRepository.limparPrincipal(pacienteId, TipoArquivo.FOTO_PACIENTE);
        }

        String extensao = extrairExtensao(file.getOriginalFilename(), file.getContentType());
        String storageKey = pacienteId + "/" + tipo.name() + "/" + UUID.randomUUID() + extensao;

        try {
            storageService.upload(storageKey, file.getInputStream(), file.getSize(), file.getContentType());
        } catch (IOException e) {
            throw new BusinessException("Falha ao ler arquivo enviado");
        }

        Arquivo arquivo = new Arquivo();
        arquivo.setPaciente(paciente);
        arquivo.setAtendimento(atendimento);
        arquivo.setTipo(tipo);
        arquivo.setNomeOriginal(sanitizarNome(file.getOriginalFilename()));
        arquivo.setMimeType(file.getContentType());
        arquivo.setTamanhoBytes(file.getSize());
        arquivo.setStorageKey(storageKey);
        arquivo.setDescricao(descricao != null && !descricao.isBlank() ? descricao.trim() : null);
        arquivo.setNumeroDente(numeroDente);
        arquivo.setPrincipal(marcarPrincipal);
        arquivo.setCriadoPor(usuario);

        return toResponse(arquivoRepository.save(arquivo));
    }

    private void validarTipoUpload(TipoArquivo tipo, Atendimento atendimento) {
        if (atendimento != null) {
            if (!TIPOS_ATENDIMENTO.contains(tipo)) {
                throw new BusinessException("Tipo de arquivo não permitido no atendimento");
            }
            return;
        }
        if (!TIPOS_PACIENTE.contains(tipo)) {
            throw new BusinessException("Receita/atestado deve ser enviado pelo atendimento");
        }
    }

    private void validarNumeroDente(TipoArquivo tipo, Integer numeroDente) {
        if (tipo == TipoArquivo.RADIOGRAFIA && numeroDente == null) {
            throw new BusinessException("Radiografia exige o número do dente (FDI)");
        }
    }

    private Arquivo buscarPorPaciente(Long pacienteId, Long arquivoId) {
        return arquivoRepository.findByIdAndPacienteId(arquivoId, pacienteId)
                .orElseThrow(() -> new NotFoundException("Arquivo não encontrado"));
    }

    private void validarPaciente(Long pacienteId) {
        pacienteService.buscarEntidadePorId(pacienteId);
    }

    private void validarArquivo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Arquivo obrigatório");
        }
        String mime = file.getContentType();
        if (mime == null || !MIME_PERMITIDOS.contains(mime)) {
            throw new BusinessException("Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou PDF");
        }
        long limite = mime.equals("application/pdf")
                ? storageProperties.getMaxPdfBytes()
                : storageProperties.getMaxImageBytes();
        if (file.getSize() > limite) {
            throw new BusinessException("Arquivo excede o tamanho máximo permitido");
        }
    }

    private ArquivoResponseDTO toResponse(Arquivo arquivo) {
        Long pacienteId = arquivo.getPaciente().getId();
        String url = "/pacientes/" + pacienteId + "/arquivos/" + arquivo.getId() + "/download";
        return new ArquivoResponseDTO(
                arquivo.getId(),
                pacienteId,
                arquivo.getAtendimento() != null ? arquivo.getAtendimento().getId() : null,
                arquivo.getTipo(),
                arquivo.getNomeOriginal(),
                arquivo.getMimeType(),
                arquivo.getTamanhoBytes(),
                arquivo.getDescricao(),
                arquivo.getNumeroDente(),
                arquivo.isPrincipal(),
                arquivo.getCriadoPor().getNome(),
                arquivo.getCriadoEm(),
                url
        );
    }

    private static String extrairExtensao(String nome, String mime) {
        if (nome != null && nome.contains(".")) {
            return nome.substring(nome.lastIndexOf('.')).toLowerCase();
        }
        return switch (mime) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "application/pdf" -> ".pdf";
            default -> "";
        };
    }

    private static String sanitizarNome(String nome) {
        if (nome == null || nome.isBlank()) return "arquivo";
        return nome.replaceAll("[^a-zA-Z0-9._\\- ]", "_").trim();
    }
}
