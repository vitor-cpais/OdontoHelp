package br.com.odontohelp.fiscal.exception;

import br.com.odontohelp.fiscal.dto.ErroResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> handleGenerico(Exception ex, HttpServletRequest request) {
        log.error("Erro nao tratado", ex);
        return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "Erro interno no servidor", request);
    }

    @ExceptionHandler(AcessoNegadoException.class)
    public ResponseEntity<ErroResponse> handleAcessoNegado(AcessoNegadoException ex, HttpServletRequest request) {
        return erro(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage(), request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErroResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        return erro(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), request);
    }

    @ExceptionHandler(NfseNaoEncontradaException.class)
    public ResponseEntity<ErroResponse> handleNfseNaoEncontrada(NfseNaoEncontradaException ex, HttpServletRequest request) {
        return erro(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), request);
    }

    @ExceptionHandler(ProvedorNaoEncontradoException.class)
    public ResponseEntity<ErroResponse> handleProvedorNaoEncontrado(ProvedorNaoEncontradoException ex, HttpServletRequest request) {
        return erro(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), request);
    }

    @ExceptionHandler(OperacaoInvalidaException.class)
    public ResponseEntity<ErroResponse> handleOperacaoInvalida(OperacaoInvalidaException ex, HttpServletRequest request) {
        return erro(HttpStatus.UNPROCESSABLE_ENTITY, "Unprocessable Entity", ex.getMessage(), request);
    }

    @ExceptionHandler(ProvedorFiscalException.class)
    public ResponseEntity<ErroResponse> handleProvedorFiscal(ProvedorFiscalException ex, HttpServletRequest request) {
        String mensagem = ex.getCodigoFiscal() + ": " + ex.getMessage();
        return erro(HttpStatus.UNPROCESSABLE_ENTITY, "Unprocessable Entity", mensagem, request);
    }

    @ExceptionHandler(AssinaturaDigitalException.class)
    public ResponseEntity<ErroResponse> handleAssinatura(AssinaturaDigitalException ex, HttpServletRequest request) {
        return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> handleValidacao(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String campos = ex.getBindingResult().getFieldErrors().stream()
                .map(this::formatarCampo)
                .collect(Collectors.joining("; "));
        return erro(HttpStatus.BAD_REQUEST, "Bad Request", campos, request);
    }

    private String formatarCampo(FieldError error) {
        return error.getField() + ": " + error.getDefaultMessage();
    }

    private ResponseEntity<ErroResponse> erro(HttpStatus status, String erro, String mensagem, HttpServletRequest request) {
        ErroResponse body = new ErroResponse(
                Instant.now(),
                status.value(),
                erro,
                mensagem,
                request.getRequestURI()
        );
        return ResponseEntity.status(status).body(body);
    }
}
